"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import MarkdownRenderer from '@/components/markdown-renderer'

type NoteDoc = {
  title: string
  content: string
  summary: string
}

const NotePage = () => {
  const params = useParams<{ id: string }>()
  const [note, setNote] = useState<NoteDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params?.id
    if (!id) return
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'notes', id))
        if (snap.exists()) setNote(snap.data() as NoteDoc)
      } finally {
        setLoading(false)
      }
    })()
  }, [params])

  if (loading) return <div>Loading...</div>
  if (!note) return <div>Note not found.</div>

  return (
    <div className="bg-gray-100 h-full p-4">
    <div className='space-y-4 px-6 py-4 bg-white rounded-lg border border-gray-200'>
      <h1 className='text-2xl font-semibold'>{note.title}</h1>
      <MarkdownRenderer content={note.summary} showTOC />
    </div>
    </div>
  )
}
export default NotePage
