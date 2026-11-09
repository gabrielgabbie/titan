import { formatCurrency } from "@/lib/data"
import { cn } from "@/lib/utils"
import type { summarize } from "@/lib/use-rows"

type Summary = ReturnType<typeof summarize>

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      <span className="text-xl leading-7 font-semibold tabular-nums">{value}</span>
    </div>
  )
}

function Legend({ color, value, label }: { color: string; value: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1 text-sm">
      {color && <span className={cn("size-2 rounded-[2px]", color)} />}
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  )
}

export function QueueSummary({ s }: { s: Summary }) {
  const pct = (n: number) => (s.total ? (n / s.total) * 100 : 0)
  return (
    <section className="bg-muted rounded-xl p-1" aria-label="Queue summary">
      <div className="grid grid-cols-2 gap-4 p-3 sm:grid-cols-5">
        <Stat label="Alerted Merchants" value={s.total} />
        <Stat label="Unworked" value={s.unworked} />
        <Stat label="WIP" value={s.wip} />
        <Stat label="Worked" value={s.worked} />
        <Stat label="% Worked" value={`${s.pctWorked}%`} />
      </div>
      <div className="bg-card flex flex-col gap-3 rounded-[10px] p-3 shadow-xs">
        <div
          className="flex h-6 w-full overflow-hidden rounded-[4px]"
          role="img"
          aria-label={`${s.unworked} unworked, ${s.wip} WIP, ${s.worked} worked`}
        >
          <div className="bg-status-unworked transition-all" style={{ width: `${pct(s.unworked)}%` }} />
          <div className="bg-status-wip transition-all" style={{ width: `${pct(s.wip)}%` }} />
          <div className="bg-status-worked transition-all" style={{ width: `${pct(s.worked)}%` }} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <Legend color="bg-status-unworked" value={s.unworked} label="Unworked" />
            <span className="text-muted-foreground">·</span>
            <Legend color="" value={formatCurrency(s.netAmount)} label="Today's Net Amount" />
          </div>
          <div className="flex items-center gap-4">
            <Legend color="bg-status-wip" value={s.wip} label="WIP" />
            <span className="text-muted-foreground">·</span>
            <Legend color="bg-status-worked" value={s.worked} label="Worked" />
          </div>
        </div>
      </div>
    </section>
  )
}
