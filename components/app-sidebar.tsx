"use client"
import * as React from "react"


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { NavMain } from "./nav-main"
import { IconInnerShadowTop, IconListDetails, IconNotes, IconPlus } from "@tabler/icons-react"
import { NavSecondary } from "./nav-secondary"

// This is sample data.
const data = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  navMain: [
    {
      title: "New Note",
      url: "/dashboard",
      icon: IconPlus,
    },
    
    
  ],
  navSecundary: [
    {
      title: "All Notes",
      url: "/dashboard/notes",
      icon: IconListDetails,
    },
  ],
  
  
  
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">NotePilot</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecundary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
