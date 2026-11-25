"use client"

import { useSearchParams } from "next/navigation"

import { AlertGrid, type StatusTab } from "@/components/titan/alert-grid"
import { QueueLink } from "@/components/titan/links"
import { PageShell } from "@/components/titan/page-shell"
import { QueueSummary } from "@/components/titan/queue-summary"
import { ViewToolbar } from "@/components/titan/toolbar"
import { alertsForQueue } from "@/lib/data"
import { summarize, useRows } from "@/lib/use-rows"

const TABS: StatusTab[] = ["all", "unworked", "wip", "worked"]

/** One detection queue's Alerted Merchants report. */
export function QueueDetail({ queueId }: { queueId: string }) {
  const rows = useRows(alertsForQueue(queueId))
  const status = useSearchParams().get("status") as StatusTab | null
  const initialTab = status && TABS.includes(status) ? status : "all"

  return (
    <PageShell crumbs={[{ label: "Queue View", href: "/queues" }, { label: "Alerted Merchants" }]}>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">Alerted Merchants</h1>
        <div className="text-sm">
          <span className="text-muted-foreground">Detection Queue: </span>
          <QueueLink queueId={queueId} />
        </div>
      </div>
      <ViewToolbar scope="queue" />
      <QueueSummary s={summarize(rows)} />
      <AlertGrid key={initialTab} rows={rows} scope="queue" paginate initialTab={initialTab} />
    </PageShell>
  )
}
