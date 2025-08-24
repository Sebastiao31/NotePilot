"use client"
import { DataTable } from '@/components/data-table'
import FoldersContainer from '@/components/notes/folders-container'
import NewFolder from '@/components/notes/new-folder'
import React, { useEffect, useMemo, useState } from 'react'
import { useAuthUser } from '@/hooks/use-auth-user'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type TableRow = {
  id: number
  docId: string
  header: string
  folder: string
  source: string
  createdAt: string
}

const Notes = () => {
  const { user } = useAuthUser()
  const [rows, setRows] = useState<TableRow[]>([])

  useEffect(() => {
    if (!user) {
      setRows([])
      return
    }

    const snapshotToRows = (snap: any): TableRow[] =>
      snap.docs.map((d: any, idx: number) => {
        const created = d.get('createdAt')?.toDate?.() as Date | undefined
        const createdAt = created
          ? created.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
            })
          : '-'
        const folderId = d.get('folderId') as string | null | undefined
        return {
          id: idx + 1,
          docId: d.id,
          header: d.get('title') ?? 'Untitled',
          folder: folderId ? folderId : 'No Folder',
          source: d.get('sourceType') ?? 'text',
          createdAt,
        }
      })

    let fallbackUnsub: (() => void) | null = null
    const orderedQuery = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(
      orderedQuery,
      (snap) => {
        setRows(snapshotToRows(snap))
      },
      () => {
        // Likely missing composite index; fall back without orderBy
        const q2 = query(collection(db, 'notes'), where('userId', '==', user.uid))
        fallbackUnsub = onSnapshot(q2, (snap) => setRows(snapshotToRows(snap)))
      }
    )

    return () => {
      unsub()
      if (fallbackUnsub) fallbackUnsub()
    }
  }, [user])

  return (
    <div className='px-6 py-4'>

      <div className='mb-8'>
        <FoldersContainer />
      </div>

      <div>
        <h1 className='font-medium'>All Notes</h1>
        <DataTable data={rows} />
      </div>
    </div>
  )
}

export default Notes