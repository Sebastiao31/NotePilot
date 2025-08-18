import React from 'react'
import { Button } from './ui/button'
import { IconFileTypePdf } from '@tabler/icons-react'

const UploadPdfContainer = () => {
    return (
        <div className='flex flex-col border-dashed border-2 border-gray-200 rounded-lg py-6 px-2 w-full'>
            <div className='flex flex-col gap-3 items-center justify-center'>
                <IconFileTypePdf className='text-gray-300 w-10 h-10'/>
                <div className='flex flex-col items-center justify-center'>
                    <h1 className='text-sm text-gray-500'>
                        Drag and drop your pdf here
                    </h1>
                    <p className='text-xs text-gray-400'>
                        File Supported: .pdf
                    </p>
                </div>
    
                <div className='mt-3'>
                    <Button variant='secondary'>
                        Choose PDF
                    </Button>
                </div>
            </div>
        </div>
      )
}
export default UploadPdfContainer