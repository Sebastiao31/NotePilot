"use client"
import { DataTable } from '@/components/data-table'
import FoldersContainer from '@/components/notes/folders-container'
import NewFolder from '@/components/notes/new-folder'
import React, { useEffect, useMemo, useState } from 'react'
import { useAuthUser } from '@/hooks/use-auth-user'
import { collection, onSnapshot, orderBy, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Skeleton } from '@/components/ui/skeleton'
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
  const [selectedRows, setSelectedRows] = useState<TableRow[]>([])
  const [resetKey, setResetKey] = useState(0)
  const [tableLoading, setTableLoading] = useState(true)

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
        setTableLoading(false)
      },
      () => {
        // Likely missing composite index; fall back without orderBy
        const q2 = query(collection(db, 'notes'), where('userId', '==', user.uid))
        fallbackUnsub = onSnapshot(q2, (snap) => {
          const all = snapshotToRows(snap)
          const q = queryText.trim().toLowerCase()
          setRows(q ? all.filter(r => r.header.toLowerCase().includes(q)) : all)
          setTableLoading(false)
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
          <div className='flex items-center gap-2'>
            {selectedRows.length > 0 ? (
              <button
                onClick={async () => {
                  try {
                    await Promise.all(selectedRows.map((r) => deleteDoc(doc(db, 'notes', r.docId))))
                    setResetKey((k) => k + 1)
                    setSelectedRows([])
                  } catch (e) {
                    console.error(e)
                  }
                }}
                className='text-red-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500 border px-3 py-2 rounded-md text-sm'
              >
                Delete {selectedRows.length}
              </button>
            ) : null}
            <SearchBar value={queryText} onChange={setQueryText} />
          </div>
        </div>
        {tableLoading ? (
          <div className='mt-4 space-y-3'>
            <Skeleton className='h-44 w-full' />
          </div>
        ) : (
          <DataTable data={rows} onSelectionChange={setSelectedRows} resetSelectionKey={resetKey} />
        )}
      </div>
    </div>
  )
}

export default Notes