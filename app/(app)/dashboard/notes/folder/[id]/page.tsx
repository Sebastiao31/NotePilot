"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { IconFolder } from '@tabler/icons-react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, onSnapshot, orderBy, query, where, deleteDoc } from 'firebase/firestore'
import { useAuthUser } from '@/hooks/use-auth-user'
import { DataTable, type DataRow } from '@/components/data-table'
import SearchBar from '@/components/notes/search-bar'
import { Skeleton } from '@/components/ui/skeleton'

type TableRow = DataRow

export default function FolderPage() {
  const folderId = useParams<{ id: string }>().id
  const { user } = useAuthUser()
  const [rows, setRows] = useState<TableRow[]>([])
  const [folderName, setFolderName] = useState<string>('')
  const [queryText, setQueryText] = useState('')
  const [selectedRows, setSelectedRows] = useState<TableRow[]>([])
  const [resetKey, setResetKey] = useState(0)
  const [folderColor, setFolderColor] = useState<string | undefined>(undefined)
  const [folderMetaLoading, setFolderMetaLoading] = useState(true)

  useEffect(() => {
    if (!folderId) return
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'folders', folderId))
        if (snap.exists()) {
          const data = snap.data() as any
          setFolderName(data.name)
          setFolderColor(data.color)
        }
      } catch {}
      finally { setFolderMetaLoading(false) }
    })()
  }, [folderId])

  const [tableLoading, setTableLoading] = useState(true)

  useEffect(() => {
    if (!user || !folderId) return
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
        return {
          id: idx + 1,
          docId: d.id,
          header: d.get('title') ?? 'Untitled',
          folder: folderId,
          source: d.get('sourceType') ?? 'text',
          createdAt,
        }
      })

    let fallbackUnsub: (() => void) | null = null
    const qNotes = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid),
      where('folderId', '==', folderId),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(
      qNotes,
      (snap) => {
        const all = snapshotToRows(snap)
        const q = queryText.trim().toLowerCase()
        setRows(q ? all.filter(r => r.header.toLowerCase().includes(q)) : all)
        setTableLoading(false)
      },
      () => {
        // Missing composite index; fall back without orderBy
        const q2 = query(
          collection(db, 'notes'),
          where('userId', '==', user.uid),
          where('folderId', '==', folderId)
        )
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
  }, [user, folderId, queryText])

  return (
    <div className='px-6 py-5'>
      <div className='flex items-center justify-between'>
        <h1 className='font-medium text-md'>
          {folderMetaLoading ? (
            <Skeleton className='h-6 w-40' />
          ) : (
            <span className='inline-flex items-center gap-2'>
              <IconFolder className='size-5' style={{ color: folderColor ?? '#6b7280' }} />
              {folderName}
            </span>
          )}
        </h1>
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
  )
}


