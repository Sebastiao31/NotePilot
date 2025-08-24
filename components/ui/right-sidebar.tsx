"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

type ProviderProps = {
  children: React.ReactNode
}

export function RightSidebarProvider({ children }: ProviderProps) {
  return (
    <div data-slot="right-sidebar-provider" className="relative min-h-[100dvh]">
      {children}
    </div>
  )
}

type RightSidebarProps = React.HTMLAttributes<HTMLElement>

export function RightSidebar({ className, ...props }: RightSidebarProps) {
  return (
    <aside
      data-slot="right-sidebar"
      className={cn(
        "hidden md:block fixed right-0 top-16 h-[calc(100dvh-4rem)] w-[24rem] border-l bg-background",
        className
      )}
      {...props}
    />
  )
}

type InsetProps = React.HTMLAttributes<HTMLDivElement>

export function RightSidebarInset({ className, ...props }: InsetProps) {
  return (
    <div
      data-slot="right-sidebar-inset"
      className={cn(
        "min-h-[100dvh] md:pr-[24rem]",
        className
      )}
      {...props}
    />
  )
}


