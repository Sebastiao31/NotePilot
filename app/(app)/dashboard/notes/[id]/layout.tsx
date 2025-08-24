"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

type NoteDoc = {
  title: string
  content: string
  summary: string
}

export default function NoteLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <div className='h-full'>
      <div className='flex h-full'>
        <div className='flex-1 min-w-0 h-full'>{children}</div>
        <aside className='w-full max-w-md h-full'>
          <div className='sticky top-4 border-l  p-4 h-full'>
            <h2 className='text-lg font-medium mb-2'>Original Content</h2>
            {loading ? (
              <div>Loading...</div>
            ) : note ? (
              <pre className='whitespace-pre-wrap text-sm'>{note.content}</pre>
            ) : (
              <div className='text-sm text-muted-foreground'>Not found.</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}


