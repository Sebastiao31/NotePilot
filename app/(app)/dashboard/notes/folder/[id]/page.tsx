"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { useAuthUser } from '@/hooks/use-auth-user'
import { DataTable, type DataRow } from '@/components/data-table'

type TableRow = DataRow

export default function FolderPage() {
  const folderId = useParams<{ id: string }>().id
  const { user } = useAuthUser()
  const [rows, setRows] = useState<TableRow[]>([])
  const [folderName, setFolderName] = useState<string>('Folder')

  useEffect(() => {
    if (!folderId) return
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'folders', folderId))
        if (snap.exists()) setFolderName((snap.data() as any).name || 'Folder')
      } catch {}
    })()
  }, [folderId])

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
          folder: '',
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
      (snap) => setRows(snapshotToRows(snap)),
      () => {
        // Missing composite index; fall back without orderBy
        const q2 = query(
          collection(db, 'notes'),
          where('userId', '==', user.uid),
          where('folderId', '==', folderId)
        )
        fallbackUnsub = onSnapshot(q2, (snap) => setRows(snapshotToRows(snap)))
      }
    )
    return () => {
      unsub()
      if (fallbackUnsub) fallbackUnsub()
    }
  }, [user, folderId])

  return (
    <div className='px-6 py-4 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='font-medium'>{folderName}</h1>
      </div>
      <DataTable data={rows} hideFolderColumn />
    </div>
  )
}


