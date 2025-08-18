import React from 'react'
import { Button } from './ui/button'
import { IconMusic, IconUpload } from '@tabler/icons-react'
import SelectFolder from './select-folder'
import UploadAudioContainer from './upload-audio-container'

const uploadAudio = () => {
  return (
    <div className='flex flex-col border border-gray-200 rounded-lg p-2 w-full'>
        <div className='flex flex-col gap-2'>
            <div className='flex flex-col gap-1'>
                <p className='text-sm text-gray-500'>Audio</p>
                <div>
                    <UploadAudioContainer/>
                </div>
            </div>
            <SelectFolder/>
        </div>
        <div className='flex justify-center items-center mt-8'>
            <Button className='w-full'>
                <IconUpload/>
                Upload Audio
            </Button>
        </div>
    </div>
  )
}

export default uploadAudio