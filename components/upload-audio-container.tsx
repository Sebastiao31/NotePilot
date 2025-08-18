import React from 'react'
import { IconMusic } from '@tabler/icons-react'
import { Button } from './ui/button'

const UploadAudioContainer = () => {
  return (
    <div className='flex flex-col border-dashed border-2 border-gray-200 rounded-lg py-6 px-2 w-full'>
        <div className='flex flex-col gap-3 items-center justify-center'>
            <IconMusic className='text-gray-300 w-10 h-10'/>
            <div className='flex flex-col items-center justify-center'>
                <h1 className='text-sm text-gray-500'>
                    Drag and drop your audio here
                </h1>
                <p className='text-xs text-gray-400'>
                    File Supported: .mp3, .wav, .m4a, .ogg, .flac
                </p>
            </div>

            <div className='mt-3'>
                <Button variant='secondary'>
                    Choose Audio
                </Button>
            </div>
        </div>
    </div>
  )
}

export default UploadAudioContainer