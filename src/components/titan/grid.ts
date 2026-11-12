import { cn } from "@/lib/utils"

/**
 * Shared data-grid styles. Headers follow aperia-ds5's TableHead: 40px high, 14px medium text, 8px side padding.
 * Cells share that 8px, so each column's values start on its heading's x. Every other row gets a zinc-50 stripe; each
 * grid keeps its own row height (56px by default; Transaction History 36px, Queue View 44px, MC Score 40px), passed as
 * `height`.
 */
export const gridHead = "h-10 px-2 text-sm"
export const gridCell = "px-2"
export const gridRow = (i: number, height = "h-14") => cn(height, i % 2 === 1 && "bg-zinc-50")
