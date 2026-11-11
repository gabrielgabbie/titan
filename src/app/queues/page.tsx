"use client"

import * as React from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { SortHeader, type SortDir } from "@/components/titan/badges"
import { FilterBuilder } from "@/components/titan/filter-builder"
import { applyFilters, type FilterField, type FilterRule } from "@/lib/filters"
import { PageShell } from "@/components/titan/page-shell"
import { ReportDatePicker } from "@/components/titan/toolbar"
import { QUEUES, alertsForQueue, formatCurrency } from "@/lib/data"
import { summarize, useRows } from "@/lib/use-rows"

type Key = "name" | "total" | "unworked" | "wip" | "worked" | "pctWorked" | "netAmount"

const COLS: { key: Key; label: string; right?: boolean }[] = [
  { key: "name", label: "Queue Name" },
  { key: "total", label: "Alerted Merchants", right: true },
  { key: "unworked", label: "Unworked", right: true },
  { key: "wip", label: "WIP", right: true },
  { key: "worked", label: "Worked", right: true },
  { key: "pctWorked", label: "% Worked", right: true },
  { key: "netAmount", label: "Today's Net Amount", right: true },
]

type QueueRow = { name: string } & Record<Exclude<Key, "name">, number>

const FIELDS: FilterField<QueueRow>[] = COLS.map((c) =>
  c.key === "name"
    ? { id: c.key, label: c.label, type: "text" as const, get: (q: QueueRow) => q.name }
    : { id: c.key, label: c.label, type: "number" as const, get: (q: QueueRow) => q[c.key as Exclude<Key, "name">] }
)

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
              <InputGroupInput placeholder="Search Queue Name" value={query} onChange={(e) => setQuery(e.target.value)} />
            </InputGroup>
          </div>
        </div>

        <div className="surface overflow-hidden">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow className="hover:bg-muted">
                {COLS.map((c) => (
                  <TableHead key={c.key} className={cn("h-[30px] px-2.5 text-xs", c.right && "text-right")}>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((q, i) => (
                <TableRow key={q.id} className={cn("h-11", i % 2 === 1 && "bg-zinc-50")}>
                  <TableCell className="px-2">
                    <Link href={`/queues/${q.id}`} className="text-link underline-offset-2 hover:underline">
                      {q.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-2 text-right tabular-nums">{q.total}</TableCell>
                  <TableCell className="px-2 text-right tabular-nums">{q.unworked}</TableCell>
                  <TableCell className="px-2 text-right tabular-nums">{q.wip}</TableCell>
                  <TableCell className="px-2 text-right tabular-nums">{q.worked}</TableCell>
                  <TableCell className="px-2 text-right tabular-nums">{q.pctWorked}%</TableCell>
                  <TableCell className="px-2 text-right tabular-nums">{formatCurrency(q.netAmount)}</TableCell>
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
