"use client"
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { IconLoader2, IconSend } from '@tabler/icons-react'
import { db } from '@/lib/firebase'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'

type Props = {
  noteId: string
  title: string
  summary: string
  content: string
}

type ChatMessage = {
  id?: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: any
}

const MAX_CONTEXT_CHARS = 12000

function buildContext(title: string, summary: string, content: string): string {
  const combined = `Title: ${title}\n\nSummary:\n${summary}\n\nContent:\n${content}`
  if (combined.length <= MAX_CONTEXT_CHARS) return combined
  // Prefer summary + head of content when trimming
  const headAllowance = Math.max(0, MAX_CONTEXT_CHARS - (`Title: ${title}\n\nSummary:\n${summary}\n\nContent:\n`).length)
  return `Title: ${title}\n\nSummary:\n${summary}\n\nContent (truncated):\n${content.slice(0, headAllowance)}`
}

const NoteChat: React.FC<Props> = ({ noteId, title, summary, content }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [permError, setPermError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const context = useMemo(() => buildContext(title, summary, content), [title, summary, content])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading])

  useEffect(() => {
    const q = query(collection(db, 'notes', noteId, 'messages'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPermError(null)
        const rows: ChatMessage[] = []
        snap.forEach((doc) => rows.push({ id: doc.id, ...(doc.data() as Omit<ChatMessage, 'id'>) }))
        setMessages(rows)
      },
      (err) => {
        setPermError(err.code || 'permission-denied')
      }
    )
    return () => unsub()
  }, [noteId])

  const send = useCallback(async () => {
    const question = input.trim()
    if (!question || loading) return
    setInput('')
    await addDoc(collection(db, 'notes', noteId, 'messages'), {
      role: 'user',
      content: question,
      createdAt: serverTimestamp(),
    })
    setLoading(true)
    try {
      const res = await fetch('/api/ask-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to get answer')
      const answer = data.answer as string
      await addDoc(collection(db, 'notes', noteId, 'messages'), {
        role: 'assistant',
        content: answer,
        createdAt: serverTimestamp(),
      })
    } catch (e) {
      await addDoc(collection(db, 'notes', noteId, 'messages'), {
        role: 'assistant',
        content: 'Sorry, I could not answer that right now.',
        createdAt: serverTimestamp(),
      })
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [input, loading, context, noteId])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  return (
    <div className='h-full flex flex-col'>
      <div ref={scrollRef} className='flex-1 overflow-y-auto space-y-3 p-4'>
        {permError ? (
          <div className='text-xs text-red-500'>
            Missing or insufficient permissions to read chat messages.
          </div>
        ) : null}
        {messages.length === 0 ? (
          <div className='text-sm text-muted-foreground'>Ask a question about this note…</div>
        ) : null}
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === 'user' ? 'ml-auto max-w-[85%] rounded-xl bg-primary text-primary-foreground px-3 py-2 text-sm' : 'mr-auto max-w-[85%] rounded-xl bg-muted px-3 py-2 text-sm'}>
            {m.content}
          </div>
        ))}
        {loading ? (
          <div className='mr-auto inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm'>
            <IconLoader2 className='animate-spin' /> Thinking…
          </div>
        ) : null}
      </div>
      <div className='border-t p-3'>
        <div className='flex items-center gap-2'>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder='Type your question and press Enter…'
          />
          <Button size='icon' disabled={!input.trim() || loading} onClick={() => void send()} aria-busy={loading}>
            {loading ? <IconLoader2 className='animate-spin' /> : <IconSend />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NoteChat


