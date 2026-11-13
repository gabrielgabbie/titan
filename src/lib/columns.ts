import type { Alert, Merchant, WorkStatus } from "./data"

export type ViewScope = "queue" | "merchant"

export type ColumnId =
  | "disposition"
  | "mid"
  | "merchantName"
  | "queueName"
  | "mcc"
  | "violated"
  | "mcScore"
  | "mcBand"
  | "scoreDelta"
  | "newHigh"
  | "jump"
  | "volScore"
  | "netAmount"
  | "history"
  | "alertRealert"
  | "avgNetTicket"
  | "dbaName"
  | "daysSinceBoarding"
  | "feedHealth"
  | "largestTxn"
  | "mcHighToday"
  | "mcScore24hAvg"
  | "txnCount"

export interface ColumnDef {
  id: ColumnId
  label: string
  /** Header label in the grid, if different (e.g. "MC Band · P#C1"). */
  header?: string
  /** Source code shown at the right of the Edit View list (A1, P#C1…). */
  code?: string
  locked?: boolean
  align?: "left" | "right"
  width: number
  scopes?: ViewScope[]
}

export const COLUMNS: ColumnDef[] = [
  { id: "disposition", label: "Disposition", locked: true, width: 150 },
  { id: "mid", label: "MID", locked: true, width: 160 },
  { id: "merchantName", label: "Merchant Name", locked: true, width: 300 },
  { id: "queueName", label: "Detection Queue", locked: true, width: 280, scopes: ["merchant"] },
  { id: "mcc", label: "MCC", width: 90 },
  { id: "violated", label: "Violated Parameters", width: 160 },
  { id: "mcScore", label: "MC Score", code: "A1", align: "right", width: 120 },
  { id: "mcBand", label: "MC Band", header: "MC Band · P#C1", code: "P#C1", width: 160 },
  { id: "scoreDelta", label: "MC Score Δ", header: "MC Score Δ · P#C2", code: "P#C2", align: "right", width: 180 },
  { id: "newHigh", label: "MC New High", header: "MC New High · P#C7", code: "P#C7", align: "right", width: 180 },
  { id: "jump", label: "MC Jump", header: "MC Jump · P#C5", code: "P#C5", align: "right", width: 160 },
  { id: "volScore", label: "Vol %/MC Score Δ", header: "Vol % / Score Δ · P#C11", code: "P#C11", align: "right", width: 200 },
  { id: "netAmount", label: "Net Amount", code: "A23", align: "right", width: 160 },
  { id: "history", label: "History", align: "right", width: 140 },
  { id: "alertRealert", label: "Alert/Re-Alert", width: 160 },
  { id: "avgNetTicket", label: "Avg Net Ticket", code: "A24", align: "right", width: 140 },
  { id: "dbaName", label: "DBA Name", width: 180 },
  { id: "daysSinceBoarding", label: "Days Since Boarding", align: "right", width: 170 },
  { id: "feedHealth", label: "Feed Health", code: "A31", width: 120 },
  { id: "largestTxn", label: "Largest Txn", code: "A25", align: "right", width: 130 },
  { id: "mcHighToday", label: "MC High Today", code: "A5", align: "right", width: 140 },
  { id: "mcScore24hAvg", label: "MC Score 24H Avg", code: "A4", align: "right", width: 160 },
  { id: "txnCount", label: "Txn Count", code: "A22", align: "right", width: 110 },
]

export const columnById = (id: ColumnId) => COLUMNS.find((c) => c.id === id)!

export const columnsForScope = (scope: ViewScope) =>
  COLUMNS.filter((c) => !c.scopes || c.scopes.includes(scope))

export const lockedColumns = (scope: ViewScope) => columnsForScope(scope).filter((c) => c.locked)
export const optionalColumns = (scope: ViewScope) => columnsForScope(scope).filter((c) => !c.locked)

export const DEFAULT_VISIBLE: ColumnId[] = [
  "mcc",
  "violated",
  "mcScore",
  "mcBand",
  "scoreDelta",
  "newHigh",
  "jump",
  "volScore",
  "netAmount",
  "history",
  "alertRealert",
]

/** Full ordering of optional columns, with visibility. */
export interface ColumnSetting {
  id: ColumnId
  visible: boolean
}

export function defaultColumnSettings(scope: ViewScope, visible: ColumnId[] = DEFAULT_VISIBLE): ColumnSetting[] {
  const optional = optionalColumns(scope).map((c) => c.id)
  const ordered = [...visible.filter((id) => optional.includes(id)), ...optional.filter((id) => !visible.includes(id))]
  return ordered.map((id) => ({ id, visible: visible.includes(id) }))
}

export interface SavedView {
  id: string
  name: string
  columns: ColumnSetting[]
}

export interface Row {
  alert: Alert
  merchant: Merchant
  status: WorkStatus
  statusNote?: string
}
