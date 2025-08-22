"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { PlusIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import ColorPicker from './color-picker'

type Props = {
  onCreate?: (folder: { name: string; color: string }) => void
}

const NewFolder = ({ onCreate }: Props) => {
  const [color, setColor] = useState<string>("#ef4444")
  const [name, setName] = useState<string>("")
  const [open, setOpen] = useState(false)
  const submit = () => {
    if (!name.trim()) return
    onCreate?.({ name: name.trim(), color })
    setOpen(false)
    setName("")
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    submit()
                  }
                }}
                type='text'
                placeholder='Calculus 101'
              />
            </div>
        </div>

        <div>
            <Button
            disabled={!name.trim()}
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