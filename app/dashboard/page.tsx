"use client"
import { AppSidebar } from "@/components/app-sidebar"
import NoteTypeContainer from "@/components/notes/note-type-container"
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

export default function Page() {
  const { displayName } = useAuthUser()
  return (
    <main className="flex flex-row h-full">
      <div className="w-1/2 px-8 py-10 border-r border-gray-200 space-y-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium">Hello, {displayName}</h1>
          <p className="text-gray-400 text-md">Choose how you'd like to create your note</p>
        </div>

        <div>
          <NoteTypeContainer />
        </div>

        
      </div>

      <div className="w-1/2 bg-gray-100">

      </div>

    </main>
  )
}
