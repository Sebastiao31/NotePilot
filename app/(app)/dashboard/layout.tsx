"use client"
import React, { useEffect, useState } from "react"
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
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function DashboardLayout({

  
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  const pathname = usePathname()
  const [noteTitle, setNoteTitle] = useState<string | null>(null)

  useEffect(() => {
    const match = pathname.match(/^\/dashboard\/notes\/([^/]+)/)
    if (!match) {
      setNoteTitle(null)
      return
    }
    const id = match[1]
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'notes', id))
        if (snap.exists()) setNoteTitle((snap.data() as any).title || null)
        else setNoteTitle(null)
      } catch {
        setNoteTitle(null)
      }
    })()
  }, [pathname])

  const title = (() => {
    if (/^\/dashboard(\/?$)/.test(pathname)) return "New Note"
    if (/^\/dashboard\/notes(\/.*)?$/.test(pathname)) return "My Notes"
    return "Documents"

  })()

  return (
    <SidebarProvider > 
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10">
          <SidebarTrigger className="-ml-1 " />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          {/^\/dashboard\/notes\/.+/.test(pathname) ? (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard/notes">My Notes</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{noteTitle || 'Note'}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            <h1 className="text-base font-medium">{title}</h1>
          )}
        </header>
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


