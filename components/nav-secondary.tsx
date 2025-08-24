"use client"

import * as React from "react"
import { IconChevronDown, IconFile, IconFolder } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useAuthUser } from "@/hooks/use-auth-user"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore"

type NavItem = { title: string; url: string; icon: React.ComponentType<any> }

export function NavSecondary({ items = [], ...props }: { items?: NavItem[] } & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { user } = useAuthUser()
  const [folders, setFolders] = React.useState<Array<{ id: string; name: string; color?: string }>>([])
  const [open, setOpen] = React.useState<Record<string, boolean>>({})
  const [notesByFolder, setNotesByFolder] = React.useState<Record<string, Array<{ id: string; title: string }>>>({})

  React.useEffect(() => {
    if (!user) return
    const q1 = query(collection(db, 'folders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
    let fallbackUnsub: (() => void) | null = null
    const unsub = onSnapshot(
      q1,
      (snap) => {
        const arr: Array<{ id: string; name: string; color?: string }> = []
        snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as any) }))
        setFolders(arr)
      },
      () => {
        const q2 = query(collection(db, 'folders'), where('userId', '==', user.uid))
        fallbackUnsub = onSnapshot(q2, (snap) => {
          const arr: Array<{ id: string; name: string; color?: string }> = []
          snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as any) }))
          setFolders(arr)
        })
      }
    )
    return () => { unsub(); if (fallbackUnsub) fallbackUnsub() }
  }, [user])

  React.useEffect(() => {
    if (!user || folders.length === 0) return
    const unsubs: Array<() => void> = []
    folders.forEach((f) => {
      const q1 = query(collection(db, 'notes'), where('userId', '==', user.uid), where('folderId', '==', f.id), orderBy('createdAt', 'desc'))
      let fb: (() => void) | null = null
      const u = onSnapshot(
        q1,
        (snap) => {
          const list: Array<{ id: string; title: string }> = []
          snap.forEach((d) => list.push({ id: d.id, title: (d.data() as any).title || 'Untitled' }))
          setNotesByFolder((prev) => ({ ...prev, [f.id]: list }))
        },
        () => {
          const q2 = query(collection(db, 'notes'), where('userId', '==', user.uid), where('folderId', '==', f.id))
          fb = onSnapshot(q2, (snap) => {
            const list: Array<{ id: string; title: string }> = []
            snap.forEach((d) => list.push({ id: d.id, title: (d.data() as any).title || 'Untitled' }))
            setNotesByFolder((prev) => ({ ...prev, [f.id]: list }))
          })
        }
      )
      unsubs.push(() => { u(); if (fb) fb() })
    })
    return () => unsubs.forEach((u) => u())
  }, [user, folders])

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarGroupLabel>My Notes</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {items.length > 0}
          {folders.map((f) => {
            const isOpen = !!open[f.id]
            const color = (f.color ?? '#ef4444')
            return (
              <SidebarMenuItem key={f.id}>
                <SidebarMenuButton
                  className="justify-between"
                  onClick={(e) => {
                    // toggle inline; allow modifier-click to open in new tab as link
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                      e.preventDefault()
                      setOpen((m) => ({ ...m, [f.id]: !isOpen }))
                    }
                  }}
                  asChild
                >
                  <Link href={`/dashboard/notes/folder/${f.id}`}>
                    <span className="inline-flex items-center gap-2">
                      <IconFolder style={{ color }} className="size-5" />
                      <span>{f.name}</span>
                    </span>
                    <IconChevronDown className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </Link>
                </SidebarMenuButton>
                {isOpen && (
                  <div className="ml-7  my-2 space-y-1">
                    {(notesByFolder[f.id] || []).map((n) => (
                      <SidebarMenuButton key={n.id} asChild size="sm" className="opacity-80">
                        <Link href={`/dashboard/notes/${n.id}`}>
                          <IconFile />
                          <span className="truncate text-sm">{n.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    ))}
                    {(notesByFolder[f.id] || []).length === 0 ? (
                      <div className="text-xs text-muted-foreground px-2 py-1">No notes</div>
                    ) : null}
                  </div>
                )}
              </SidebarMenuItem>
            )
          })}        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
