"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Check, ChevronDown, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ViewScope } from "@/lib/columns"
import { useTitan } from "@/lib/store"
import { ViewSheet } from "./view-sheet"

export function ReportDatePicker() {
  const { reportDate, setReportDate } = useTitan()
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Report Date:</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[130px] justify-between font-normal">
            {format(reportDate, "MM/dd/yyyy")}
            <CalendarIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={reportDate}
            defaultMonth={reportDate}
            onSelect={(d) => {
              if (d) setReportDate(d)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function ViewToolbar({ scope }: { scope: ViewScope }) {
  const { viewState, setActiveView } = useTitan()
  const state = viewState[scope]
  const active = state.views.find((v) => v.id === state.activeId)
  const [sheet, setSheet] = React.useState<"edit" | "create" | null>(null)
  const [sheetMode, setSheetMode] = React.useState<"edit" | "create">("edit")

  const openSheet = (mode: "edit" | "create") => {
    setSheetMode(mode)
    setSheet(mode)
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <ReportDatePicker />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">View:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[150px] justify-between font-normal">
              <span className="truncate">{active?.name ?? "Select view"}</span>
              <ChevronDown className="opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">Views</DropdownMenuLabel>
            {state.views.map((v) => (
              <DropdownMenuItem key={v.id} onSelect={() => setActiveView(scope, v.id)} className="justify-between">
                {v.name}
                {v.id === state.activeId && <Check />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => openSheet("create")}>
              <Plus /> Create View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="link" className="text-link" onClick={() => openSheet("edit")} disabled={!active}>
          Edit View
        </Button>
      </div>
      <ViewSheet scope={scope} mode={sheetMode} open={sheet !== null} onOpenChange={(o) => !o && setSheet(null)} />
    </div>
  )
}
