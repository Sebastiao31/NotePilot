"use client"
import React, { useState } from 'react'
import NewFolder from './new-folder'

type Folder = { id: string; name: string; color: string }

const FoldersContainer = () => {
  const [folders, setFolders] = useState<Folder[]>([])

  function handleCreate(folder: { name: string; color: string }) {
    setFolders((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: folder.name, color: folder.color },
    ])
  }
  return (
    <div>
        <div className='flex  justify-between items-center'>
            <h1 className='font-medium'>Folders</h1>
            {folders.length > 0 && (
              <div>
                <NewFolder onCreate={handleCreate} />
              </div>
            )}
        </div>
        {folders.length === 0 ? (
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
          <div className='mt-6 flex gap-4 overflow-x-auto py-1'>
            {folders.map((f) => (
              <div key={f.id} className='flex flex-col items-center min-w-[100px] p-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer'>
                <img
                  alt="folder"
                  className='h-20 w-auto '
                  src={(() => {
                    // Map selected color to closest folder SVG name
                    const hex = f.color.toLowerCase()
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
                <span className='mt-3 text-sm  truncate max-w-[100px]' title={f.name}>{f.name}</span>
              </div>
            ))}
          </div>
        )}
        
    </div>
  )
}

export default FoldersContainer