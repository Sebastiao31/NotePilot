import React from 'react'
import { Input } from './ui/input'
import SelectFolder from './select-folder'
import { Button } from './ui/button'
import { IconUpload } from '@tabler/icons-react'
import { Textarea } from './ui/textarea'
import UploadAudio from './upload-audio'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import UploadPdfContainer from './upload-pdf-container'

const UploadPdfText = () => {
  return (
    <div className='flex flex-col border border-gray-200 rounded-lg p-2 w-full'>
        <div className='flex flex-col gap-2'>
            <Tabs defaultValue="pdf" className="w-full max-w-2xl">
            <TabsList className="gap-3 w-full justify-start">
            <TabsTrigger value="pdf">
                PDF
            </TabsTrigger>
            <TabsTrigger value="text">
                Text
            </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className='flex flex-col gap-1'>
                <p className='text-sm text-gray-500'>PDF</p>
                <UploadPdfContainer/>
            </TabsContent>
            <TabsContent value="text">
                <div className='flex flex-col gap-1'>
                    <p className='text-sm text-gray-500'>Text</p>
                    <Textarea placeholder='Write something here...' />
                </div>
            </TabsContent>
            </Tabs>
            <div>
                <SelectFolder/>
            </div>
        </div>

        

        <div className='flex justify-center items-center mt-9'>
            <Button className='w-full'>
                <IconUpload/>
                Summarize PDF/Text
            </Button>
        </div>
    </div>
  )
}

export default UploadPdfText