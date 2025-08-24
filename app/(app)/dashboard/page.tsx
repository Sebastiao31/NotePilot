"use client"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuthUser } from "@/hooks/use-auth-user"
import NoteTypeContainer from "@/components/notes/note-type-container"
import NoteFormContainer from "@/components/notes/note-form-container"
import { useState } from "react"
import type { NoteTypeId } from "@/components/notes/note-type-container"

export default function Page() {
  const { displayName } = useAuthUser()
  const [selectedType, setSelectedType] = useState<NoteTypeId>('record-audio')
  return (
    <main className="flex flex-row h-full">
      <div className="w-1/2 px-8 py-10 border-r border-gray-200 space-y-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium">Hello, {displayName}</h1>
          <p className="text-gray-400 text-md">Choose how you'd like to create your note</p>
        </div>

        <div >
          <NoteTypeContainer selectedType={selectedType} onChange={setSelectedType} />
        </div>

        
      </div>

      <div className="w-1/2 bg-gray-100 p-4">
        <NoteFormContainer selectedType={selectedType} />
      </div>

    </main>
  )
}
