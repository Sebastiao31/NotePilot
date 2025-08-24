"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { PlusIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import ColorPicker from './color-picker'
import { db } from '@/lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useAuthUser } from '@/hooks/use-auth-user'

type Props = {
  onCreate?: (folder: { name: string; color: string }) => void
}

const NewFolder = ({ onCreate }: Props) => {
  const { user } = useAuthUser()
  const [color, setColor] = useState<string>("#ef4444")
  const [name, setName] = useState<string>("")
  const [open, setOpen] = useState(false)
  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed || !user) return
    try {
      await addDoc(collection(db, 'folders'), {
        userId: user.uid,
        name: trimmed,
        color,
        createdAt: serverTimestamp(),
      })
      setOpen(false)
      setName("")
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to create folder', e)
    }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        submit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, name, color])
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new folder</DialogTitle>
        </DialogHeader>
        <div>
            <div>
                <ColorPicker value={color} onChange={setColor} />
            </div>

            <div className='flex flex-col gap-2'>
              <p>Name</p>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type='text'
                placeholder='Calculus 101'
              />
            </div>
        </div>

        <div>
            <Button
            disabled={!name.trim() || !user}
            className='w-full ' onClick={submit}>
                <PlusIcon />
                Create Folder
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NewFolder