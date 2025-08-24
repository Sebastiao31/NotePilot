"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { IconLink } from '@tabler/icons-react'

const WebLinkForm: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pt-0">
        <CardTitle className="text-xl">Note Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Note Title</Label>
          <Input placeholder="Enter a descriptive title for your note..." />
        </div>

        <div className="space-y-2">
          <Label>URL</Label>
          <Input placeholder="Paste a web link (YouTube, website, Google Drive)…" />
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

        <Button className="w-full h-12 text-base">
          <IconLink /> Fetch & Summarize
        </Button>
      </CardContent>
    </Card>
  )
}

export default WebLinkForm