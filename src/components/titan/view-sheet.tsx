"use client"

import * as React from "react"
import { toast } from "sonner"
import { GripVertical, Lock, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  columnById,
  columnsForScope,
  defaultColumnSettings,
  lockedColumns,
  type ColumnSetting,
  type SavedView,
  type ViewScope,
} from "@/lib/columns"
import { useTitan } from "@/lib/store"

export function ViewSheet({
  scope,
  mode,
  open,
  onOpenChange,
}: {
  scope: ViewScope
  mode: "edit" | "create"
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { viewState, saveView, deleteView } = useTitan()
  const state = viewState[scope]
  const active = state.views.find((v) => v.id === state.activeId)

  const [name, setName] = React.useState("")
  const [isDefault, setIsDefault] = React.useState(false)
  const [columns, setColumns] = React.useState<ColumnSetting[]>([])
  const [query, setQuery] = React.useState("")
  const [dragId, setDragId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    if (mode === "edit" && active) {
      setName(active.name)
      setIsDefault(state.defaultId === active.id)
      setColumns(active.columns)
    } else {
      setName("")
      setIsDefault(false)
      setColumns(defaultColumnSettings(scope))
    }
    setQuery("")
  }, [open, mode, active, state.defaultId, scope])

  const locked = lockedColumns(scope)
  const total = columnsForScope(scope).length
  const shown = locked.length + columns.filter((c) => c.visible).length
  const q = query.trim().toLowerCase()
  const matches = (label: string) => !q || label.toLowerCase().includes(q)

  const toggle = (id: string, visible: boolean) =>
    setColumns((cols) => cols.map((c) => (c.id === id ? { ...c, visible } : c)))

  const moveOver = (overId: string) => {
    if (!dragId || dragId === overId) return
    setColumns((cols) => {
      const from = cols.findIndex((c) => c.id === dragId)
      const to = cols.findIndex((c) => c.id === overId)
      const next = [...cols]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  const submit = () => {
    const view: SavedView = {
      id: mode === "edit" && active ? active.id : `view-${Date.now()}`,
      name: name.trim() || "Untitled view",
      columns,
    }
    saveView(scope, view, isDefault)
    toast.success(mode === "edit" ? "View updated." : "View created.")
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[384px] gap-0 sm:max-w-[384px]">
        <SheetHeader className="p-4 pb-3">
          <SheetTitle className="text-lg font-medium">{mode === "edit" ? "Edit View" : "Create View"}</SheetTitle>
          <SheetDescription className="sr-only">Choose and order the grid columns for this view.</SheetDescription>
        </SheetHeader>

        <form
          id="view-form"
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="view-name" className="font-medium">
              View Name
            </Label>
            <Input id="view-name" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="view-default" checked={isDefault} onCheckedChange={(v) => setIsDefault(v === true)} />
            <Label htmlFor="view-default" className="font-normal">
              Set as my default view
            </Label>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Columns</span>
              <Button
                type="button"
                variant="link"
                size="xs"
                className="text-link h-auto px-0 font-normal"
                onClick={() => setColumns(defaultColumnSettings(scope))}
              >
                Reset to Default
              </Button>
            </div>
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search columns" value={query} onChange={(e) => setQuery(e.target.value)} />
            </InputGroup>
            <p className="text-muted-foreground text-xs">
              {shown} of {total} shown
            </p>

            <ul className="flex flex-col pt-2 pb-4">
              {locked.filter((c) => matches(c.label)).map((c) => (
                <li key={c.id} className="flex h-7 items-center gap-2 pl-6 text-sm">
                  <Lock className="size-4" aria-label="Always shown" />
                  {c.label}
                </li>
              ))}
              {columns
                .filter((c) => matches(columnById(c.id).label))
                .map((c) => {
                  const def = columnById(c.id)
                  return (
                    <li
                      key={c.id}
                      draggable={!q}
                      onDragStart={() => setDragId(c.id)}
                      onDragOver={(e) => {
                        e.preventDefault()
                        moveOver(c.id)
                      }}
                      onDragEnd={() => setDragId(null)}
                      className={cn("flex h-7 items-center gap-2 rounded-sm text-sm", dragId === c.id && "bg-muted")}
                    >
                      <GripVertical className={cn("size-4 shrink-0", q ? "opacity-30" : "cursor-grab")} aria-hidden />
                      <Checkbox
                        id={`col-${c.id}`}
                        checked={c.visible}
                        onCheckedChange={(v) => toggle(c.id, v === true)}
                      />
                      <Label htmlFor={`col-${c.id}`} className="flex-1 font-normal">
                        {def.label}
                      </Label>
                      {def.code && <span className="text-muted-foreground text-xs">{def.code}</span>}
                    </li>
                  )
                })}
            </ul>
          </div>
        </form>

        {mode === "edit" ? (
          <SheetFooter className="flex-row items-center justify-between p-4">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={state.views.length <= 1}
              onClick={() => {
                if (active) deleteView(scope, active.id)
                toast.success("View deleted.")
                onOpenChange(false)
              }}
            >
              Delete View
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="view-form">
                Save View
              </Button>
            </div>
          </SheetFooter>
        ) : (
          <SheetFooter className="flex-row items-center justify-end p-4">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="view-form">
                Create View
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
