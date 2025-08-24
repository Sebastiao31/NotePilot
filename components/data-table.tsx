"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconFolderUp,
  IconGripVertical,
  IconLetterCase,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Link from "next/link"
import { useAuthUser } from "@/hooks/use-auth-user"
import { db } from "@/lib/firebase"
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore"
import { IconFolder, IconFile, IconLink, IconVolume, IconMicrophone, IconTrash } from "@tabler/icons-react"
// badge styles removed

export type DataRow = {
  id: number
  docId: string
  header: string
  folder: string
  source: string
  createdAt: string
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Default columns template. The concrete columns are created inside DataTable
// so we can access per-user folders for the Folder cell.
const baseColumns: ColumnDef<DataRow>[] = [
  // Selection checkbox
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // Note (left aligned)
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  // Right-aligned meta columns
  // Folder column will be overridden in DataTable to include assignment select
  {
    id: "source",
    header: () => <div className="text-right w-full" />,
    cell: ({ row }) => {
      return (
        <div className="text-right text-muted-foreground">
          {row.original.source}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: "created-at",
    header: () => <div className="text-right w-full pr-6">Created At</div>,
    cell: ({ row }) => (
      <div className="text-right text-muted-foreground pr-6">{row.original.createdAt}</div>
    ),
    enableSorting: false,
  },
  // Actions (three dots) to reserve right spacing
  {
    id: "actions",
    header: () => <div className="w-10" />, // spacer so Created At isn't against the edge
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuItem disabled>Move To (coming soon)</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<DataRow> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
  hideFolderColumn = false,
}: {
  data: DataRow[]
  hideFolderColumn?: boolean
}) {
  const { user } = useAuthUser()
  const [folders, setFolders] = React.useState<{ id: string; name: string; color?: string }[]>([])
  const [data, setData] = React.useState(() => initialData)
  const [selectedFolders, setSelectedFolders] = React.useState<Record<string, string | null>>({})
  React.useEffect(() => {
    setData(initialData)
    // seed local selections from incoming data
    const seed: Record<string, string | null> = {}
    for (const r of initialData) {
      seed[r.docId] = r.folder && r.folder !== 'No Folder' ? r.folder : null
    }
    setSelectedFolders(seed)
  }, [initialData])
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  React.useEffect(() => {
    if (!user) {
      setFolders([])
      return
    }
    const q = query(collection(db, 'folders'), where('userId', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const items: { id: string; name: string; color?: string }[] = []
      snap.forEach((d) => items.push({ id: d.id, name: (d.data() as any).name || 'Folder', color: (d.data() as any).color }))
      setFolders(items)
    })
    return () => unsub()
  }, [user])

  const assignFolder = async (noteId: string, folderId: string) => {
    try {
      await updateDoc(doc(db, 'notes', noteId), { folderId })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to assign folder', e)
    }
  }

  const columnsLocal: ColumnDef<DataRow>[] = React.useMemo(() => {
    const createdAtCol = baseColumns.find((c) => c.id === 'created-at') as ColumnDef<DataRow> | undefined
    const actionsCol: ColumnDef<DataRow> = {
      id: 'actions',
      header: () => <div className="w-10" />,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <IconFolderUp className="size-4 mr-2" />
                Move To
                </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {folders.length === 0 ? (
                  <DropdownMenuItem disabled>No folders</DropdownMenuItem>
                ) : (
                  folders.map((f) => (
                    <DropdownMenuItem key={f.id} onClick={() => assignFolder(row.original.docId, f.id)}>
                      <IconFolder className="size-4" style={{ color: (f as any).color ?? '#6b7280' }} />
                      <span>{f.name}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <IconTrash className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }
    if (hideFolderColumn) {
      // select, note, created-at, actions (no folder column, no source column)
      return [
        ...baseColumns.slice(0, 2),
        ...(createdAtCol ? [createdAtCol] : []),
        actionsCol,
      ]
    }
    return [
      ...baseColumns.slice(0, 2),
      {
        id: 'folder',
        header: () => <div className="text-right w-full">Folder</div>,
        cell: ({ row }) => {
          const current = selectedFolders[row.original.docId] ?? null
          const currentFolder = current ? folders.find((f) => f.id === current) : null
          return (
            <div className="text-right">
              {currentFolder ? (
                <div className="inline-flex items-center gap-1 text-sm text-foreground">
                  <IconFolder className="size-4" style={{ color: (currentFolder as any).color ?? '#6b7280' }} />
                  <span>{currentFolder.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">No folder</span>
              )}
            </div>
          )
        },
        enableSorting: false,
      },
      // exclude Source column; then add created-at and actions
      ...(createdAtCol ? [createdAtCol] : []),
      actionsCol,
    ]
  }, [folders, selectedFolders, hideFolderColumn])

  const table = useReactTable({
    data,
    columns: columnsLocal,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start"
    >
      
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 mt-6 overflow-auto "
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columnsLocal.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} note(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Notes per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

function TableCellViewer({ item }: { item: DataRow }) {
  return (
    <Button asChild variant="link" className="text-foreground w-fit px-0 text-left">
      <Link href={`/dashboard/notes/${item.docId}`}>{item.header}</Link>
    </Button>
  )
}
