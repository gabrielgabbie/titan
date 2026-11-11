import { ArrowDown, ArrowUp, ArrowUpDown, Check, Loader } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BAND_LEVEL, mcBand, type McBand, type WorkStatus } from "@/lib/data"

const BAND_COLOR: Record<McBand, string> = {
  "Very Low": "#16a34a",
  Low: "#65a30d",
  Medium: "#ca8a04",
  High: "#f97316",
  Critical: "#dc2626",
}

/** 5-bar level meter: active bars use the band color; remaining bars are neutral. */
export function McBandBars({ band }: { band: McBand }) {
  const level = BAND_LEVEL[band]
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="shrink-0">
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={i * 2}
          y={8 - i * 2}
          width="1.2"
          height={2 + i * 2}
          rx="0.4"
          fill={i < level ? BAND_COLOR[band] : "#d4d4d8"}
        />
      ))}
    </svg>
  )
}

/** MC Score band label (Score Bands v1.0), built on the outline badge. */
export function McBandBadge({ score, className }: { score: number; className?: string }) {
  const band = mcBand(score)
  return (
    <Badge variant="outline" className={cn("gap-1 rounded-full px-2 font-medium", className)}>
      <McBandBars band={band} />
      {band}
    </Badge>
  )
}

export const STATUS_LABEL: Record<WorkStatus, string> = { unworked: "Unworked", wip: "WIP", worked: "Worked" }

export const STATUS_BG: Record<WorkStatus, string> = {
  unworked: "bg-status-unworked hover:bg-status-unworked/90",
  wip: "bg-status-wip hover:bg-status-wip/90",
  worked: "bg-status-worked hover:bg-status-worked/90",
}

export function StatusIcon({ status, className }: { status: WorkStatus; className?: string }) {
  if (status === "wip") return <Loader className={className} />
  if (status === "worked") return <Check className={className} />
  return null
}

export function StatusBadge({ status }: { status: WorkStatus }) {
  return (
    <Badge className={cn("gap-1 rounded-full text-white", STATUS_BG[status])}>
      <StatusIcon status={status} className="size-3" />
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export function ResultBadge({ violated, labels = ["Violated", "Not violated"] }: { violated: boolean; labels?: [string, string] }) {
  return violated ? (
    <Badge className="rounded-full bg-destructive/10 font-normal text-destructive">{labels[0]}</Badge>
  ) : (
    <Badge variant="outline" className="rounded-full font-normal">
      {labels[1]}
    </Badge>
  )
}

export function CountBadge({ count, active }: { count: number; active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium tabular-nums",
        active ? "bg-primary text-primary-foreground" : "bg-card text-foreground shadow-surface"
      )}
    >
      {count}
    </span>
  )
}

export type SortDir = "asc" | "desc" | null

export function SortHeader({
  label,
  dir,
  onClick,
  align = "left",
}: {
  label: string
  dir: SortDir
  onClick: () => void
  align?: "left" | "right"
}) {
  const Icon = dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ArrowUpDown
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 font-medium whitespace-nowrap hover:bg-accent",
        align === "right" && "flex-row"
      )}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <Icon className="size-3.5" />
    </button>
  )
}
