"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { IconBrain, IconLoader2, IconSparkles } from '@tabler/icons-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { db } from '@/lib/firebase'
import { addDoc, collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

type Question = { q: string; options: string[]; correct: number }
type QuizDoc = { createdAt: any; status: 'pending'|'ready'|'failed'; questions?: Question[] }

const CreateQuiz: React.FC<{ noteId: string }> = ({ noteId }) => {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [quiz, setQuiz] = useState<QuizDoc | null>(null)
  const [quizId, setQuizId] = useState<string | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [selections, setSelections] = useState<Array<number | null>>([])
  const [maxFinalizedIdx, setMaxFinalizedIdx] = useState(-1)

  useEffect(() => {
    if (!open || !quizId) return
    const unsub = onSnapshot(doc(db, 'notes', noteId, 'quizzes', quizId), (snap) => {
      if (snap.exists()) setQuiz(snap.data() as QuizDoc)
    })
    return () => unsub()
  }, [open, quizId, noteId])

  useEffect(() => {
    // Reset navigation/selection fresh on each open (do not persist across sessions)
    if (open && quiz?.questions && quiz.questions.length > 0) {
      setSelections(Array(quiz.questions.length).fill(null))
      setCurrentIdx(0)
      setSelectedIdx(null)
      setMaxFinalizedIdx(-1)
    }
    if (!open) {
      setSelections([])
      setCurrentIdx(0)
      setSelectedIdx(null)
      setMaxFinalizedIdx(-1)
    }
  }, [open, quizId, quiz?.questions?.length])

  async function generate() {
    try {
      setCreating(true)
      // read note summary/content for prompt
      const noteSnap = await getDoc(doc(db, 'notes', noteId))
      const note = noteSnap.data() as any
      setOpen(true)

      // ask server for quiz JSON
      const resp = await fetch(`/api/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: note?.title || '', content: note?.summary || note?.content || '' }),
      })
      if (!resp.ok) throw new Error('Failed to generate')
      const data = await resp.json()

      // Write quiz under the note (client-auth writes allowed by rules)
      const base = await addDoc(collection(db, 'notes', noteId, 'quizzes'), {
        createdAt: serverTimestamp(),
        status: 'ready',
        questions: data.questions ?? [],
      } as QuizDoc)
      setQuizId(base.id)
    } finally {
      setCreating(false)
    }
  }

  async function openOrCreate() {
    try {
      setCreating(true)
      setOpen(true)
      // Find the latest existing quiz (if any)
      const snap = await getDocs(
        query(collection(db, 'notes', noteId, 'quizzes'), orderBy('createdAt', 'desc'), limit(1))
      )
      if (!snap.empty) {
        setQuizId(snap.docs[0].id)
        return
      }
      await generate()
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!quiz || quiz.status !== 'ready') return // prevent closing while generating
      setOpen(v)
    }}>
      <Button onClick={() => void openOrCreate()} disabled={creating}>
        {creating ? <IconLoader2 className='animate-spin' /> : <IconBrain />}
        Take Quiz
      </Button>
      <DialogContent className='max-w-xl' showCloseButton={!!quiz && quiz.status === 'ready'} onInteractOutside={(e: any) => { if (!quiz || quiz.status !== 'ready') e.preventDefault() }}>
        <DialogHeader>
          <DialogTitle className="text-gray-400">Quiz</DialogTitle>
        </DialogHeader>
        {!quiz || quiz.status !== 'ready' ? (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <IconLoader2 className='animate-spin' /> Generating quiz…
          </div>
        ) : (
          <div className='space-y-4'>
            {(() => {
              const q = quiz.questions?.[currentIdx]
              if (!q) return null
              const isAnswered = selectedIdx != null
              return (
                <div className='space-y-3'>
                  <div className='font-medium mb-6'>
                    {currentIdx + 1}.{' '}
                    <span className='align-middle'>
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {q.q}
                      </ReactMarkdown>
                    </span>
                  </div>
                  <ul className='space-y-3'>
                    {q.options.map((opt, i) => {
                      const base = 'rounded-md border px-3 py-3 text-sm cursor-pointer'
                      const selected = selectedIdx === i
                      const correct = i === q.correct
                      const answered = selections[currentIdx] != null
                      const pickedWrong = answered && selections[currentIdx] !== q.correct
                      const showCorrect = pickedWrong && correct
                      const isLocked = currentIdx <= maxFinalizedIdx
                      let cls = 'border-gray-300'
                      if (selected) {
                        cls = correct ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'
                      } else if (showCorrect) {
                        cls = 'border-emerald-500 bg-emerald-50'
                      }
                      return (
                        <li
                          key={i}
                          className={`${base} ${cls} ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                          onClick={() => {
                            if (isLocked) return
                            setSelectedIdx(i)
                            setSelections((prev) => {
                              const copy = [...prev]
                              copy[currentIdx] = i
                              return copy
                            })
                          }}
                        >
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {opt}
                          </ReactMarkdown>
                        </li>
                      )
                    })}
                  </ul>
                  <div className='flex items-center justify-between pt-6'>
                    <Button
                      variant='outline'
                      disabled={currentIdx === 0}
                      onClick={() => {
                        const nextIdx = Math.max(0, currentIdx - 1)
                        setCurrentIdx(nextIdx)
                        setSelectedIdx(selections[nextIdx] ?? null)
                      }}
                    >
                      Previous
                    </Button>
                    <span className='text-xs font-medium'>{currentIdx + 1} / {quiz.questions?.length || 0}</span>
                    <div className='flex items-center gap-2'>
                      
                      <Button
                        disabled={(selections[currentIdx] == null) && currentIdx < ((quiz.questions?.length || 1) - 1)}
                        onClick={() => {
                          if (currentIdx < ((quiz.questions?.length || 1) - 1)) {
                            setMaxFinalizedIdx((prev) => Math.max(prev, currentIdx))
                            const nextIdx = currentIdx + 1
                            setCurrentIdx(nextIdx)
                            setSelectedIdx(selections[nextIdx] ?? null)
                          } else {
                            setMaxFinalizedIdx((prev) => Math.max(prev, currentIdx))
                            setOpen(false)
                          }
                        }}
                      >
                        {currentIdx < ((quiz.questions?.length || 1) - 1) ? 'Next' : 'Finish'}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreateQuiz