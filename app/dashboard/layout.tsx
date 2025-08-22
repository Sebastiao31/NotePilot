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
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export default function DashboardLayout({

  
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  const pathname = usePathname()

  const title = (() => {
    if (/^\/dashboard(\/?$)/.test(pathname)) return "New Note"
    if (/^\/dashboard\/notes(\/.*)?$/.test(pathname)) return "My Notes"
    return "Documents"

  })()

  return (
    <SidebarProvider > 
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <h1 className="text-base font-medium">{title}</h1>
        </header>
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


