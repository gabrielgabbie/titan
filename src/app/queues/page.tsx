"use client"

import * as React from "react"
import Link from "next/link"
import { Ellipsis, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { SortHeader, type SortDir } from "@/components/titan/badges"
import { FilterBuilder } from "@/components/titan/filter-builder"
import { gridCell, gridHead, gridRow } from "@/components/titan/grid"
import { applyFilters, type FilterField, type FilterRule } from "@/lib/filters"
import { PageShell } from "@/components/titan/page-shell"
import { QueueLink, linkClass, reportHref } from "@/components/titan/links"
import { ReportDatePicker } from "@/components/titan/toolbar"
import { QUEUES, alertsForQueue, formatCurrency } from "@/lib/data"
import { summarize, useRows } from "@/lib/use-rows"

type Key = "name" | "total" | "unworked" | "wip" | "worked" | "pctWorked" | "netAmount"

const COLS: { key: Key; label: string; right?: boolean; width?: string }[] = [
  { key: "name", label: "Detection Queue", width: "min-w-[250px]" },
  { key: "total", label: "Alerted Merchants", right: true, width: "w-[170px]" },
  { key: "unworked", label: "Unworked", right: true, width: "w-[120px]" },
  { key: "wip", label: "WIP", right: true, width: "w-[70px]" },
  { key: "worked", label: "Worked", right: true, width: "w-[100px]" },
  { key: "pctWorked", label: "% Worked", right: true, width: "w-[110px]" },
  { key: "netAmount", label: "Today's Net Amount", right: true, width: "w-[180px]" },
]

type QueueRow = { name: string } & Record<Exclude<Key, "name">, number>

const FIELDS: FilterField<QueueRow>[] = COLS.map((c) =>
  c.key === "name"
    ? { id: c.key, label: c.label, type: "text" as const, get: (q: QueueRow) => q.name }
    : { id: c.key, label: c.label, type: "number" as const, get: (q: QueueRow) => q[c.key as Exclude<Key, "name">] }
)

/** View Alerted Merchants, then the rest of the queue's actions behind More Actions. */
function QueueActions({ queueId, queueName }: { queueId: string; queueName: string }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={reportHref(queueId)} className={cn(linkClass, "whitespace-nowrap")}>
        View Alerted Merchants
      </Link>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${queueName}`}>
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>More Actions</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          {/* Next Queue and Security Report get their own pages later; until then they lead nowhere. */}
          <DropdownMenuItem>Next Queue</DropdownMenuItem>
          <DropdownMenuItem>Security Report</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/** A status count; a non-zero count is set in medium weight so the queues with work stand out. */
function CountCell({ count }: { count: number }) {
  return <TableCell className={cn(gridCell, "text-right tabular-nums", count > 0 && "font-medium")}>{count}</TableCell>
}

export default function QueueViewPage() {
  const rows = useRows()
  const [query, setQuery] = React.useState("")
  const [rules, setRules] = React.useState<FilterRule[]>([])
  const [sort, setSort] = React.useState<{ key: Key; dir: Exclude<SortDir, null> } | null>(null)

  let data = QUEUES.map((q) => ({
    ...q,
    ...summarize(rows.filter((r) => alertsForQueue(q.id).some((a) => a.id === r.alert.id))),
  })).filter((q) => q.name.toLowerCase().includes(query.trim().toLowerCase()))
  data = applyFilters(data, rules, FIELDS)

  if (sort) {
    data = [...data].sort((a, b) => {
      const va = a[sort.key]
      const vb = b[sort.key]
      const c = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb))
      return sort.dir === "asc" ? c : -c
    })
  }

  return (
    <PageShell crumbs={[{ label: "Queue View" }]}>
      <h1 className="text-lg font-semibold">Queue View</h1>
      <ReportDatePicker />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Detection Queues</h2>
          <div className="flex items-center gap-2">
            <FilterBuilder fields={FIELDS} rules={rules} onChange={setRules} />
            <InputGroup className="h-8 w-[300px]">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search Detection Queue" value={query} onChange={(e) => setQuery(e.target.value)} />
            </InputGroup>
          </div>
        </div>

        <div className="surface overflow-hidden">
          <Table className="min-w-[1210px]">
            <TableHeader className="bg-muted">
              <TableRow className="hover:bg-muted">
                {COLS.map((c) => (
                  <TableHead key={c.key} className={cn(gridHead, c.right && "text-right", c.width)}>
                    <SortHeader
                      label={c.label}
                      dir={sort?.key === c.key ? sort.dir : null}
                      onClick={() =>
                        setSort((s) =>
                          s?.key !== c.key ? { key: c.key, dir: "asc" } : s.dir === "asc" ? { key: c.key, dir: "desc" } : null
                        )
                      }
                    />
                  </TableHead>
                ))}
                {/* Pinned to the right, so the actions stay in view while the counts scroll under them. */}
                <TableHead className={cn(gridHead, "bg-muted sticky right-0 z-20 w-[210px] after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-border")}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((q, i) => (
                <TableRow key={q.id} className={cn(gridRow(i, "h-11"), "hover:bg-zinc-100 has-aria-expanded:bg-zinc-100", i % 2 === 0 && "bg-card")}>
                  <TableCell className={gridCell}>
                    <QueueLink queueId={q.id} />
                  </TableCell>
                  <TableCell className={cn(gridCell, "text-right tabular-nums")}>{q.total}</TableCell>
                  <CountCell count={q.unworked} />
                  <CountCell count={q.wip} />
                  <CountCell count={q.worked} />
                  <TableCell className={cn(gridCell, "text-right tabular-nums")}>{q.pctWorked}%</TableCell>
                  <TableCell className={cn(gridCell, "text-right tabular-nums")}>{formatCurrency(q.netAmount)}</TableCell>
                  <TableCell className={cn(gridCell, "sticky right-0 z-10 bg-inherit after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-border")}>
                    <QueueActions queueId={q.id} queueName={q.name} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Outside the table, so it centers in the visible grid rather than across its full scroll width. */}
          {data.length === 0 && (
            <div className="text-muted-foreground flex h-20 items-center justify-center text-sm">
              No queues match your search.
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
