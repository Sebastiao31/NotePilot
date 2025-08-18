import React from 'react'
import { Input } from './ui/input'
import SelectFolder from './select-folder'
import { Button } from './ui/button'
import { IconLink } from '@tabler/icons-react'

const WebLink = () => {
  return (
    <div className='flex flex-col border border-gray-200 rounded-lg p-2 w-full'>
        <div className='flex flex-col gap-2'>
            <div className='flex flex-col gap-1'>
                <p className='text-sm text-gray-500'>Link</p>
                <Input placeholder='youtube.com/watch/123' />
                <p className='text-xs text-gray-300'>
                    *Works with YouTube, PDFs, TikTok, Websites, Notion, Google Drive, Audio, Video, and more</p>
            </div>
            <SelectFolder/>
        </div>
        <div className='flex justify-center items-center mt-8'>
            <Button className='w-full'>
                <IconLink/>
                Summarize Link
            </Button>
        </div>
    </div>
  )
}

export default WebLink