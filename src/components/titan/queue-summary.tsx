import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/data"
import type { summarize } from "@/lib/use-rows"

type Summary = ReturnType<typeof summarize>

/** One figure on a small ds5 card: what it counts as the title, the number below. */
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold tabular-nums">{value}</CardContent>
    </Card>
  )
}

export function QueueSummary({ s }: { s: Summary }) {
  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6" aria-label="Queue summary">
      <StatCard label="Alerted Merchants" value={s.total} />
      <StatCard label="Unworked" value={s.unworked} />
      <StatCard label="WIP" value={s.wip} />
      <StatCard label="Worked" value={s.worked} />
      <StatCard label="% Worked" value={`${s.pctWorked}%`} />
      <StatCard label="Today's Net Amount" value={formatCurrency(s.netAmount)} />
    </section>
  )
}
