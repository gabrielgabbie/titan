"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AlertGrid } from "@/components/titan/alert-grid"
import { PageShell } from "@/components/titan/page-shell"
import { QueueSummary } from "@/components/titan/queue-summary"
import { ViewToolbar } from "@/components/titan/toolbar"
import { PARAMETERS, alertsForQueue, getQueue } from "@/lib/data"
import { summarize, useRows } from "@/lib/use-rows"

function DqAssignment({ queueId }: { queueId: string }) {
  const queue = getQueue(queueId)!
  const params = Array.from(new Set(alertsForQueue(queueId).flatMap((a) => a.violated)))
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link" className="text-link">
          View DQ Assignment
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3 text-sm">
        <div className="font-medium">{queue.name}</div>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">Configuration</dt>
          <dd>{queue.configuration}</dd>
          <dt className="text-muted-foreground">Effective</dt>
          <dd>{queue.effective}</dd>
          <dt className="text-muted-foreground">Assigned to</dt>
          <dd>Risk Analysts · Tier 1</dd>
        </dl>
        <div className="text-muted-foreground mt-3 text-xs font-medium">Parameters alerting today</div>
        <ul className="mt-1 flex flex-col gap-1">
          {params.map((p) => (
            <li key={p}>
              <span className="font-medium">{p}</span> · {PARAMETERS[p].name}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export function QueueDetail({ queueId }: { queueId: string }) {
  const queue = getQueue(queueId)!
  const rows = useRows(alertsForQueue(queueId))

  return (
    <PageShell crumbs={[{ label: "Queue View", href: "/queues" }, { label: queue.name }]}>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">{queue.name}</h1>
        <DqAssignment queueId={queueId} />
      </div>
      <ViewToolbar scope="queue" />
      <QueueSummary s={summarize(rows)} />
      <AlertGrid rows={rows} scope="queue" paginate />
    </PageShell>
  )
}
