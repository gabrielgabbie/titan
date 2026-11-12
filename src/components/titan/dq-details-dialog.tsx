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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  PARAMETERS,
  REPORT_DATE,
  alertHistoryFor,
  cyclesFor,
  getAlert,
  getMerchant,
  getQueue,
  type Alert,
  type Merchant,
} from "@/lib/data"
import { useTitan } from "@/lib/store"
import { useSort } from "@/lib/use-sort"
import { ResultBadge, SortHeader, StatusBadge } from "./badges"
import { gridCell, gridHead, gridRow } from "./grid"

const linkClass = "text-link underline-offset-2 hover:underline"

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

function ParameterResults({ alert, merchant }: { alert: Alert; merchant: Merchant }) {
  const rows = merchant.paramActuals.map((p) => ({ ...p, violated: alert.violated.includes(p.code) }))
  const { sorted, toggle, dirOf } = useSort(rows, {
    parameter: (r) => r.code,
    configured: (r) => PARAMETERS[r.code].configured,
    actual: (r) => r.actual,
    next: (r) => r.nextReAlert ?? "",
    result: (r) => (r.violated ? 0 : 1),
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
          {head("configured", "Configured")}
          {head("actual", "Actual")}
          {head("next", "Next Re-Alert")}
          {head("result", "Result")}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((r, i) => (
          <TableRow key={r.code} className={gridRow(i)}>
            <TableCell className={gridCell}>
              <div>{r.code}</div>
              <div className="text-muted-foreground text-xs">{PARAMETERS[r.code].name}</div>
            </TableCell>
            <TableCell className={gridCell}>{PARAMETERS[r.code].configured}</TableCell>
            <TableCell className={gridCell}>{r.actual}</TableCell>
            <TableCell className={gridCell}>{r.nextReAlert ?? "—"}</TableCell>
            <TableCell className={gridCell}>
              <ResultBadge violated={r.violated} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </SubTable>
  )
}

function TodaysCycles({ alert, merchant }: { alert: Alert; merchant: Merchant }) {
  const { sorted, toggle, dirOf } = useSort(cyclesFor(alert, merchant), {
    time: (r) => r.cycle,
    cycle: (r) => r.cycle,
    result: (r) => (r.alert ? 0 : 1),
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
            <SortHeader label="Result" dir={dirOf("result")} onClick={() => toggle("result")} />
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
            <TableCell className={gridCell}>
              <ResultBadge violated={c.alert} labels={["Alert", "No alert"]} />
            </TableCell>
            <TableCell className={gridCell}>{c.violated.length ? c.violated.join(", ") : "—"}</TableCell>
            <TableCell className={cn(gridCell, "text-right tabular-nums")}>{c.score}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </SubTable>
  )
}

const RANGES = { "90": "Last 90 days", "180": "Last 180 days", "365": "Last 12 months" } as const

function AlertHistory({ alert, merchant }: { alert: Alert; merchant: Merchant }) {
  const { statuses } = useTitan()
  const [range, setRange] = React.useState<keyof typeof RANGES>("90")
  const rows = alertHistoryFor(alert, merchant, statuses[merchant.mid].status).filter((r) => r.daysAgo <= Number(range))
  const { sorted, toggle, dirOf } = useSort(rows, {
    date: (r) => -r.daysAgo,
    kind: (r) => r.kind,
    params: (r) => r.params.join(","),
    status: (r) => r.status,
  })
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
            <TableHead className={gridHead}>
              <SortHeader label="Date and Time" dir={dirOf("date")} onClick={() => toggle("date")} />
            </TableHead>
            <TableHead className={gridHead}>
              <SortHeader label="Alert/Re-alert" dir={dirOf("kind")} onClick={() => toggle("kind")} />
            </TableHead>
            <TableHead className={gridHead}>
              <SortHeader label="Parameters Met" dir={dirOf("params")} onClick={() => toggle("params")} />
            </TableHead>
            <TableHead className={gridHead}>
              <SortHeader label="Disposition" dir={dirOf("status")} onClick={() => toggle("status")} />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r, i) => (
            <TableRow key={r.dateTime} className={gridRow(i)}>
              <TableCell className={gridCell}>{r.dateTime}</TableCell>
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

export function DqDetailsDialog() {
  const { dqAlertId, closeDqDetails, statuses } = useTitan()
  const alert = dqAlertId ? getAlert(dqAlertId) : undefined
  const merchant = alert ? getMerchant(alert.mid) : undefined
  const queue = alert ? getQueue(alert.queueId) : undefined

  return (
    <Dialog open={!!alert} onOpenChange={(o) => !o && closeDqDetails()}>
      {alert && merchant && queue && (
        <DialogContent className="max-h-[92svh] gap-0 overflow-hidden p-0 sm:max-w-[960px]">
          <DialogHeader className="px-4 pt-4 pb-3">
            <DialogTitle className="text-base font-medium">DQ Details</DialogTitle>
            <DialogDescription className="sr-only">
              Detection queue results for {merchant.name} in {queue.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[calc(92svh-8rem)] flex-col gap-4 overflow-y-auto px-4 pb-4">
            <div className="bg-muted grid gap-4 rounded-lg p-4 sm:grid-cols-3">
              <Field label="Merchant Name">
                <Link href={`/merchants/${merchant.mid}`} className={linkClass} onClick={closeDqDetails}>
                  {merchant.name}
                </Link>
              </Field>
              <Field label="MID">{merchant.mid}</Field>
              <Field label="Queue Name">
                <Link href={`/queues/${queue.id}`} className={linkClass} onClick={closeDqDetails}>
                  {queue.name}
                </Link>
              </Field>
              <Field label="Alerted">
                <div>
                  {REPORT_DATE} {alert.time}
                </div>
                <div>{alert.kind === "Re-alert" ? "1 alert · 1 re-alert" : "1 alert · 0 re-alerts"}</div>
              </Field>
              <Field label="Configuration">
                <div>{queue.configuration}</div>
                <div>effective {queue.effective}</div>
              </Field>
              <Field label="Work Status">
                <StatusBadge status={statuses[merchant.mid].status} />
              </Field>
            </div>

            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Parameter Results</h3>
              <ParameterResults alert={alert} merchant={merchant} />
            </section>

            <Tabs defaultValue="cycles" className="gap-3">
              <TabsList>
                <TabsTrigger value="cycles">Today&apos;s Cycles</TabsTrigger>
                <TabsTrigger value="history">Alert History</TabsTrigger>
              </TabsList>
              <TabsContent value="cycles" className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Today&apos;s Cycles</h3>
                <TodaysCycles alert={alert} merchant={merchant} />
              </TabsContent>
              <TabsContent value="history">
                <AlertHistory alert={alert} merchant={merchant} />
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
