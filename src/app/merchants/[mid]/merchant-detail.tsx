"use client"

import * as React from "react"
import Link from "next/link"
import { CircleHelp, ExternalLink, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { GridPagination, PAGE_SIZE } from "@/components/titan/alert-grid"
import { gridCell, gridHead, gridRow } from "@/components/titan/grid"
import { SortHeader } from "@/components/titan/badges"
import { DispositionControl } from "@/components/titan/disposition-control"
import { linkClass, reportHref } from "@/components/titan/links"
import { useTitan } from "@/lib/store"
import { McScoreCard } from "@/components/titan/mc-score-card"
import { PageShell } from "@/components/titan/page-shell"
import { DqDetailsBadge, QueueLink } from "@/components/titan/links"
import { REPORT_DATE, alertsForMerchant, MC_REASON_CODES, formatCurrency, getMerchant, transactionsFor, type Merchant } from "@/lib/data"
import { useSort } from "@/lib/use-sort"
import { EmptyRow } from "@/components/titan/empty-row"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { emptyMessage } from "@/lib/empty-message"

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] text-sm leading-7">
      <dt className="text-muted-foreground">{label}:</dt>
      <dd>{value}</dd>
    </div>
  )
}

function AlertStatusCard({ merchant }: { merchant: Merchant }) {
  const { openDqDetails } = useTitan()
  const alerts = alertsForMerchant(merchant.mid)
  return (
    <Card className="gap-3 py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-sm font-semibold">Alert Status</CardTitle>
        <CardAction>
          <button type="button" className={cn(linkClass, "text-sm")} onClick={() => openDqDetails(merchant.mid, "history")}>
            View Alert History
          </button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-3">
        <div className="overflow-hidden rounded-lg bg-card shadow-surface">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow className="hover:bg-muted">
                <TableHead className={cn(gridHead, "w-[160px]")}>Disposition</TableHead>
                <TableHead className={cn(gridHead, "w-[120px]")}>Report Date</TableHead>
                <TableHead className={cn(gridHead, "w-[200px]")}>Last Alerted</TableHead>
                <TableHead className={gridHead}>Detection Queue</TableHead>
                <TableHead className={cn(gridHead, "w-[160px]")}>Violated Parameters</TableHead>
                <TableHead className={cn(gridHead, "w-[190px]")}>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 && <EmptyRow colSpan={6}>{emptyMessage("data")}</EmptyRow>}
              {alerts.map((a, i) => (
                <TableRow key={a.id} className={gridRow(i, "h-10")}>
                  <TableCell className={gridCell}>
                    <DispositionControl merchant={merchant} alertId={a.id} />
                  </TableCell>
                  <TableCell className={gridCell}>{REPORT_DATE}</TableCell>
                  <TableCell className={gridCell}>{`${REPORT_DATE} ${a.time}`}</TableCell>
                  <TableCell className={gridCell}>
                    <QueueLink queueId={a.queueId} />
                  </TableCell>
                  <TableCell className={gridCell}>{a.violated.join(", ")}</TableCell>
                  <TableCell className={gridCell}>
                    <Link href={reportHref(a.queueId)} className={cn(linkClass, "whitespace-nowrap")}>
                      View Alerted Merchants
                    </Link>
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

/** Descriptions come from source data; always show them with a capital first letter. */
const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** An MC reason code, with a help icon that shows the code's description on hover or focus. */
function ReasonCode({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      {code}
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="cursor-pointer rounded-sm" aria-label={`Description of ${code}`}>
            <CircleHelp className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {sentenceCase(MC_REASON_CODES[code] ?? "")}
        </TooltipContent>
      </Tooltip>
    </span>
  )
}

function TransactionHistory({ merchant }: { merchant: Merchant }) {
  const all = React.useMemo(() => transactionsFor(merchant), [merchant])
  const [page, setPage] = React.useState(1)
  const { sorted, toggle, dirOf } = useSort(all, {
    report: (t) => t.reportDate,
    date: (t) => -all.indexOf(t),
    card: (t) => t.card,
    country: (t) => t.country,
    account: (t) => t.account,
    bin: (t) => t.bin,
    type: (t) => t.type,
    amount: (t) => t.amount,
    rc: (t) => t.responseCode,
    file: (t) => t.fileSource,
    score: (t) => t.score,
    reason: (t) => t.reasonCode,
  })
  const pageSize = PAGE_SIZE
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize)
  const paged = sorted.length > PAGE_SIZE

  const head = (key: Parameters<typeof toggle>[0], label: string, right = false, width?: string) => (
    <TableHead className={cn(gridHead, right && "text-right", width)}>
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
                {head("report", "Report Date")}
                {head("date", "Transaction Date")}
                {head("card", "Card Type")}
                {head("country", "Country")}
                {head("account", "Account Number")}
                {head("bin", "BIN")}
                {head("type", "Transaction Type")}
                {head("amount", "Transaction Amount", true)}
                {head("rc", "Response Code", true)}
                {head("file", "File Source")}
                {head("score", "Post-Txn Score", true)}
                {head("reason", "MC Reason Code", true)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && <EmptyRow colSpan={12}>{emptyMessage("data")}</EmptyRow>}
              {rows.map((t, i) => (
                <TableRow key={`${t.dateTime}-${i}`} className={gridRow(i, "h-9")}>
                  <TableCell className={gridCell}>{t.reportDate}</TableCell>
                  <TableCell className={gridCell}>{t.dateTime.slice(0, 10)}</TableCell>
                  <TableCell className={gridCell}>{t.card}</TableCell>
                  <TableCell className={gridCell}>{t.country}</TableCell>
                  <TableCell className={cn(gridCell, "tabular-nums")}>{t.account}</TableCell>
                  <TableCell className={cn(gridCell, "tabular-nums")}>{t.bin}</TableCell>
                  <TableCell className={gridCell}>{t.type}</TableCell>
                  <TableCell className={cn(gridCell, "text-right tabular-nums")}>{formatCurrency(t.amount)}</TableCell>
                  <TableCell className={cn(gridCell, "text-right tabular-nums")}>{t.responseCode}</TableCell>
                  <TableCell className={gridCell}>{t.fileSource}</TableCell>
                  <TableCell className={cn(gridCell, "text-right tabular-nums")}>{t.score}</TableCell>
                  <TableCell className={cn(gridCell, "text-right")}>
                    <ReasonCode code={t.reasonCode} />
                  </TableCell>
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

export function MerchantDetail({ mid }: { mid: string }) {
  const merchant = getMerchant(mid)!

  return (
    <PageShell crumbs={[{ label: "Merchant View", href: "/merchants" }, { label: "Merchant Details" }]}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-2.5">
          <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md">
            <Store className="size-4" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg leading-8 font-semibold">{merchant.name}</h1>
              <DqDetailsBadge merchant={merchant} />
            </div>
            <div className="grid gap-x-20 md:grid-cols-2">
              <dl>
                <InfoRow label="MID" value={merchant.mid} />
                <InfoRow label="MCC" value={`${merchant.mcc} ${merchant.mccDescription}`} />
                <InfoRow label="Boarded" value={merchant.boarded} />
              </dl>
              <dl>
                <InfoRow label="DBA" value={merchant.dba} />
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

      <div className="flex min-w-0 flex-col gap-4">
          <AlertStatusCard merchant={merchant} />
          <McScoreCard merchant={merchant} />
        <TransactionHistory merchant={merchant} />
      </div>
    </PageShell>
  )
}
