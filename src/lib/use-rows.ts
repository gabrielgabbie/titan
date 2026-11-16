"use client"

import { ALERTS, getMerchant, type Alert } from "./data"
import type { Row } from "./columns"
import { useTitan } from "./store"

export function useRows(alerts: Alert[] = ALERTS): Row[] {
  const { statuses } = useTitan()
  return alerts.map((alert) => {
    const merchant = getMerchant(alert.mid)!
    const s = statuses[alert.mid]
    // Per-alert note (e.g. "Re-alerted") only applies to the re-alert row when still unworked.
    const statusNote = s.status === "unworked" ? (alert.kind === "Re-Alert" ? "Re-alerted" : undefined) : s.note
    return { alert, merchant, status: s.status, statusNote }
  })
}

export function summarize(rows: Row[]) {
  const unworked = rows.filter((r) => r.status === "unworked").length
  const wip = rows.filter((r) => r.status === "wip").length
  const worked = rows.filter((r) => r.status === "worked").length
  const total = rows.length
  const netAmount = rows.reduce((s, r) => s + r.merchant.netAmount, 0)
  return { total, unworked, wip, worked, pctWorked: total ? Math.round((worked / total) * 100) : 0, netAmount }
}
