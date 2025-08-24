"use client"
import { DataTable } from '@/components/data-table'
import FoldersContainer from '@/components/notes/folders-container'
import NewFolder from '@/components/notes/new-folder'
import React, { useEffect, useMemo, useState } from 'react'
import { useAuthUser } from '@/hooks/use-auth-user'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import SearchBar from '@/components/notes/search-bar'

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
  const [queryText, setQueryText] = useState('')

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
    const baseQ = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(
      baseQ,
      (snap) => {
        const all = snapshotToRows(snap)
        const q = queryText.trim().toLowerCase()
        setRows(
          q ? all.filter(r => r.header.toLowerCase().includes(q)) : all
        )
      },
      () => {
        // Likely missing composite index; fall back without orderBy
        const q2 = query(collection(db, 'notes'), where('userId', '==', user.uid))
        fallbackUnsub = onSnapshot(q2, (snap) => {
          const all = snapshotToRows(snap)
          const q = queryText.trim().toLowerCase()
          setRows(q ? all.filter(r => r.header.toLowerCase().includes(q)) : all)
        })
      }
    )

    return () => {
      unsub()
      if (fallbackUnsub) fallbackUnsub()
    }
  }, [user, queryText])

  return (
    <div className='px-6 py-4 '>

      <div className='mb-8'>
        <FoldersContainer />
      </div>

      <div>
        <div className='flex items-center justify-between'>
          <h1 className='font-medium'>All Notes</h1>
          <SearchBar value={queryText} onChange={setQueryText} />
        </div>
        <DataTable data={rows} />
      </div>
    </div>
  )
}

export default Notes