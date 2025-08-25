"use client"
import { IconCards, IconFlipVertical, IconLoader2, IconRepeat } from '@tabler/icons-react'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { db } from '@/lib/firebase'
import { addDoc, collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

type Flashcard = { front: string; back: string }
type FlashcardsDoc = { createdAt: any; status: 'pending'|'ready'|'failed'; cards?: Flashcard[] }

const ViewFlashcard: React.FC<{ noteId: string }> = ({ noteId }) => {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [cardsDoc, setCardsDoc] = useState<FlashcardsDoc | null>(null)
  const [cardsId, setCardsId] = useState<string | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (!open || !cardsId) return
    const unsub = onSnapshot(doc(db, 'notes', noteId, 'flashcards', cardsId), (snap) => {
      if (snap.exists()) setCardsDoc(snap.data() as FlashcardsDoc)
    })
    return () => unsub()
  }, [open, cardsId, noteId])

  useEffect(() => {
    if (open && cardsDoc?.cards && cardsDoc.cards.length > 0) {
      setCurrentIdx(0)
      setFlipped(false)
    }
    if (!open) {
      setCurrentIdx(0)
      setFlipped(false)
    }
  }, [open, cardsId, cardsDoc?.cards?.length])

  async function generate() {
    try {
      setCreating(true)
      // read note summary/content for prompt
      const noteSnap = await getDoc(doc(db, 'notes', noteId))
      const note = noteSnap.data() as any
      setOpen(true)

      const resp = await fetch(`/api/generate-flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: note?.title || '', content: note?.summary || note?.content || '' }),
      })
      if (!resp.ok) throw new Error('Failed to generate')
      const data = await resp.json()

      const base = await addDoc(collection(db, 'notes', noteId, 'flashcards'), {
        createdAt: serverTimestamp(),
        status: 'ready',
        cards: data.cards ?? [],
      } as FlashcardsDoc)
      setCardsId(base.id)
    } finally {
      setCreating(false)
    }
  }

  async function openOrCreate() {
    try {
      setCreating(true)
      setOpen(true)
      const snap = await getDocs(
        query(collection(db, 'notes', noteId, 'flashcards'), orderBy('createdAt', 'desc'), limit(1))
      )
      if (!snap.empty) {
        setCardsId(snap.docs[0].id)
        return
      }
      await generate()
    } finally {
      setCreating(false)
    }
  }

  const ready = !!cardsDoc && cardsDoc.status === 'ready'
  const total = cardsDoc?.cards?.length || 0
  const card = total > 0 ? cardsDoc!.cards![currentIdx] : null
  const pastelClasses = [
    'bg-rose-50 border-rose-200 text-rose-500 ',
    'bg-emerald-50 border-emerald-200 text-emerald-500',
    'bg-sky-50 border-sky-200 text-sky-500',
    'bg-amber-50 border-amber-200 text-amber-500',
    'bg-violet-50 border-violet-200 text-violet-500',
    'bg-teal-50 border-teal-200 text-teal-500',
  ]
  const cardColor = pastelClasses[currentIdx % pastelClasses.length]

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!ready) return; setOpen(v) }}>
      <Button onClick={() => void openOrCreate()} disabled={creating}>
        {creating ? <IconLoader2 className='animate-spin' /> : <IconCards />}
        View Flashcards
      </Button>
      <DialogContent
        className='max-w-xl'
        showCloseButton={ready}
        onInteractOutside={(e: any) => { if (!ready) e.preventDefault() }}
        onEscapeKeyDown={(e: any) => { if (!ready) e.preventDefault() }}
      >
        <DialogHeader>
          <DialogTitle>Flashcards</DialogTitle>
        </DialogHeader>
        {!ready ? (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <IconLoader2 className='animate-spin' /> Generating flashcards…
          </div>
        ) : (
          <div className='space-y-4'>
            {card && (
              <div>
                <div className="relative w-full h-48 sm:h-56 md:h-64 [perspective:1000px]" onClick={() => setFlipped((f) => !f)}>
                  <div
                    className={`my-6 relative w-full h-full rounded-lg  border-2 ${cardColor} transition-transform duration-500 ease-in-out [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(-180deg)]' : ''}`}
                  >
                    <div className={`absolute inset-0 flex items-center justify-center p-4 ${cardColor} rounded-lg [backface-visibility:hidden]`}>
                      <div className='text-center max-w-sm text-base sm:text-lg'>
                        <div className='flex items-center justify-center mb-8'>
                        <p className='text-sm font-medium flex items-center  gap-2'>
                            <IconRepeat className='size-4'/>
                            Press to flip</p>
                        </div>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {card.front}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center p-4 ${cardColor} rounded-lg [transform:rotateY(180deg)] [backface-visibility:hidden]`}>
                      <div className='text-center text-base sm:text-lg'>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {card.back}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex items-center justify-between pt-6'>
                  <Button
                    variant='outline'
                    disabled={currentIdx === 0}
                    onClick={() => { setCurrentIdx((i) => Math.max(0, i - 1)); setFlipped(false) }}
                  >
                    Previous
                  </Button>
                  <span className='text-xs font-medium'>{currentIdx + 1} / {total}</span>
                  <Button
                    onClick={() => {
                      if (currentIdx < total - 1) {
                        setCurrentIdx((i) => Math.min(total - 1, i + 1))
                        setFlipped(false)
                      } else {
                        setOpen(false)
                      }
                    }}
                  >
                    {currentIdx < total - 1 ? 'Next' : 'Finish'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ViewFlashcard