"use client"
import React from 'react'
import { Button } from '../ui/button'
import { IconFileText } from '@tabler/icons-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from '@/components/ui/drawer'

type Props = { content: string }

const ViewTranscript: React.FC<Props> = ({ content }) => {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <IconFileText className="w-4 h-4" />
          <span>View Transcript</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-xl">
        <DrawerHeader>
          <DrawerTitle>Original Transcript</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-auto">
          <pre className="whitespace-pre-wrap text-sm font-medium">{content}</pre>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ViewTranscript