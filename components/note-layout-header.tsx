import { IconArrowsDiagonal, IconMessages, IconMicrophone, IconSearch, IconSparkles, IconX } from '@tabler/icons-react'
import React from 'react'

const NoteLayoutHeader = () => {
  return (
    <div className="flex items-center justify-between border-b">

        <div className="flex items-center gap-2 p-4">
            <IconSparkles />
            <h1 className="text-lg font-medium">Ask NotePilot</h1>
        </div>

        <div className="flex items-center gap-2">
            <button className="flex items-center border rounded-md p-1.5 bg-black text-white" >
                <IconMessages className="w-4 h-4" />
            </button>

            <button className="flex items-center border-gray-300 border rounded-md p-1.5 bg-white text-gray-500" >
                <IconMicrophone className="w-4 h-4" />
            </button>

            <button className="flex items-center border-gray-300 border rounded-md p-1.5 bg-white text-gray-500" >
                <IconArrowsDiagonal className="w-4 h-4" />
            </button>

            <button className="flex items-center border-gray-300 border rounded-md p-1.5 bg-white text-gray-500" >
                <IconX className="w-4 h-4" />
            </button>
        </div>



    </div>
  )
}

export default NoteLayoutHeader