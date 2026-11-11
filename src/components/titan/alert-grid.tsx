"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  PARAM_ORDER,
  QUEUES,
  alertsForMerchant,
  formatCurrency,
  formatSigned,
  getQueue,
  mcBand,
  type McBand,
  type WorkStatus,
} from "@/lib/data"
import { columnById, columnsForScope, lockedColumns, type ColumnDef, type ColumnId, type Row, type ViewScope } from "@/lib/columns"
import { useTitan } from "@/lib/store"
import { applyFilters, type FilterField, type FilterRule } from "@/lib/filters"
import { CountBadge, McBandBadge, STATUS_LABEL, SortHeader, type SortDir } from "./badges"
import { FilterBuilder } from "./filter-builder"
import { DispositionControl } from "./disposition-control"

type StatusTab = "all" | WorkStatus

const linkClass = "text-link hover:underline underline-offset-2"

function sortValue(row: Row, id: ColumnId): string | number {
  const { merchant: m, alert: a } = row
  switch (id) {
    case "disposition":
      return ["unworked", "wip", "worked"].indexOf(row.status)
    case "mid":
      return m.mid
    case "merchantName":
      return m.name
    case "queueName":
      return getQueue(a.queueId)?.name ?? ""
    case "mcc":
      return m.mcc
    case "violated":
      return a.violated.join(",")
    case "mcScore":
    case "mcBand":
      return m.mcScore
    case "scoreDelta":
      return m.scoreDelta
    case "newHigh":
      return m.mcNewHigh
    case "jump":
      return m.mcJump
    case "volScore":
      return m.volumePct
    case "netAmount":
      return m.netAmount
    case "history":
      return m.history90d
    case "alertRealert":
      return a.time
    case "avgNetTicket":
      return m.avgNetTicket
    case "dbaName":
      return m.dba
    case "daysSinceBoarding":
      return m.daysSinceBoarding
    case "feedHealth":
      return m.feedHealth
    case "largestTxn":
      return m.largestTxn
    case "mcHighToday":
      return m.mcHighToday
    case "mcScore24hAvg":
      return m.mcScore24hAvg
    case "txnCount":
      return m.txnCount
  }
}

