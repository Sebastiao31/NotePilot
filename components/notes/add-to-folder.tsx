import { IconFolder } from '@tabler/icons-react'
import React from 'react'

const AddToFolder = () => {
  return (
    <div>

        <div className='flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 rounded-md py-2 px-3 hover:bg-gray-100 transition-colors cursor-pointer'>
            <IconFolder className='w-4 h-4' />
            <span >Add to Folder</span>
        </div>


    </div>
  )
}

export default AddToFolder