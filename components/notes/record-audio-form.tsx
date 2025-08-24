"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { IconMicrophone } from '@tabler/icons-react'

const RecordAudioForm: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pt-0">
        <CardTitle className="text-xl">Note Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 h-full px-6 flex flex-col justify-between">

        <div className="space-y-6">
        <div className="space-y-2">
          <Label>Note Title</Label>
          <Input placeholder="Enter a descriptive title for your note..." />
        </div>

        <div className="space-y-2">
          <Label>Audio language</Label>
          <Select defaultValue="en">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">Folder (optional)</Label>
          <Select defaultValue="all">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Notes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </div>


        <div>
            <Button className="w-full h-12 text-base flex items-center justify-center gap-2">
                <IconMicrophone className="text-base" /> 
                <span className="text-base" >Start Recording</span>
            </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecordAudioForm