"use client"
import { IconFolder } from '@tabler/icons-react'
import React, { useEffect, useMemo, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthUser } from '@/hooks/use-auth-user'

type Props = { noteId: string }

const AddToFolder: React.FC<Props> = ({ noteId }) => {
  const { user } = useAuthUser()
  const [folders, setFolders] = useState<Array<{ id: string; name: string; color?: string }>>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'folders'), where('userId', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const items: Array<{ id: string; name: string; color?: string }> = []
      snap.forEach((d) => items.push({ id: d.id, name: (d.data() as any).name || 'Folder', color: (d.data() as any).color }))
      setFolders(items)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!noteId) return
    ;(async () => {
      const snap = await getDoc(doc(db, 'notes', noteId))
      if (snap.exists()) setCurrentFolderId((snap.data() as any).folderId ?? null)
    })()
  }, [noteId])

  const currentFolder = useMemo(() => folders.find(f => f.id === currentFolderId) || null, [folders, currentFolderId])

  async function moveTo(folderId: string | null) {
    await updateDoc(doc(db, 'notes', noteId), { folderId })
    setCurrentFolderId(folderId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='flex items-center gap-1.5 text-sm  bg-gray-50 rounded-md py-2 px-3 hover:bg-gray-100 transition-colors cursor-pointer'>
          <IconFolder className='w-4 h-4' style={{ color: currentFolder?.color ?? undefined }} />
          <span>{currentFolder ? currentFolder.name : 'Add to Folder'}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        <DropdownMenuItem onClick={() => moveTo(null)}>No folder</DropdownMenuItem>
        {folders.map((f) => (
          <DropdownMenuItem key={f.id} onClick={() => moveTo(f.id)}>
            <IconFolder className='w-4 h-4' style={{ color: f.color ?? undefined }} />
            <span>{f.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AddToFolder