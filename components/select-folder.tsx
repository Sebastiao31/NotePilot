import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { IconFolder } from '@tabler/icons-react'

const SelectFolder = () => {
  return (
    <div className='flex flex-col gap-1'>
        <p className='text-sm text-gray-500'>Folder</p>
        <Select>
            <SelectTrigger className='w-full'>
                <IconFolder/>
                <SelectValue placeholder='Select folder' />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value='en'>English</SelectItem>
                <SelectItem value='es'>Spanish</SelectItem>
                <SelectItem value='fr'>French</SelectItem>
            </SelectContent>
        </Select>
    </div>
  )
}

export default SelectFolder