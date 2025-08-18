import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconLink, IconLetterCase, IconMicrophone, IconMusic } from '@tabler/icons-react'
import RecordAudio from '@/components/record-audio'
import WebLink from '@/components/web-link'
import UploadPdfText from '@/components/upload-pdf-text'
import UploadAudio from '@/components/upload-audio'

const NewNote = () => {
  return (
    <div className="flex w-full justify-center mt-14 px-4 py-4">
      <Tabs defaultValue="record-audio" className="w-full max-w-2xl">
        <TabsList className="gap-3 w-full justify-start">
          <TabsTrigger value="record-audio">
            <IconMicrophone/>
            Record Audio
          </TabsTrigger>
          <TabsTrigger value="web-link">
            <IconLink/>
            Web Link
          </TabsTrigger>
          <TabsTrigger value="upload-pdf/text">
          <IconLetterCase/>
          Upload PDF/Text
          </TabsTrigger>
          <TabsTrigger value="upload-audio">
            <IconMusic/>
            Upload Audio</TabsTrigger>
        </TabsList>


        <TabsContent value="record-audio">
          <RecordAudio/>
        </TabsContent>

        <TabsContent value="web-link">
          <WebLink/>
        </TabsContent>

        <TabsContent value="upload-pdf/text">
          <UploadPdfText/>
        </TabsContent>
        
        <TabsContent value="upload-audio">
          <UploadAudio/>
        </TabsContent>
    </Tabs>
    </div>
  )
}

export default NewNote