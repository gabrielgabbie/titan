"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  PARAMETERS,
  alertsForMerchant,
  getMerchant,
  getQueue,
  lastAlertedFor,
  merchantAlertHistoryFor,
  merchantCyclesFor,
  violatedParamsFor,
  type Merchant,
  type ViolatedParam,
} from "@/lib/data"
import { useTitan } from "@/lib/store"
import { useSort } from "@/lib/use-sort"
import { SortHeader, StatusBadge } from "./badges"
import { gridCell, gridHead, gridRow } from "./grid"
import { QueueLink, linkClass } from "./links"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function SubTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg bg-card shadow-surface">
      <Table>{children}</Table>
    </div>
  )
}

/** "+N" beside the first queue: every queue that detected the parameter, each with its own configuration. */
function OtherQueues({ param, onNavigate }: { param: ViolatedParam; onNavigate: () => void }) {
  const others = param.queues.length - 1
  if (others <= 0) return null
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="bg-card shadow-surface hover:bg-accent inline-flex h-5 shrink-0 items-center rounded-full px-1.5 text-xs font-medium"
          aria-label={`${others} more detection queues for ${param.code}`}
        >
          +{others}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[380px] p-2.5">
        <div className="text-sm font-medium">
          {param.code} · {PARAMETERS[param.code].name}
        </div>
        <div className="text-muted-foreground text-sm">{param.queues.length} Detection Queues</div>
        <ul className="mt-3 flex flex-col">
          {param.queues.map((q, i) => (
            <li key={q.queueId} className={cn("py-2", i > 0 && "inset-shadow-edge-t")}>
              <QueueLink queueId={q.queueId} className="text-sm" onClick={onNavigate} />
              <div className="text-muted-foreground text-xs">{q.configured}</div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function ViolatedParameters({ merchant, onNavigate }: { merchant: Merchant; onNavigate: () => void }) {
  const { sorted, toggle, dirOf } = useSort(violatedParamsFor(merchant), {
    parameter: (r) => r.code,
    queue: (r) => getQueue(r.queues[0].queueId)?.name ?? "",
    actual: (r) => r.actual,
    next: (r) => r.nextReAlert ?? "",
  })
  const head = (key: Parameters<typeof toggle>[0], label: string) => (
    <TableHead className={gridHead}>
      <SortHeader label={label} dir={dirOf(key)} onClick={() => toggle(key)} />
    </TableHead>
  )
  return (
    <SubTable>
      <TableHeader className="bg-muted">
        <TableRow className="hover:bg-muted">
          {head("parameter", "Parameter")}
          {head("queue", "Detection Queue/Configured")}
          {head("actual", "Actual")}
          {head("next", "Next Re-Alert")}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((r, i) => (
          <TableRow key={r.code} className={gridRow(i)}>
            <TableCell className={gridCell}>
              <div>{r.code}</div>
              <div className="text-muted-foreground text-xs">{PARAMETERS[r.code].name}</div>
            </TableCell>
            <TableCell className={gridCell}>
              <div className="flex items-center gap-1">
                <QueueLink queueId={r.queues[0].queueId} onClick={onNavigate} />
                <OtherQueues param={r} onNavigate={onNavigate} />
              </div>
              <div className="text-muted-foreground text-xs">{r.queues[0].configured}</div>
            </TableCell>
            <TableCell className={gridCell}>{r.actual}</TableCell>
            <TableCell className={gridCell}>{r.nextReAlert ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </SubTable>
  )
}

function TodaysCycles({ merchant }: { merchant: Merchant }) {
  const { sorted, toggle, dirOf } = useSort(merchantCyclesFor(merchant), {
    time: (r) => r.cycle,
    cycle: (r) => r.cycle,
    violated: (r) => r.violated.join(","),
    score: (r) => r.score,
  })
  return (
    <SubTable>
      <TableHeader className="bg-muted">
        <TableRow className="hover:bg-muted">
          <TableHead className={gridHead}>
            <SortHeader label="Time" dir={dirOf("time")} onClick={() => toggle("time")} />
          </TableHead>
          <TableHead className={gridHead}>
            <SortHeader label="MC File Cycle" dir={dirOf("cycle")} onClick={() => toggle("cycle")} />
          </TableHead>
          <TableHead className={gridHead}>
            <SortHeader label="Violated Parameters" dir={dirOf("violated")} onClick={() => toggle("violated")} />
          </TableHead>
          <TableHead className={cn(gridHead, "text-right")}>
            <SortHeader label="MC Score" dir={dirOf("score")} onClick={() => toggle("score")} />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((c, i) => (
          <TableRow key={c.cycle} className={gridRow(i)}>
            <TableCell className={gridCell}>{c.time}</TableCell>
            <TableCell className={gridCell}>{c.cycle}</TableCell>
            <TableCell className={gridCell}>{c.violated.join(", ")}</TableCell>
            <TableCell className={cn(gridCell, "text-right tabular-nums")}>{c.score}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </SubTable>
  )
}

const RANGES = { "90": "Last 90 days", "180": "Last 180 days", "365": "Last 12 months" } as const

function AlertHistory({ merchant, onNavigate }: { merchant: Merchant; onNavigate: () => void }) {
  const { statuses } = useTitan()
  const [range, setRange] = React.useState<keyof typeof RANGES>("90")
  const rows = merchantAlertHistoryFor(merchant, statuses[merchant.mid].status).filter((r) => r.daysAgo <= Number(range))
  const { sorted, toggle, dirOf } = useSort(rows, {
    date: (r) => -r.daysAgo,
    queue: (r) => getQueue(r.queueId)?.name ?? "",
    kind: (r) => r.kind,
    params: (r) => r.params.join(","),
    status: (r) => r.status,
  })
  const head = (key: Parameters<typeof toggle>[0], label: string) => (
    <TableHead className={gridHead}>
      <SortHeader label={label} dir={dirOf(key)} onClick={() => toggle(key)} />
    </TableHead>
  )
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Alert History</h3>
        <Select value={range} onValueChange={(v) => setRange(v as keyof typeof RANGES)}>
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RANGES).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SubTable>
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-muted">
            {head("date", "Date and Time")}
            {head("queue", "Detection Queue")}
            {head("kind", "Alert/Re-alert")}
            {head("params", "Parameters Met")}
            {head("status", "Disposition")}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r, i) => (
            <TableRow key={`${r.dateTime}-${r.queueId}`} className={gridRow(i)}>
              <TableCell className={gridCell}>{r.dateTime}</TableCell>
              <TableCell className={gridCell}>
                <QueueLink queueId={r.queueId} onClick={onNavigate} />
              </TableCell>
              <TableCell className={gridCell}>{r.kind}</TableCell>
              <TableCell className={gridCell}>{r.params.join(" · ")}</TableCell>
              <TableCell className={gridCell}>
                <StatusBadge status={r.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </SubTable>
    </div>
  )
}

/** Merchant-level DQ Details: every violated parameter across every detection queue that alerted on the merchant. */
export function DqDetailsDialog() {
  const { dqMid, closeDqDetails, statuses } = useTitan()
  const merchant = dqMid ? getMerchant(dqMid) : undefined

  return (
    <Dialog open={!!merchant} onOpenChange={(o) => !o && closeDqDetails()}>
      {merchant && (
        <DialogContent className="max-h-[92svh] gap-0 overflow-hidden p-0 sm:max-w-[960px]">
          <DialogHeader className="px-4 pt-4 pb-3">
            <DialogTitle className="text-base font-medium">DQ Details</DialogTitle>
            <DialogDescription className="sr-only">Violated parameters in every detection queue for {merchant.name}</DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[calc(92svh-8rem)] flex-col gap-4 overflow-y-auto px-4 pb-4">
            <div className="bg-muted grid gap-4 rounded-lg p-4 sm:grid-cols-3">
              <Field label="Merchant Name">
                <Link href={`/merchants/${merchant.mid}`} className={linkClass} onClick={closeDqDetails}>
                  {merchant.name}
                </Link>
              </Field>
              <Field label="MID">{merchant.mid}</Field>
              <Field label="Work Status">
                <StatusBadge status={statuses[merchant.mid].status} />
              </Field>
              <Field label="Alerted">{lastAlertedFor(merchant.mid)}</Field>
              <Field label="Queues Alerted">{alertsForMerchant(merchant.mid).length}</Field>
            </div>

            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Violated Parameters</h3>
              <ViolatedParameters merchant={merchant} onNavigate={closeDqDetails} />
            </section>

            <Tabs defaultValue="cycles" className="gap-3">
              <TabsList>
                <TabsTrigger value="cycles">Today&apos;s Cycles</TabsTrigger>
                <TabsTrigger value="history">Alert History</TabsTrigger>
              </TabsList>
              <TabsContent value="cycles" className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Today&apos;s Cycles</h3>
                <TodaysCycles merchant={merchant} />
              </TabsContent>
              <TabsContent value="history">
                <AlertHistory merchant={merchant} onNavigate={closeDqDetails} />
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="inset-shadow-edge-t p-4">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
