import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/titan/page-shell"
import { QUEUES, getQueue } from "@/lib/data"
import { dqAssignmentFor } from "@/lib/dq-assignments"
import { FiltersTable, ParametersTable, greenBadge } from "./assignment-tables"

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

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  )
}

/** DQ Assignment detail: read only, exactly what the assignment's DMN upload defines. */
export default async function DqAssignmentPage({ params }: { params: Promise<{ queueId: string }> }) {
  const { queueId } = await params
  const queue = getQueue(queueId)
  const a = dqAssignmentFor(queueId)
  if (!queue || !a) notFound()
  const enabled = a.parameters.filter((p) => p.enabled)

  return (
    <PageShell crumbs={[{ label: "Queue View", href: "/queues" }, { label: "DQ Assignment" }]}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-semibold">{queue.name}</h1>
            <Badge className={greenBadge}>{a.status}</Badge>
          </div>
          <Button variant="link" className="text-link" asChild>
            <Link href={`/queues/${queueId}`}>View Alerted Merchants</Link>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Detection Queue Assignment · Version {a.version} · effective {a.effective} · last changed by {a.changedBy}
        </p>
        <p className="text-muted-foreground text-xs">
          Read only. Aperia sets this assignment up through a DMN upload; this page shows exactly what that upload says. A merchant that
          passes the filters alerts in this assignment&apos;s queue when it violates any enabled parameter.
        </p>
      </div>

      <Section title="Assignment information" description="Read only · from the DMN upload">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
          <Field label="Name">{queue.name}</Field>
          <Field label="Assignment ID">{a.assignmentId}</Field>
          <Field label="Queue type">{a.queueType}</Field>
          <Field label="Start date">{a.startDate}</Field>
          <Field label="Expiration date">{a.expirationDate}</Field>
          <Field label="Client">{a.client}</Field>
        </div>
      </Section>

      <Section title="Detection Queue Assignment Filters" description="Combined with AND · only merchants that pass every filter are evaluated">
        <FiltersTable filters={a.filters} />
        <p className="text-muted-foreground text-xs">{a.filterSummary}</p>
      </Section>

      <Section
        title="Parameters"
        description={`${enabled.length} of ${a.parameters.length} MVP parameters enabled`}
      >
        <ParametersTable parameters={a.parameters} />
      </Section>

      <Section title="Match logic" description="How enabled parameters combine">
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          <Field label="Match logic">{a.matchLogic}</Field>
          <Field label="Rule">Alert when any one enabled parameter is violated ({enabled.map((p) => p.code).join(", ")})</Field>
        </div>
      </Section>
    </PageShell>
  )
}