function QueuesPopover({ row }: { row: Row }) {
  const all = alertsForMerchant(row.merchant.mid)
  const others = all.length - 1
  if (others <= 0) return null
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-5 items-center rounded-full bg-card shadow-surface px-1.5 text-xs font-medium hover:bg-accent"
          aria-label={`${others} more queues`}
        >
          +{others}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[380px] p-2.5">
        <div className="text-sm font-medium">
          {row.merchant.name} · {all.length} Queues
        </div>
        <div className="text-muted-foreground text-sm">
          MID: {row.merchant.mid} · Report Date: 10/28/2026
        </div>
        <ul className="mt-3 flex flex-col">
          {all.map((a, i) => (
            <li key={a.id} className={cn("py-2", i > 0 && "inset-shadow-edge-t")}>
              <Link href={`/queues/${a.queueId}`} className={cn(linkClass, "text-sm")}>
                {getQueue(a.queueId)?.name}
              </Link>
              <div className="text-muted-foreground text-xs">{a.queueReason}</div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function Cell({ row, col }: { row: Row; col: ColumnDef }) {
  const { merchant: m, alert: a } = row
  switch (col.id) {
    case "disposition":
      return <DispositionControl merchant={m} alertId={a.id} note={row.statusNote} />
    case "mid":
      return <span className="tabular-nums">{m.mid}</span>
    case "merchantName":
      return (
        <Link href={`/merchants/${m.mid}`} className={linkClass}>
          {m.name}
        </Link>
      )
    case "queueName":
      return (
        <div className="flex items-center gap-2">
          <Link href={`/queues/${a.queueId}`} className={linkClass}>
            {getQueue(a.queueId)?.name}
          </Link>
          <QueuesPopover row={row} />
        </div>
      )
    case "mcc":
      return m.mcc
    case "violated":
      return a.violated.join(", ")
    case "mcScore":
      return <span className="tabular-nums">{m.mcScore}</span>
    case "mcBand":
      return <McBandBadge score={m.mcScore} />
    case "scoreDelta":
      return formatSigned(m.scoreDelta)
    case "newHigh":
      return formatSigned(m.mcNewHigh)
    case "jump":
      return formatSigned(m.mcJump)
    case "volScore":
      return `${formatSigned(m.volumePct, "%")} / ${formatSigned(m.scoreDelta)}`
    case "netAmount":
      return formatCurrency(m.netAmount)
    case "history":
      return `${m.history90d} in 90d`
    case "alertRealert":
      return `${a.kind} ${a.time}`
    case "avgNetTicket":
      return formatCurrency(m.avgNetTicket)
    case "dbaName":
      return m.dba
    case "daysSinceBoarding":
      return m.daysSinceBoarding.toLocaleString()
    case "feedHealth":
      return m.feedHealth
    case "largestTxn":
      return formatCurrency(m.largestTxn)
    case "mcHighToday":
      return m.mcHighToday
    case "mcScore24hAvg":
      return m.mcScore24hAvg
    case "txnCount":
      return m.txnCount
  }
}

const BANDS: McBand[] = ["Critical", "High", "Medium", "Low", "Very Low"]

const NUMERIC: ColumnId[] = [
  "mcScore", "scoreDelta", "newHigh", "jump", "volScore", "netAmount", "history", "avgNetTicket",
  "daysSinceBoarding", "largestTxn", "mcHighToday", "mcScore24hAvg", "txnCount",
]

/** One filter field per column the grid can show in this scope (visible or hidden in the current view). */
function filterFields(scope: ViewScope): FilterField<Row>[] {
  return columnsForScope(scope).flatMap((c): FilterField<Row>[] => {
    const label = c.label
    switch (c.id) {
      case "disposition":
        return [{ id: c.id, label, type: "enum", options: ["Unworked", "WIP", "Worked"], get: (r) => STATUS_LABEL[r.status] }]
      case "mcBand":
        return [{ id: c.id, label, type: "enum", options: BANDS, get: (r) => mcBand(r.merchant.mcScore) }]
      case "queueName":
        return [{ id: c.id, label, type: "enum", options: QUEUES.map((q) => q.name), get: (r) => getQueue(r.alert.queueId)?.name ?? "" }]
      case "violated":
        return [{ id: c.id, label, type: "enum", options: PARAM_ORDER, get: (r) => r.alert.violated }]
      case "alertRealert":
        return [
          { id: "alertKind", label: "Alert/Re-Alert", type: "enum", options: ["Alert", "Re-alert"], get: (r) => r.alert.kind },
        ]
      default:
        return [
          NUMERIC.includes(c.id)
            ? { id: c.id, label, type: "number", get: (r) => Number(sortValue(r, c.id)) }
            : { id: c.id, label, type: "text", get: (r) => String(sortValue(r, c.id)) },
        ]
    }
  })
}

function pageList(page: number, pages: number): (number | "…")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const out: (number | "…")[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pages - 1, page + 1)
  if (start > 2) out.push("…")
  for (let i = start; i <= end; i++) out.push(i)
  if (end < pages - 1) out.push("…")
  out.push(pages)
  return out
}

export function GridPagination({
  page,
  pages,
  onPage,
  className,
}: {
  page: number
  pages: number
  onPage: (p: number) => void
  className?: string
}) {
  return (
    <Pagination className={cn("mx-0 w-auto", className)}>
      <PaginationContent>
        <PaginationItem>
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft /> Previous
          </Button>
        </PaginationItem>
        {pageList(page, pages).map((p, i) => (
          <PaginationItem key={`${p}-${i}`}>
            {p === "…" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                size="icon"
                isActive={p === page}
                className="size-8"
                onClick={(e) => {
                  e.preventDefault()
                  onPage(p)
                }}
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
            Next <ChevronRight />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export function AlertGrid({
  rows,
  scope,
  paginate = false,
}: {
  rows: Row[]
  scope: ViewScope
  paginate?: boolean
}) {
  const { viewState } = useTitan()
  const state = viewState[scope]
  const view = state.views.find((v) => v.id === state.activeId) ?? state.views[0]

  const [tab, setTab] = React.useState<StatusTab>("all")
  const [query, setQuery] = React.useState("")
  const [rules, setRules] = React.useState<FilterRule[]>([])
  const fields = React.useMemo(() => filterFields(scope), [scope])
  const [sort, setSort] = React.useState<{ id: ColumnId; dir: Exclude<SortDir, null> } | null>(null)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const columns: ColumnDef[] = [
    ...lockedColumns(scope),
    ...(view?.columns.filter((c) => c.visible).map((c) => columnById(c.id)) ?? []),
  ]

  const counts = {
    all: rows.length,
    unworked: rows.filter((r) => r.status === "unworked").length,
    wip: rows.filter((r) => r.status === "wip").length,
    worked: rows.filter((r) => r.status === "worked").length,
  }

  const q = query.trim().toLowerCase()
  let filtered = applyFilters(rows, rules, fields).filter(
    (r) =>
      (tab === "all" || r.status === tab) &&
      (!q || r.merchant.mid.includes(q) || r.merchant.name.toLowerCase().includes(q))
  )
  if (sort) {
    filtered = [...filtered].sort((a, b) => {
      const va = sortValue(a, sort.id)
      const vb = sortValue(b, sort.id)
      const c = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb))
      return sort.dir === "asc" ? c : -c
    })
  }

  const pages = paginate ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1
  const current = Math.min(page, pages)
  const visible = paginate ? filtered.slice((current - 1) * pageSize, current * pageSize) : filtered

  React.useEffect(() => setPage(1), [tab, query, rules, pageSize])

  const cycleSort = (id: ColumnId) =>
    setSort((s) => (s?.id !== id ? { id, dir: "asc" } : s.dir === "asc" ? { id, dir: "desc" } : null))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as StatusTab)}>
          <TabsList>
            {(
              [
                ["all", "All"],
                ["unworked", "Unworked"],
                ["wip", "WIP"],
                ["worked", "Worked"],
              ] as const
            ).map(([value, label]) => (
              <TabsTrigger key={value} value={value} className="gap-1.5 px-2">
                {label}
                <CountBadge count={counts[value]} active={tab === value} />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <FilterBuilder fields={fields} rules={rules} onChange={setRules} />
          <InputGroup className="h-8 w-[300px]">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search MID or Merchant Name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      <div className="surface overflow-hidden">
        <Table className="text-sm">
          <TableHeader className="bg-muted">
            <TableRow className="hover:bg-muted">
              {columns.map((col, i) => (
                <TableHead
                  key={col.id}
                  style={{ minWidth: col.width }}
                  className={cn(
                    "h-[30px] px-2.5 text-xs",
                    col.align === "right" && "text-right",
                    i === 0 && "bg-muted sticky left-0 z-20 after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border"
                  )}
                >
                  <SortHeader
                    label={col.header ?? col.label}
                    dir={sort?.id === col.id ? sort.dir : null}
                    onClick={() => cycleSort(col.id)}
                    align={col.align}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                  No merchants match the current filters.
                </TableCell>
              </TableRow>
            )}
            {visible.map((row, ri) => (
              <TableRow
                key={row.alert.id}
                className={cn("h-14 hover:bg-zinc-100", ri % 2 === 1 ? "bg-zinc-50" : "bg-card")}
              >
                {columns.map((col, i) => (
                  <TableCell
                    key={col.id}
                    className={cn(
                      "px-2.5 py-2",
                      col.align === "right" && "text-right tabular-nums",
                      i === 0 && "sticky left-0 z-10 bg-inherit after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border"
                    )}
                  >
                    <Cell row={row} col={col} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {paginate && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-muted-foreground text-sm">
            Showing {visible.length} of {filtered.length}
          </span>
          <GridPagination page={current} pages={pages} onPage={setPage} />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rows per page</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger size="sm" className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
