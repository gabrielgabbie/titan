import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/titan/page-shell"
import { QUEUES, getQueue } from "@/lib/data"
import { dqAssignmentFor } from "@/lib/dq-assignments"
import { FiltersTable, ParametersTable } from "./assignment-tables"
import { greenBadge } from "./styles"

export function generateStaticParams() {
  return QUEUES.map((q) => ({ queueId: q.id }))
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  )
}

/** DQ Assignment detail: read only, exactly what the assignment's DMN upload defines (Aperia sets it up; no one edits it here). */
export default async function DqAssignmentPage({ params }: { params: Promise<{ queueId: string }> }) {
  const { queueId } = await params
  const queue = getQueue(queueId)
  const a = dqAssignmentFor(queueId)
  if (!queue || !a) notFound()
  const enabled = a.parameters.filter((p) => p.enabled)

  return (
    <PageShell crumbs={[{ label: "Queue View", href: "/queues" }, { label: "DQ Assignment" }]}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-semibold">{queue.name}</h1>
          <Badge className={greenBadge}>{a.status}</Badge>
        </div>
        <Button variant="link" className="text-link" asChild>
          <Link href={`/queues/${queueId}`}>View Alerted Merchants</Link>
        </Button>
      </div>

      <Section title="Assignment information">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
          <Field label="Assignment ID">{a.assignmentId}</Field>
          <Field label="Queue Type">{a.queueType}</Field>
          <Field label="Start Date">{a.startDate}</Field>
          <Field label="Expiration Date">{a.expirationDate}</Field>
        </div>
      </Section>

      <Section title="Detection Queue Assignment Filters">
        <FiltersTable filters={a.filters} />
      </Section>

      <Section title="Parameters">
        <ParametersTable parameters={a.parameters} />
      </Section>

      <Section title="Match Logic">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
          <Field label="Match logic">{a.matchLogic}</Field>
          <Field label="Rule" className="md:col-span-3">Alert when any one enabled parameter is violated ({enabled.map((p) => p.code).join(", ")})</Field>
        </div>
      </Section>
    </PageShell>
  )
}
