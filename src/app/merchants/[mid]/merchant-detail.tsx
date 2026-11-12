"use client"

import * as React from "react"
import { toast } from "sonner"
import Link from "next/link"
import { ExternalLink, Store } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { GridPagination, PAGE_SIZE } from "@/components/titan/alert-grid"
import { gridCell, gridHead, gridRow } from "@/components/titan/grid"
import { SortHeader } from "@/components/titan/badges"
import { DispositionControl } from "@/components/titan/disposition-control"
import { McScoreCard } from "@/components/titan/mc-score-card"
import { MerchantNotes } from "@/components/titan/merchant-notes"
import { PageShell } from "@/components/titan/page-shell"
import { alertsForMerchant, formatCurrency, formatSigned, getMerchant, getQueue, transactionsFor, type Merchant } from "@/lib/data"
import { useTitan } from "@/lib/store"
import { useSort } from "@/lib/use-sort"

const linkClass = "text-link underline-offset-2 hover:underline"

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] text-sm leading-7">
      <dt className="text-muted-foreground">{label}:</dt>
      <dd>{value}</dd>
    </div>
  )
}

function AlertStatusCard({ merchant }: { merchant: Merchant }) {
  const alerts = alertsForMerchant(merchant.mid)
  return (
    <Card className="gap-3 py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-sm font-semibold">Alert Status</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <div className="overflow-hidden rounded-lg bg-card shadow-surface">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow className="hover:bg-muted">
                <TableHead className={gridHead}>Queue Name</TableHead>
                <TableHead className={gridHead}>Violated Parameters</TableHead>
                <TableHead className={gridHead}>Alert/Re-Alert</TableHead>
                <TableHead className={gridHead}>Disposition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((a, i) => (
                <TableRow key={a.id} className={gridRow(i)}>
                  <TableCell className={cn(gridCell, "max-w-[200px] whitespace-normal")}>
                    <Link href={`/queues/${a.queueId}`} className={linkClass}>
                      {getQueue(a.queueId)?.name}
                    </Link>
                  </TableCell>
                  <TableCell className={gridCell}>{a.violated.join(", ")}</TableCell>
                  <TableCell className={gridCell}>
                    {a.kind} {a.time}
                  </TableCell>
                  <TableCell className={gridCell}>
                    <DispositionControl merchant={merchant} alertId={a.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionHistory({ merchant }: { merchant: Merchant }) {
  const all = React.useMemo(() => transactionsFor(merchant), [merchant])
  const [page, setPage] = React.useState(1)
  const { sorted, toggle, dirOf } = useSort(all, {
    date: (t) => -all.indexOf(t),
    type: (t) => t.type,
    amount: (t) => t.amount,
    score: (t) => t.score,
    change: (t) => t.change,
  })
  const pageSize = PAGE_SIZE
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize)
  const paged = sorted.length > PAGE_SIZE

  const head = (key: Parameters<typeof toggle>[0], label: string, right = false) => (
    <TableHead className={cn(gridHead, right && "text-right")}>
      <SortHeader label={label} dir={dirOf(key)} onClick={() => toggle(key)} />
    </TableHead>
  )

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-sm font-semibold">Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3">
        <div className="overflow-hidden rounded-lg bg-card shadow-surface">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow className="hover:bg-muted">
                {head("date", "Date and Time")}
                {head("type", "Type")}
                {head("amount", "Amount", true)}
                {head("score", "Post-Txn Score", true)}
                {head("change", "Change", true)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t, i) => (
                <TableRow key={`${t.dateTime}-${i}`} className={gridRow(i, "h-9")}>
                  <TableCell className={gridCell}>{t.dateTime}</TableCell>
                  <TableCell className={gridCell}>{t.type}</TableCell>
                  <TableCell className={cn(gridCell, "text-right tabular-nums")}>{formatCurrency(t.amount)}</TableCell>
                  <TableCell className={cn(gridCell, "text-right tabular-nums")}>{t.score}</TableCell>
                  <TableCell className={cn(gridCell, "text-right tabular-nums")}>{formatSigned(t.change)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {paged && <GridPagination page={page} pages={pages} onPage={setPage} className="justify-center" />}
      </CardContent>
    </Card>
  )
}

function Cases({ mid }: { mid: string }) {
  const { cases, createCase } = useTitan()
  const list = cases[mid] ?? []
  return (
    <Card className="gap-3 py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-sm font-semibold">Cases</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" onClick={() => {
              createCase(mid)
              toast.success("Case created.")
            }}>
            Create case
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-3">
        {list.length === 0 && <p className="text-muted-foreground text-sm">No cases for this merchant.</p>}
        {list.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 shadow-surface">
            <div className="min-w-0">
              <div className="text-sm font-medium">
                {c.id} · {c.title}
              </div>
              <div className="text-muted-foreground truncate text-sm">{c.meta}</div>
            </div>
            {c.open ? (
              <Badge className="rounded-full">Open</Badge>
            ) : (
              <Badge variant="secondary" className="rounded-full">
                Closed
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function MerchantDetail({ mid }: { mid: string }) {
  const merchant = getMerchant(mid)!

  return (
    <PageShell crumbs={[{ label: "Merchant View", href: "/merchants" }, { label: merchant.name }]}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-2.5">
          <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md">
            <Store className="size-4" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-lg leading-8 font-semibold">{merchant.name}</h1>
            <div className="grid gap-x-20 md:grid-cols-2">
              <dl>
                <InfoRow label="MID" value={merchant.mid} />
                <InfoRow label="MCC" value={`${merchant.mcc} ${merchant.mccDescription}`} />
                <InfoRow label="Boarded" value={`${merchant.boarded} (${merchant.daysSinceBoarding} days ago)`} />
              </dl>
              <dl>
                <InfoRow label="DBA" value={merchant.dba} />
                <InfoRow label="Client" value={merchant.client} />
                <InfoRow label="Processor" value={merchant.processor} />
              </dl>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <a href="#" onClick={(e) => e.preventDefault()} title="Opens the VisionWeb risk report">
            VW Risk Report <ExternalLink />
          </a>
        </Button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-4">
          <AlertStatusCard merchant={merchant} />
          <McScoreCard merchant={merchant} />
          <Tabs defaultValue="transactions" className="gap-4">
            <TabsList>
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
              <TabsTrigger value="cases">Cases</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions">
              <TransactionHistory merchant={merchant} />
            </TabsContent>
            <TabsContent value="cases">
              <Cases mid={mid} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:sticky lg:top-4">
          <MerchantNotes mid={mid} />
        </div>
      </div>
    </PageShell>
  )
}
