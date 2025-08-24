"use client"
import React, { useCallback, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { IconSparkles, IconUpload } from '@tabler/icons-react'
import DocUpload from './doc-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Textarea } from '../ui/textarea'
import TextSummarize from './text-summarize'
import { useAuthUser } from '@/hooks/use-auth-user'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

const UploadDocForm: React.FC = () => {
  const router = useRouter()
  const { user } = useAuthUser()
  const [activeTab, setActiveTab] = useState<'Document' | 'Text'>('Document')
  const [title, setTitle] = useState('')
  const [folderId, setFolderId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    if (!user) return false
    if (activeTab === 'Text' && !text.trim()) return false
    return true
  }, [user, text, activeTab])

  const handleSummarize = useCallback(async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Summarization failed')
      const summary: string = data.summary || ''

      // Generate a title if missing
      let generatedTitle = title.trim()
      if (!generatedTitle) {
        const tRes = await fetch('/api/generate-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })
        const tData = await tRes.json()
        if (tRes.ok && tData?.title) {
          generatedTitle = tData.title
        } else {
          generatedTitle = 'Untitled Note'
        }
      }

      const docRef = await addDoc(collection(db, 'notes'), {
        userId: user!.uid,
        title: generatedTitle,
        content: text.trim(),
        summary,
        sourceType: 'text',
        folderId: folderId ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      router.push(`/dashboard/notes/${docRef.id}`)
    } catch (e) {
      console.error(e)
      // Optionally toast error
    } finally {
      setIsSubmitting(false)
    }
  }, [canSubmit, text, title, user, folderId, router])

  return (
    <Card className="h-full ">
      <CardHeader className="pt-0">
        <CardTitle className="text-xl">Note Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 h-full px-6 flex flex-col justify-between">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList>
              <TabsTrigger value="Document">Document</TabsTrigger>
              <TabsTrigger value="Text">Text</TabsTrigger>
            </TabsList>
            <TabsContent value="Document">
              <div className="space-y-6">
                <div className="space-y-2 mt-2">
                  <Label>Note Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title for your note..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Document</Label>
                  <DocUpload />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Folder (optional)</Label>
                  <Select value={folderId ?? 'all'} onValueChange={(v) => setFolderId(v === 'all' ? null : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Notes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="Text">
            <div className="space-y-6">
                <div className="space-y-2 mt-2">
                  <Label>Note Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title for your note..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Text</Label>
                  <TextSummarize value={text} onChange={setText} />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Folder (optional)</Label>
                  <Select value={folderId ?? 'all'} onValueChange={(v) => setFolderId(v === 'all' ? null : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Notes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Button className="w-full h-12 text-base" disabled={!canSubmit || isSubmitting} onClick={handleSummarize}>
            <IconSparkles /> {isSubmitting ? 'Summarizing...' : 'Summarize content'}
          </Button>
        </div>
      </CardContent>

    </Card>
  )
}

export default UploadDocForm