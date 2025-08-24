"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

type ProviderProps = {
  children: React.ReactNode
}

type RightSidebarContext = {
  widthPx: number
  setWidthPx: (n: number) => void
  minPx: number
  maxPx: number
}

const RightSidebarCtx = React.createContext<RightSidebarContext | null>(null)

export function RightSidebarProvider({ children }: ProviderProps) {
  const MIN = 430
  const MAX = 720
  const [widthPx, setWidthPx] = React.useState<number>(() => {
    if (typeof window === 'undefined') return 384
    const stored = window.localStorage.getItem('right-sidebar-width')
    const n = stored ? parseInt(stored, 10) : 384
    return isNaN(n) ? 384 : Math.min(MAX, Math.max(MIN, n))
  })

  React.useEffect(() => {
    try {
      window.localStorage.setItem('right-sidebar-width', String(widthPx))
    } catch {}
  }, [widthPx])

  return (
    <RightSidebarCtx.Provider value={{ widthPx, setWidthPx, minPx: MIN, maxPx: MAX }}>
      <div data-slot="right-sidebar-provider" className="relative min-h-[100dvh]">
        {children}
      </div>
    </RightSidebarCtx.Provider>
  )
}

type RightSidebarProps = React.HTMLAttributes<HTMLElement>

export function RightSidebar({ className, ...props }: RightSidebarProps) {
  const ctx = React.useContext(RightSidebarCtx)
  const width = ctx?.widthPx ?? 384

  const startDrag = (ev: React.MouseEvent | React.TouchEvent) => {
    ev.preventDefault()
    const move = (e: any) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const next = Math.min(ctx!.maxPx, Math.max(ctx!.minPx, window.innerWidth - clientX))
      ctx?.setWidthPx(next)
    }
    const up = () => {
      window.removeEventListener('mousemove', move as any)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', move as any)
      window.removeEventListener('touchend', up)
    }
    window.addEventListener('mousemove', move as any)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', move as any, { passive: false })
    window.addEventListener('touchend', up)
  }

  return (
    <aside
      data-slot="right-sidebar"
      className={cn(
        "hidden md:block fixed right-0 top-16 h-[calc(100dvh-4rem)] border-l bg-background",
        className
      )}
      style={{ width }}
      {...props}
    >
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-border active:bg-border"
        onMouseDown={startDrag as any}
        onTouchStart={startDrag as any}
      />
      {props.children}
    </aside>
  )
}

type InsetProps = React.HTMLAttributes<HTMLDivElement>

export function RightSidebarInset({ className, ...props }: InsetProps) {
  const ctx = React.useContext(RightSidebarCtx)
  const style = React.useMemo(() => ({ paddingRight: ctx ? `${ctx.widthPx}px` : undefined }), [ctx?.widthPx])
  return (
    <div
      data-slot="right-sidebar-inset"
      className={cn(
        "min-h-[100dvh]",
        className
      )}
      style={style}
      {...props}
    />
  )
}


