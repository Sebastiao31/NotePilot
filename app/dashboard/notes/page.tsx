import { DataTable } from '@/components/data-table'
import FoldersContainer from '@/components/notes/folders-container'
import NewFolder from '@/components/notes/new-folder'
import React from 'react'

const Notes = () => {
  return (
    <div className='px-6 py-4'>

      <div className='mb-8'>
        <FoldersContainer />
      </div>

      <div>
        <h1 className='font-medium'>All Notes</h1>
        <DataTable data={[]} />
      </div>
    </div>
  )
}

export default Notes