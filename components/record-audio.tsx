import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { IconFolder, IconLanguage, IconMicrophone } from '@tabler/icons-react'
import { Button } from './ui/button'
import SelectFolder from './select-folder'

const RecordAudio = () => {
  return (
    <div className='flex flex-col border border-gray-200 rounded-lg p-2 w-full'>
        <div className='flex flex-col gap-2'>
            <Select>
                <SelectTrigger className='w-full'>
                    <IconLanguage/>
                    <SelectValue placeholder='Select a language' />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='en'>English</SelectItem>
                    <SelectItem value='es'>Spanish</SelectItem>
                    <SelectItem value='fr'>French</SelectItem>
                </SelectContent>
            </Select>
            <SelectFolder/>
        </div>
        <div className='flex justify-center items-center mt-8'>
            <Button className='w-full'>
                <IconMicrophone/>
                Start Recording
            </Button>
        </div>
    </div>
  )
}

export default RecordAudio