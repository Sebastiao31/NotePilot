"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { Timestamp, doc, getDoc } from 'firebase/firestore'
import MarkdownRenderer from '@/components/markdown-renderer'
import ViewTranscript from '@/components/notes/view-transcript'
import { IconClock } from '@tabler/icons-react'
import { Skeleton } from '@/components/ui/skeleton'
import AddToFolder from '@/components/notes/add-to-folder'

type NoteDoc = {
  title: string
  content: string
  summary: string
  createdAt?: Timestamp
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

  if (loading) return (
    <div className="bg-gray-100 h-full p-4">
      <div className='space-y-4 px-6 py-4 bg-white rounded-lg border border-gray-200'>
        <Skeleton className='h-7 w-2/3' />
        <div className='flex items-center gap-1.5'>
          <Skeleton className='h-6 w-40' />
        </div>
        <div>
          <Skeleton className='h-8 w-36' />
        </div>
        <div className='space-y-3'>
          <Skeleton className='h-24 w-3/4' />
          <Skeleton className='h-20 w-1/2' />
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-20 w-5/6' />
          <Skeleton className='h-16 w-2/3' />
        </div>
      </div>
    </div>
  )
  if (!note) return <div>Note not found.</div>

  const formatDate = (ts?: Timestamp) => {
    if (!ts) return ''
    const d = ts.toDate()
    const day = d.getDate().toString().padStart(2, '0')
    const mon = d.toLocaleString('en-US', { month: 'short' })
    const year = d.getFullYear()
    return `${day} ${mon}. ${year}`
  }

  return (
    <div className="bg-gray-100 h-full p-4">
    <div className='space-y-4 px-6 py-4 bg-white rounded-lg border border-gray-200'>
      <h1 className='text-2xl font-semibold'>{note.title}</h1>


      <div className='flex items-center gap-4'>
      <div>
        <AddToFolder />
      </div>

      <div className='bg-gray-50 rounded-md py-2 px-3 text-sm text-gray-500 w-fit flex items-center gap-1.5'>

        <IconClock className='w-4 h-4'/>
        <span>{formatDate(note.createdAt)}</span>
      </div>
      </div>

      <div>
        <ViewTranscript content={note.content} />
      </div>


      <MarkdownRenderer content={note.summary} showTOC />
    </div>
    </div>
  )
}
export default NotePage
