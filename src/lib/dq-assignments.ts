import type { ParamCode } from "./data"

/** A DQ Assignment as its DMN upload defines it: who it covers, which merchants it evaluates and how they alert. */
export interface DqAssignment {
  queueId: string
  assignmentId: string
  version: string
  effective: string
  changedBy: string
  status: "Active"
  queueType: "Detection"
  startDate: string
  expirationDate: string
  client: string
  filters: { filter: string; rule: string; value: string; note?: string }[]
  filterSummary: string
  parameters: {
    code: ParamCode
    enabled: boolean
    indicator: string
    indicatorNote: string
    threshold?: { value: string; note: string }
    settings: string
    settingsNote: string
    reAlert: string
    reAlertNote?: string
  }[]
  matchLogic: string
}

const BAND_FILTER = {
  filter: "Band Level",
  rule: "Include",
  value: "Medium 400–599 · High 600–799 · Critical 800–999",
  note: "Excluded: Very Low 0–199 · Low 200–399",
}

const DEFAULT_PARAMETERS: DqAssignment["parameters"] = [
  { code: "P#C1", enabled: true, indicator: "Moves up into High or Critical", indicatorNote: "MC Current Band", settings: "Score Bands v1.0", settingsNote: "vs. prior MC Cycle Close", reAlert: "+1 band level", reAlertNote: "Band rises one more level" },
  { code: "P#C2", enabled: true, indicator: "≥ 40 points", indicatorNote: "Point increase", threshold: { value: "≥ 500", note: "Trailing 24 Hours MC Average Score" }, settings: "Baseline Period", settingsNote: "Prior 30 Days", reAlert: "+15 points" },
  { code: "P#C5", enabled: true, indicator: "≥ 30 points", indicatorNote: "Single-transaction increase", threshold: { value: "≥ $100.00", note: "Transaction amount" }, settings: "Increases only", settingsNote: "Today", reAlert: "+10 points" },
  { code: "P#C7", enabled: true, indicator: "≥ 20 points", indicatorNote: "Points above prior high", settings: "Prior high", settingsNote: "Prior 90 Days", reAlert: "+10 points" },
  { code: "P#C11", enabled: true, indicator: "≥ +150% volume", indicatorNote: "and MC Score Δ ≥ +25", threshold: { value: "≥ $1,000.00", note: "Today’s Net Amount" }, settings: "Baseline Period", settingsNote: "Prior 30 Days", reAlert: "+50% volume" },
]

export const DQ_ASSIGNMENTS: DqAssignment[] = [
  {
    queueId: "mc-default-monitoring",
    assignmentId: "DQ-MC-DEFAULT-001",
    version: "1.0",
    effective: "10/26/2026 12:00:00 AM",
    changedBy: "Priya Shah (Aperia)",
    status: "Active",
    queueType: "Detection",
    startDate: "10/26/2026",
    expirationDate: "04/30/2027",
    client: "MVRK · 1,284 Mastercard merchants",
    filters: [BAND_FILTER, { filter: "MC Score", rule: "At or above", value: "500" }],
    filterSummary: "Evaluate merchants where Band is Medium, High or Critical AND MC Merchant Score is at or above 500.",
    parameters: DEFAULT_PARAMETERS,
    matchLogic: "Match Any",
  },
  {
    queueId: "mc-critical-band-watch",
    assignmentId: "DQ-MC-CRITICAL-002",
    version: "1.2",
    effective: "10/01/2026 12:00:00 AM",
    changedBy: "Priya Shah (Aperia)",
    status: "Active",
    queueType: "Detection",
    startDate: "10/01/2026",
    expirationDate: "03/31/2027",
    client: "MVRK · 1,284 Mastercard merchants",
    filters: [{ filter: "Band Level", rule: "Include", value: "Critical 800–999", note: "Excluded: Very Low 0–199 · Low 200–399 · Medium 400–599 · High 600–799" }],
    filterSummary: "Evaluate merchants where Band is Critical.",
    parameters: DEFAULT_PARAMETERS.map((p) =>
      p.code === "P#C1" ? { ...p, indicator: "Moves up into Critical" } : p.code === "P#C7" ? p : { ...p, enabled: false }
    ),
    matchLogic: "Match Any",
  },
  {
    queueId: "new-and-ramping",
    assignmentId: "DQ-MC-RAMP-003",
    version: "2.0",
    effective: "09/15/2026 12:00:00 AM",
    changedBy: "Priya Shah (Aperia)",
    status: "Active",
    queueType: "Detection",
    startDate: "09/15/2026",
    expirationDate: "09/14/2027",
    client: "MVRK · merchants boarded in the last 365 days",
    filters: [BAND_FILTER, { filter: "Days Since Boarding", rule: "At or below", value: "365" }],
    filterSummary: "Evaluate merchants where Band is Medium, High or Critical AND Days Since Boarding is at or below 365.",
    parameters: DEFAULT_PARAMETERS.map((p) => (p.code === "P#C5" || p.code === "P#C7" ? { ...p, enabled: false } : p)),
    matchLogic: "Match Any",
  },
]

export const dqAssignmentFor = (queueId: string) => DQ_ASSIGNMENTS.find((a) => a.queueId === queueId)
