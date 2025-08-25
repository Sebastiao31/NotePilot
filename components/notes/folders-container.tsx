"use client"
import React, { useEffect, useMemo, useState } from 'react'
import NewFolder from './new-folder'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, orderBy, query, where, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore'
import { useAuthUser } from '@/hooks/use-auth-user'
import Link from 'next/link'
import { Toggle } from '@/components/ui/toggle'
import { IconCheckbox, IconTrash } from '@tabler/icons-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type Folder = { id: string; name: string; color?: string; notesCount?: number }

const FoldersContainer = () => {
  const { user } = useAuthUser()
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectMode && selectedCount > 0) {
      setSelected({})
    }
  }, [selectMode, selectedCount])

  useEffect(() => {
    if (!user) {
      setFolders([])
      setLoading(false)
      return
    }
    const snapshotToRows = (snap: any): Folder[] => {
      const rows: Folder[] = []
      snap.forEach((d: any) => rows.push({ id: d.id, ...(d.data() as Omit<Folder, 'id'>) }))
      return rows
    }

    let fallbackUnsub: (() => void) | null = null
    const q1 = query(
      collection(db, 'folders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    setLoading(true)
    const unsub = onSnapshot(
      q1,
      (snap) => {
        const rows = snapshotToRows(snap)
        setFolders(rows)
        setLoading(false)
      },
      () => {
        // If a composite index is missing, fall back without orderBy
        const q2 = query(collection(db, 'folders'), where('userId', '==', user.uid))
        fallbackUnsub = onSnapshot(q2, (snap) => {
          setFolders(snapshotToRows(snap))
          setLoading(false)
        })
      }
    )
    return () => {
      unsub()
      if (fallbackUnsub) fallbackUnsub()
    }
  }, [user])

  // Subscribe to per-folder note counts
  useEffect(() => {
    if (!user || folders.length === 0) return
    const unsubs: Array<() => void> = []
    folders.forEach((f) => {
      const qNotes = query(
        collection(db, 'notes'),
        where('userId', '==', user.uid),
        where('folderId', '==', f.id)
      )
      const u = onSnapshot(qNotes, (ns) => {
        const cnt = ns.size
        setFolders((prev) => prev.map((pf) => (pf.id === f.id ? { ...pf, notesCount: cnt } : pf)))
      })
      unsubs.push(u)
    })
    return () => unsubs.forEach((u) => u())
  }, [user, folders])

  function handleCreate(folder: { name: string; color: string }) {
    setFolders((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: folder.name, color: folder.color },
    ])
  }

  async function deleteSelected() {
    if (!user) return
    const ids = Object.keys(selected).filter((k) => selected[k])
    if (ids.length === 0) return
    try {
      for (const fid of ids) {
        // Set folderId to null for the user's notes in this folder
        const qNotes = query(collection(db, 'notes'), where('userId', '==', user.uid), where('folderId', '==', fid))
        const snap = await getDocs(qNotes)
        if (!snap.empty) {
          const batch = writeBatch(db as any)
          snap.forEach((d) => batch.update(doc(db, 'notes', d.id), { folderId: null }))
          await batch.commit()
        }
        await deleteDoc(doc(db, 'folders', fid))
      }
      setSelected({})
      setSelectMode(false)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete folders', e)
    }
  }
  return (
    <div>
        <div className='flex  justify-between items-center'>
            <h1 className='font-medium'>Folders</h1>
            {folders.length > 0 && (
              <div className='flex items-center gap-2'>
                {selectMode && selectedCount > 0 ? (
                  <Button variant='outline' size='default' onClick={() => void deleteSelected()} className='text-red-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500'>
                    <IconTrash/>
                    Delete {selectedCount} 
                  </Button>
                ) : null}
                <Toggle
                  aria-label='Select folders'
                  pressed={selectMode}
                  onPressedChange={setSelectMode}
                  className='border'
                >
                  <IconCheckbox />
                </Toggle>
                <NewFolder onCreate={handleCreate} />
              </div>
            )}
        </div>
        {loading ? (
          <div className='mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className='h-28 w-full' />
            ))}
          </div>
        ) : folders.length === 0 ? (
          <div className=' flex flex-col mt-6 items-center justify-center gap-3'>
              <div className='text-md font-semibold'>
                  No folders... yet!
              </div>
              <div className='text-sm text-muted-foreground text-center'>
                  Create folders to keep <br /> your workspace organized.
              </div>
              <div className='mt-4'>
                  <NewFolder onCreate={handleCreate} />
              </div>
          </div>
        ) : (
          <div className='mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-72 overflow-y-auto pr-2'>
            {folders.map((f) => {
              const isChecked = !!selected[f.id]
              const card = (
                <div className='flex flex-col items-center p-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer'>
                  {selectMode && (
                    <div className="align-self-start w-full mb-2" >
                      <Checkbox checked={isChecked} onCheckedChange={(v) => setSelected((m) => ({ ...m, [f.id]: !!v }))} />
                    </div>
                  )}
                  <img
                  alt="folder"
                  className='h-20 w-auto '
                  src={(() => {
                    // Map selected color to closest folder SVG name
                    const hex = (f.color ?? '#ef4444').toLowerCase()
                    if (hex === '#ef4444') return '/FoldersSVG/FolderRed.svg'
                    if (hex === '#faa307') return '/FoldersSVG/FolderOrange.svg'
                    if (hex === '#ffd900') return '/FoldersSVG/FolderYellow.svg'
                    if (hex === '#ad7a51') return '/FoldersSVG/FolderBrown.svg'
                    if (hex === '#aacc00') return '/FoldersSVG/FolderGreen.svg'
                    if (hex === '#71c1a0') return '/FoldersSVG/FolderTurquoise.svg'
                    if (hex === '#0096c7') return '/FoldersSVG/FolderBlue.svg'
                    if (hex === '#a06cd5') return '/FoldersSVG/FolderPurple.svg'
                    if (hex === '#ff7096') return '/FoldersSVG/FolderPink.svg'
                    return '/FoldersSVG/FolderRed.svg'
                  })()}
                  />
                  <span className='mt-3 text-sm  truncate max-w-[120px]' title={f.name}>{f.name}</span>
                  <span className='text-xs text-muted-foreground'>{(f.notesCount ?? 0)} notes</span>
                </div>
              )
              return selectMode ? (
                <div key={f.id} onClick={() => setSelected((m) => ({ ...m, [f.id]: !isChecked }))}>{card}</div>
              ) : (
                <Link key={f.id} href={`/dashboard/notes/folder/${f.id}`}>{card}</Link>
              )
            })}
          </div>
        )}
        
    </div>
  )
}

export default FoldersContainer