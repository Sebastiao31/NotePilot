"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { RightSidebar, RightSidebarInset, RightSidebarProvider } from '@/components/ui/right-sidebar'
import NoteLayoutHeader from '@/components/note-layout-header'
import NoteChat from '@/components/notes/note-chat'

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
    <RightSidebarProvider>
      <RightSidebarInset>
        {children}
      </RightSidebarInset>
      <RightSidebar>
        <div className='flex h-full flex-col'>
          <div className='shrink-0 border-b'>
            <NoteLayoutHeader />
          </div>
          <div className='min-h-0 flex-1'>
            {loading || !note ? null : (
              <NoteChat noteId={params.id} title={note.title} summary={note.summary} content={note.content} />
            )}
          </div>
        </div>
      </RightSidebar>
    </RightSidebarProvider>
  )
}


