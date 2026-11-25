// Mock data for the Titan Foresight prototype (Report Date 10/28/2026).

export type WorkStatus = "unworked" | "wip" | "worked"

export type ParamCode = "P#C1" | "P#C2" | "P#C5" | "P#C7" | "P#C11"

export interface Parameter {
  code: ParamCode
  name: string
  configured: string
}

export const PARAMETERS: Record<ParamCode, Parameter> = {
  "P#C1": { code: "P#C1", name: "MC Band", configured: "Moves up into High or Critical" },
  "P#C2": { code: "P#C2", name: "MC Score Increase vs. Baseline", configured: "Point increase ≥ 40" },
  "P#C5": { code: "P#C5", name: "Largest Single MC Score Jump", configured: "Single-transaction increase ≥ 30" },
  "P#C7": { code: "P#C7", name: "MC New High", configured: "Points above prior high ≥ 20" },
  "P#C11": { code: "P#C11", name: "Volume and MC Score Increase", configured: "Volume ≥ +150% and Δ ≥ +25" },
}

export const PARAM_ORDER: ParamCode[] = ["P#C2", "P#C5", "P#C1", "P#C7", "P#C11"]

export interface Queue {
  id: string
  name: string
  configuration: string
  effective: string
}

export const QUEUES: Queue[] = [
  {
    id: "mc-default-monitoring",
    name: "DQ-Mastercard Default Monitoring",
    configuration: "DQ-MC-DEFAULT-001 v1.0",
    effective: "10/26/2026 12:00:00 AM",
  },
  {
    id: "mc-critical-band-watch",
    name: "DQ-MC Critical Band Watch",
    configuration: "DQ-MC-CRITICAL-002 v1.2",
    effective: "10/01/2026 12:00:00 AM",
  },
  {
    id: "new-and-ramping",
    name: "DQ-New and Ramping Merchants",
    configuration: "DQ-MC-RAMP-003 v2.0",
    effective: "09/15/2026 12:00:00 AM",
  },
]

export const REPORT_DATE = "10/28/2026"

export interface ParamActual {
  code: ParamCode
  actual: string
  nextReAlert: string | null
}

export interface ScoreStats {
  lowest: number
  average: number
  highest: number
}

export interface Merchant {
  mid: string
  name: string
  dba: string
  mcc: string
  mccDescription: string
  client: string
  processor: string
  boarded: string
  daysSinceBoarding: number
  mcScore: number
  scoreDelta: number
  mcNewHigh: number
  mcJump: number
  volumePct: number
  netAmount: number
  avgNetTicket: number
  largestTxn: number
  mcHighToday: number
  mcScore24hAvg: number
  txnCount: number
  feedHealth: string
  history90d: number
  paramActuals: ParamActual[]
  scoreStats: { label: string; stats: ScoreStats }[]
  initialStatus: WorkStatus
  statusNote?: string
}

const periods = ["Trailing 24 Hours", "Prior 7 Days", "Prior 30 Days", "Prior 60 Days", "Prior 90 Days"]
const stats = (rows: [number, number, number][]) =>
  rows.map(([lowest, average, highest], i) => ({ label: periods[i], stats: { lowest, average, highest } }))

export const MERCHANTS: Merchant[] = [
  {
    mid: "492001837716",
    name: "Harbor Lane Bistro LLC",
    dba: "Harbor Lane Bistro",
    mcc: "5812",
    mccDescription: "Eating Places, Restaurants",
    client: "MVRK",
    processor: "Repay",
    boarded: "03/14/2024",
    daysSinceBoarding: 958,
    mcScore: 748,
    scoreDelta: 48,
    mcNewHigh: 10,
    mcJump: 45,
    volumePct: 38,
    netAmount: 12840.5,
    avgNetTicket: 58.37,
    largestTxn: 2400,
    mcHighToday: 748,
    mcScore24hAvg: 742,
    txnCount: 220,
    feedHealth: "4 of 4",
    history90d: 3,
    paramActuals: [
      { code: "P#C2", actual: "+48 points", nextReAlert: "at +63 points" },
      { code: "P#C5", actual: "+45 points", nextReAlert: "at +55 points" },
      { code: "P#C1", actual: "High band (748)", nextReAlert: "at Critical band" },
      { code: "P#C7", actual: "+10 points", nextReAlert: null },
      { code: "P#C11", actual: "+38% volume", nextReAlert: null },
    ],
    scoreStats: stats([
      [735, 742, 748],
      [596, 705, 731],
      [571, 694, 731],
      [548, 671, 731],
      [512, 652, 738],
    ]),
    initialStatus: "unworked",
  },
  {
    mid: "492001902245",
    name: "Apex Digital Goods Inc",
    dba: "Apex Digital",
    mcc: "5816",
    mccDescription: "Digital Goods – Games",
    client: "MVRK",
    processor: "Paysafe",
    boarded: "07/02/2025",
    daysSinceBoarding: 483,
    mcScore: 815,
    scoreDelta: 43,
    mcNewHigh: 22,
    mcJump: 18,
    volumePct: 64,
    netAmount: 11204.3,
    avgNetTicket: 24.9,
    largestTxn: 640,
    mcHighToday: 815,
    mcScore24hAvg: 801,
    txnCount: 450,
    feedHealth: "4 of 4",
    history90d: 5,
    paramActuals: [
      { code: "P#C2", actual: "+43 points", nextReAlert: null },
      { code: "P#C5", actual: "+18 points", nextReAlert: null },
      { code: "P#C1", actual: "Critical band (815)", nextReAlert: null },
      { code: "P#C7", actual: "+22 points", nextReAlert: null },
      { code: "P#C11", actual: "+64% volume", nextReAlert: null },
    ],
    scoreStats: stats([
      [772, 801, 815],
      [701, 760, 793],
      [655, 728, 793],
      [640, 709, 793],
      [612, 690, 793],
    ]),
    initialStatus: "wip",
    statusNote: "Locked by Marcus Lee",
  },
  {
    mid: "492001655390",
    name: "Northgate Auto Repair",
    dba: "Northgate Auto",
    mcc: "7538",
    mccDescription: "Automotive Service Shops",
    client: "Bluefin",
    processor: "Repay",
    boarded: "11/20/2022",
    daysSinceBoarding: 1438,
    mcScore: 821,
    scoreDelta: 36,
    mcNewHigh: 27,
    mcJump: 21,
    volumePct: 12,
    netAmount: 7448.5,
    avgNetTicket: 412.8,
    largestTxn: 3150,
    mcHighToday: 821,
    mcScore24hAvg: 810,
    txnCount: 18,
    feedHealth: "4 of 4",
    history90d: 2,
    paramActuals: [
      { code: "P#C2", actual: "+36 points", nextReAlert: null },
      { code: "P#C5", actual: "+21 points", nextReAlert: null },
      { code: "P#C1", actual: "Critical band (821)", nextReAlert: null },
      { code: "P#C7", actual: "+27 points", nextReAlert: "at +47 points" },
      { code: "P#C11", actual: "+12% volume", nextReAlert: null },
    ],
    scoreStats: stats([
      [794, 810, 821],
      [760, 785, 794],
      [731, 770, 794],
      [702, 755, 794],
      [690, 744, 794],
    ]),
    initialStatus: "worked",
    statusNote: "No Action by Marcus Lee",
  },
  {
    mid: "492002114068",
    name: "Lumen Wellness Supply Co",
    dba: "Lumen Wellness",
    mcc: "5499",
    mccDescription: "Misc. Food Stores – Specialty",
    client: "MVRK",
    processor: "Fiserv",
    boarded: "05/09/2026",
    daysSinceBoarding: 172,
    mcScore: 677,
    scoreDelta: 31,
    mcNewHigh: 6,
    mcJump: 14,
    volumePct: 200,
    netAmount: 21377.15,
    avgNetTicket: 96.3,
    largestTxn: 1280,
    mcHighToday: 681,
    mcScore24hAvg: 668,
    txnCount: 222,
    feedHealth: "3 of 4",
    history90d: 2,
    paramActuals: [
      { code: "P#C2", actual: "+31 points", nextReAlert: null },
      { code: "P#C5", actual: "+14 points", nextReAlert: null },
      { code: "P#C1", actual: "High band (677)", nextReAlert: "at Critical band" },
      { code: "P#C7", actual: "+6 points", nextReAlert: null },
      { code: "P#C11", actual: "+200% volume", nextReAlert: "at +300% volume" },
    ],
    scoreStats: stats([
      [646, 668, 681],
      [610, 640, 675],
      [588, 621, 675],
      [560, 604, 675],
      [541, 590, 675],
    ]),
    initialStatus: "unworked",
    statusNote: "Re-alerted",
  },
  {
    mid: "492002120931",
    name: "Coastline Ticket Exchange",
    dba: "Coastline Tickets",
    mcc: "7922",
    mccDescription: "Theatrical Producers, Ticket Agencies",
    client: "Bluefin",
    processor: "Paysafe",
    boarded: "09/30/2026",
    daysSinceBoarding: 28,
    mcScore: 642,
    scoreDelta: 0,
    mcNewHigh: 0,
    mcJump: 9,
    volumePct: 0,
    netAmount: 8609.8,
    avgNetTicket: 143.5,
    largestTxn: 980,
    mcHighToday: 642,
    mcScore24hAvg: 639,
    txnCount: 60,
    feedHealth: "4 of 4",
    history90d: 1,
    paramActuals: [
      { code: "P#C2", actual: "—", nextReAlert: null },
      { code: "P#C5", actual: "+9 points", nextReAlert: null },
      { code: "P#C1", actual: "High band (642)", nextReAlert: "at Critical band" },
      { code: "P#C7", actual: "—", nextReAlert: null },
      { code: "P#C11", actual: "—", nextReAlert: null },
    ],
    scoreStats: stats([
      [630, 639, 642],
      [630, 636, 642],
      [630, 636, 642],
      [630, 636, 642],
      [630, 636, 642],
    ]),
    initialStatus: "unworked",
  },
]

export interface Alert {
  id: string
  queueId: string
  mid: string
  violated: ParamCode[]
  /** Shown per queue in the merchant's "queues" popover. */
  queueReason: string
  kind: "Alert" | "Re-Alert"
  /** Per-parameter kind when it differs from the alert's own, e.g. a parameter re-alerting in a new alert. */
  paramKinds?: Partial<Record<ParamCode, "Alert" | "Re-Alert">>
  time: string
}

/**
 * Earlier alerts today on a parameter that alerted again later in the day. A disposition covers the queue's
 * alerts so far that day, so an earlier alert keeps the status it had before the later alert came in.
 */
export const EARLIER_TODAY: { mid: string; queueId: string; time: string; code: ParamCode; kind: "Alert" | "Re-Alert"; status: WorkStatus }[] = [
  { mid: "492001837716", queueId: "mc-default-monitoring", time: "12:06:00 PM", code: "P#C5", kind: "Alert", status: "worked" },
]

export const ALERTS: Alert[] = [
  // DQ-Mastercard Default Monitoring
  { id: "a1", queueId: "mc-default-monitoring", mid: "492001837716", violated: ["P#C2", "P#C5", "P#C1"], queueReason: "P#C2 · P#C5 · P#C1 · Avg Score +48 vs. 30 days", kind: "Alert", paramKinds: { "P#C5": "Re-Alert" }, time: "06:12:00 PM" },
  { id: "a2", queueId: "mc-default-monitoring", mid: "492001902245", violated: ["P#C1"], queueReason: "P#C1 · Band moved to Critical (815) from High (772)", kind: "Alert", time: "12:06:00 PM" },
  { id: "a3", queueId: "mc-default-monitoring", mid: "492001655390", violated: ["P#C7"], queueReason: "P#C7 · New high 821, +27 above prior high", kind: "Alert", time: "06:07:00 AM" },
  { id: "a4", queueId: "mc-default-monitoring", mid: "492002114068", violated: ["P#C11"], queueReason: "P#C11 · Volume +200% with Avg Score +31", kind: "Re-Alert", time: "12:06:00 PM" },
  { id: "a5", queueId: "mc-default-monitoring", mid: "492002120931", violated: ["P#C1"], queueReason: "P#C1 · First MC Band on record is High (642)", kind: "Alert", time: "06:12:00 PM" },
  // DQ-MC Critical Band Watch
  { id: "b1", queueId: "mc-critical-band-watch", mid: "492001902245", violated: ["P#C1"], queueReason: "P#C1 · Band moved up into Critical (815)", kind: "Alert", time: "12:06:00 PM" },
  { id: "b2", queueId: "mc-critical-band-watch", mid: "492001655390", violated: ["P#C7"], queueReason: "P#C7 · Critical band, new high 821", kind: "Alert", time: "06:07:00 AM" },
  // DQ-New and Ramping Merchants
  { id: "c1", queueId: "new-and-ramping", mid: "492001837716", violated: ["P#C1"], queueReason: "P#C1 · Band moved up into High or Critical", kind: "Alert", time: "06:12:00 PM" },
  { id: "c2", queueId: "new-and-ramping", mid: "492001902245", violated: ["P#C1"], queueReason: "P#C1 · Band moved up into High or Critical", kind: "Alert", time: "12:06:00 PM" },
  { id: "c3", queueId: "new-and-ramping", mid: "492002114068", violated: ["P#C11"], queueReason: "P#C11 · Volume +200% with MC Score +31", kind: "Alert", time: "12:06:00 PM" },
  { id: "c4", queueId: "new-and-ramping", mid: "492002120931", violated: ["P#C1"], queueReason: "P#C1 · First MC Band on record is High (642)", kind: "Alert", time: "06:12:00 PM" },
]

export const getMerchant = (mid: string) => MERCHANTS.find((m) => m.mid === mid)
export const getQueue = (id: string) => QUEUES.find((q) => q.id === id)
export const getAlert = (id: string) => ALERTS.find((a) => a.id === id)
export const alertsForQueue = (queueId: string) => ALERTS.filter((a) => a.queueId === queueId)
export const alertsForMerchant = (mid: string) => ALERTS.filter((a) => a.mid === mid)

export const paramKind = (a: Alert, code: ParamCode) => a.paramKinds?.[code] ?? a.kind
/** An alert reads Re-Alert only when every parameter in it re-alerted. */
export const alertKind = (a: Alert): "Alert" | "Re-Alert" => (a.violated.every((p) => paramKind(a, p) === "Re-Alert") ? "Re-Alert" : "Alert")

// ---------- MC band ----------
// Score Bands v1.0: Very Low 0–199 · Low 200–399 · Medium 400–599 · High 600–799 · Critical 800–999
export type McBand = "Very Low" | "Low" | "Medium" | "High" | "Critical"
export function mcBand(score: number): McBand {
  if (score >= 800) return "Critical"
  if (score >= 600) return "High"
  if (score >= 400) return "Medium"
  if (score >= 200) return "Low"
  return "Very Low"
}
export const BAND_LEVEL: Record<McBand, number> = { "Very Low": 1, Low: 2, Medium: 3, High: 4, Critical: 5 }

// ---------- DQ details ----------
export interface Cycle {
  time: string
  cycle: string
  alert: boolean
  violated: ParamCode[]
  /** Parameters that re-alerted in this cycle in every queue that alerted on them. */
  reAlerted: ParamCode[]
  score: number
}

export function cyclesFor(alert: Alert, merchant: Merchant): Cycle[] {
  const isEvening = alert.time.endsWith("PM") && alert.time.startsWith("06")
  const reAlerted = alert.violated.filter((p) => paramKind(alert, p) === "Re-Alert")
  if (isEvening) {
    return [
      { time: "06:12:00 PM", cycle: "Cycle 4 of 4", alert: true, violated: alert.violated, reAlerted, score: merchant.mcScore },
      { time: "12:06:00 PM", cycle: "Cycle 3 of 4", alert: false, violated: [], reAlerted: [], score: merchant.mcScore - 3 },
    ]
  }
  return [
    { time: "06:12:00 PM", cycle: "Cycle 4 of 4", alert: false, violated: [], reAlerted: [], score: merchant.mcScore },
    { time: alert.time, cycle: alert.time.endsWith("AM") ? "Cycle 2 of 4" : "Cycle 3 of 4", alert: true, violated: alert.violated, reAlerted, score: merchant.mcScore - 4 },
  ]
}

export interface AlertHistoryRow {
  dateTime: string
  kind: "Alert" | "Re-Alert"
  params: ParamCode[]
  status: WorkStatus
  daysAgo: number
}

export function alertHistoryFor(alert: Alert, merchant: Merchant, currentStatus: WorkStatus): AlertHistoryRow[] {
  const rows: AlertHistoryRow[] = [
    { dateTime: `${REPORT_DATE} ${alert.time}`, kind: alert.kind, params: alert.violated, status: currentStatus, daysAgo: 0 },
  ]
  const past: AlertHistoryRow[] = [
    // Alerts land on MC file cycles; a re-alert follows an earlier alert on the same parameter that day.
    { dateTime: "09/14/2026 06:10:00 PM", kind: "Alert", params: [alert.violated[0]], status: "worked", daysAgo: 44 },
    { dateTime: "08/02/2026 06:14:00 PM", kind: "Re-Alert", params: [alert.violated[Math.min(1, alert.violated.length - 1)]], status: "worked", daysAgo: 87 },
    { dateTime: "08/02/2026 12:05:00 PM", kind: "Alert", params: [alert.violated[Math.min(1, alert.violated.length - 1)]], status: "worked", daysAgo: 87 },
    { dateTime: "06/18/2026 06:08:00 AM", kind: "Alert", params: [alert.violated[0]], status: "worked", daysAgo: 132 },
    { dateTime: "03/03/2026 12:07:00 PM", kind: "Alert", params: [alert.violated[0]], status: "worked", daysAgo: 239 },
  ]
  return rows.concat(past.slice(0, Math.max(0, merchant.history90d - 1) + 3))
}

// ---------- Merchant-level DQ details ----------

/** A queue can configure a parameter differently from the default; only the differences are listed. */
const QUEUE_PARAM_CONFIG: Partial<Record<string, Partial<Record<ParamCode, string>>>> = {
  "mc-critical-band-watch": { "P#C1": "Moves up into Critical" },
}

export const configuredFor = (queueId: string, code: ParamCode) =>
  QUEUE_PARAM_CONFIG[queueId]?.[code] ?? PARAMETERS[code].configured

/** Minutes since midnight, for ordering "06:12:00 PM"-style times. */
const minutesOf = (time: string) => {
  const [hms, ampm] = time.split(" ")
  const [h, m] = hms.split(":").map(Number)
  return ((h % 12) + (ampm === "PM" ? 12 : 0)) * 60 + m
}

export interface ViolatedParam {
  code: ParamCode
  /** Every detection queue that alerted on this parameter today, each with its own configuration. */
  queues: { queueId: string; configured: string }[]
  actual: string
  nextReAlert: string | null
}

/** One row per parameter violated in any of the merchant's alerts, in parameter order. */
export function violatedParamsFor(merchant: Merchant): ViolatedParam[] {
  const alerts = alertsForMerchant(merchant.mid)
  return PARAM_ORDER.flatMap((code) => {
    const queues = alerts.filter((a) => a.violated.includes(code)).map((a) => ({ queueId: a.queueId, configured: configuredFor(a.queueId, code) }))
    if (!queues.length) return []
    const p = merchant.paramActuals.find((x) => x.code === code)
    return [{ code, queues, actual: p?.actual ?? "—", nextReAlert: p?.nextReAlert ?? null }]
  })
}

/** The merchant's latest alert today, as "MM/DD/YYYY hh:mm:ss AM". */
export function lastAlertedFor(mid: string): string {
  const latest = [...alertsForMerchant(mid)].sort((a, b) => minutesOf(b.time) - minutesOf(a.time))[0]
  return latest ? `${REPORT_DATE} ${latest.time}` : "—"
}

export type MerchantCycleRow = Cycle & { queueId: string }

/** Today's cycles that alerted, one row per cycle and detection queue, with the parameters that queue alerted on. */
export function merchantCyclesFor(merchant: Merchant): MerchantCycleRow[] {
  const rows = new Map<string, { time: string; cycle: string; queueId: string; score: number; plain: Set<ParamCode>; re: Set<ParamCode> }>()
  const add = (cycle: string, time: string, queueId: string, score: number, code: ParamCode, kind: "Alert" | "Re-Alert") => {
    const key = `${cycle}|${queueId}`
    const r = rows.get(key) ?? { time, cycle, queueId, score, plain: new Set<ParamCode>(), re: new Set<ParamCode>() }
    ;(kind === "Re-Alert" ? r.re : r.plain).add(code)
    rows.set(key, r)
  }
  for (const a of alertsForMerchant(merchant.mid)) {
    for (const c of cyclesFor(a, merchant).filter((c) => c.alert)) {
      for (const p of c.violated) add(c.cycle, c.time, a.queueId, c.score, p, paramKind(a, p))
    }
  }
  for (const e of EARLIER_TODAY.filter((e) => e.mid === merchant.mid)) {
    add(e.time.endsWith("AM") ? "Cycle 2 of 4" : "Cycle 3 of 4", e.time, e.queueId, merchant.mcScore - 4, e.code, e.kind)
  }
  const order = (id: string) => QUEUES.findIndex((q) => q.id === id)
  return [...rows.values()]
    .map((r) => ({
      time: r.time,
      cycle: r.cycle,
      queueId: r.queueId,
      alert: true,
      score: r.score,
      violated: PARAM_ORDER.filter((p) => r.plain.has(p) || r.re.has(p)),
      reAlerted: PARAM_ORDER.filter((p) => r.re.has(p) && !r.plain.has(p)),
    }))
    .sort((a, b) => minutesOf(b.time) - minutesOf(a.time) || order(a.queueId) - order(b.queueId))
}

export type MerchantAlertHistoryRow = AlertHistoryRow & { queueId: string }

/**
 * One row per parameter each time it alerted, newest first, each with that alert's own status: the latest alerts
 * show their queue's current status, earlier alerts today keep the status they had, earlier days show how they ended.
 */
export function merchantAlertHistoryFor(merchant: Merchant, statusFor: (queueId: string) => WorkStatus): MerchantAlertHistoryRow[] {
  const alerts = alertsForMerchant(merchant.mid)
  if (!alerts.length) return []
  const row = (time: string, queueId: string, code: ParamCode, kind: "Alert" | "Re-Alert", status = statusFor(queueId)): MerchantAlertHistoryRow => ({
    dateTime: `${REPORT_DATE} ${time}`,
    queueId,
    kind,
    params: [code],
    status,
    daysAgo: 0,
  })
  const today = [
    ...alerts.flatMap((a) => a.violated.map((code) => row(a.time, a.queueId, code, paramKind(a, code)))),
    ...EARLIER_TODAY.filter((e) => e.mid === merchant.mid).map((e) => row(e.time, e.queueId, e.code, e.kind, e.status)),
  ].sort((a, b) => minutesOf(b.dateTime.slice(11)) - minutesOf(a.dateTime.slice(11)))
  const past = alertHistoryFor(alerts[0], merchant, statusFor(alerts[0].queueId))
    .slice(1)
    .map((r) => ({ ...r, queueId: alerts[0].queueId }))
  return [...today, ...past]
}

// ---------- Transactions ----------
/** MC reason codes: A0xx for merchants boarded within a year of the report date, A1xx for older ones. */
export const MC_REASON_CODES: Record<string, string> = {
  A001: "New merchant with high chargeback count",
  A002: "New merchant with spike in chargeback total",
  A003: "New merchant is in a high-risk MCC",
  A004: "New merchant with high chargeback volume with cross-border",
  A005: "New merchant with spike in transactions count with cross-border",
  A006: "New merchant with high chargeback volume",
  A007: "New merchant with high ratio of CNP declines",
  A008: "New merchant with spike of CNP purchase amount",
  A009: "New merchant with spike of international transaction count",
  A010: "New merchant with spike of declined transaction count",
  A011: "New merchant with spike in card-not-present transaction count",
  A012: "New merchant with high ticket value of international transactions",
  A013: "New merchant with high ratio of same-card transactions",
  A014: "New merchant with spike in transactions",
  A015: "New merchants with moto deviation",
  A016: "New merchants with refund deviation",
  A017: "Dormant merchant spike in transaction",
  A018: "Merchant with high ratio of auth test transaction",
  A019: "Merchant has high-value recurring transactions from cross-border",
  A020: "Merchant with high volume ratio from same-card transactions",
  A021: "New merchant with complex risky transaction patterns",
  A101: "Yearly onboarded merchants with high chargeback count",
  A102: "Yearly onboarded merchants with spike in chargeback total",
  A103: "Yearly onboarded merchants is in a high-risk MCC",
  A104: "Yearly onboarded merchants with high chargeback volume with cross-border",
  A105: "Yearly onboarded merchants with spike in transactions count with cross-border",
  A106: "Yearly onboarded merchants with high chargeback volume",
  A107: "Yearly onboarded merchants with high ratio of CNP declines",
  A108: "Yearly onboarded merchants with spike of CNP purchase amount",
  A109: "Yearly onboarded merchants with spike of international transaction count",
  A110: "Yearly onboarded merchants with spike of declines transaction count",
  A111: "Yearly onboarded merchants with spike in card-not-present transaction count",
  A112: "Yearly onboarded merchants with high ticket value international transactions",
}

export interface Transaction {
  reportDate: string
  dateTime: string
  card: "Visa" | "Mastercard" | "Discover" | "Amex"
  country: string
  account: string
  bin: string
  type: "Sale" | "Refund"
  amount: number
  responseCode: string
  fileSource: string
  score: number
  reasonCode: string
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const CARDS: { card: Transaction["card"]; prefix: string; weight: number }[] = [
  { card: "Visa", prefix: "4", weight: 0.5 },
  { card: "Mastercard", prefix: "5", weight: 0.3 },
  { card: "Discover", prefix: "6011", weight: 0.1 },
  { card: "Amex", prefix: "37", weight: 0.1 },
]

function pick<T>(rand: () => number, items: { weight: number; value: T }[]): T {
  let r = rand()
  for (const it of items) {
    if ((r -= it.weight) < 0) return it.value
  }
  return items[items.length - 1].value
}

function digits(rand: () => number, n: number) {
  return Array.from({ length: n }, () => Math.floor(rand() * 10)).join("")
}

export function transactionsFor(merchant: Merchant): Transaction[] {
  const rand = seeded(Number(merchant.mid.slice(-6)))
  const rows: Transaction[] = []
  let score = merchant.mcScore
  const [bm, bd, by] = merchant.boarded.split("/").map(Number)
  const isNew = new Date(2026, 9, 28).getTime() - new Date(by, bm - 1, bd).getTime() < 365 * 24 * 60 * 60 * 1000
  const codePool = isNew ? ["A001", "A007", "A011", "A014", "A021"] : ["A101", "A105", "A107", "A111", "A112"]
  const fileSource = `${merchant.processor.toUpperCase()}_TXN_20261028_01.dat`
  // Start at 05:48 PM on the report date and walk backwards ~7 minutes per transaction.
  const start = new Date(2026, 9, 28, 17, 48, 0)
  for (let i = 0; i < merchant.txnCount; i++) {
    const t = new Date(start.getTime() - i * 7 * 60 * 1000 + (i % 3) * 60 * 1000)
    const isRefund = rand() < 0.08
    const amount = Math.round((10 + rand() * merchant.avgNetTicket * 2) * 100) / 100
    const change = isRefund ? 0 : rand() < 0.3 ? 1 : 0
    const { card, prefix } = pick(rand, CARDS.map((c) => ({ weight: c.weight, value: c })))
    const bin = prefix + digits(rand, (rand() < 0.25 ? 8 : 6) - prefix.length)
    const country = pick(rand, [
      { weight: 0.85, value: "USA" },
      { weight: 0.07, value: "Canada" },
      { weight: 0.05, value: "Mexico" },
      { weight: 0.03, value: "United Kingdom" },
    ])
    const responseCode = isRefund ? "00" : pick(rand, [
      { weight: 0.9, value: "00" },
      { weight: 0.06, value: "05" },
      { weight: 0.04, value: "51" },
    ])
    rows.push({
      reportDate: REPORT_DATE,
      dateTime: formatDateTime(t),
      card,
      country,
      account: `${bin.slice(0, 6)}******${digits(rand, 4)}`,
      bin,
      type: isRefund ? "Refund" : "Sale",
      amount: isRefund ? -amount : amount,
      responseCode,
      fileSource,
      score,
      reasonCode: codePool[Math.floor(rand() * codePool.length)],
    })
    score = Math.max(0, score - change)
  }
  return rows
}

// ---------- Notes & cases ----------
export interface Note {
  id: string
  author: string
  dateTime: string
  body: string
  source: "Titan" | "VisionWeb"
}

export const INITIAL_NOTES: Record<string, Note[]> = {
  "492001837716": [
    { id: "n1", author: "Dana Ruiz", dateTime: "10/28/2026 06:40:12 PM", body: "Called owner about the $2,400 sale at 02:14:00 AM. Says it is a catering deposit for an event on 11/02/2026; invoice requested.", source: "Titan" },
    { id: "n2", author: "Marcus Lee", dateTime: "10/21/2026 10:15:03 AM", body: "Annual review complete. Volume in line with application; no change to reserve.", source: "VisionWeb" },
  ],
  "492001902245": [
    { id: "n3", author: "Marcus Lee", dateTime: "10/28/2026 12:31:44 PM", body: "Locked for review. Pulling chargeback ratio for the last 60 days.", source: "Titan" },
  ],
}

export interface Case {
  id: string
  title: string
  open: boolean
  meta: string
}

export const INITIAL_CASES: Record<string, Case[]> = {
  "492001837716": [
    { id: "CS-104882", title: "Action Taken: Hold Funds", open: true, meta: "Open · Dana Ruiz · 28 Oct, 18:45 CT · from disposition Escalate – Open Case" },
    { id: "CS-097310", title: "Chargeback Review", open: false, meta: "Closed 02 Sep 2026 · Marcus Lee · source VW" },
  ],
}

// ---------- Disposition ----------
export const DISPOSITIONS = [
  "Cleared — No Action",
  "Escalated — Phase 2",
  "Contact Merchant",
  "Hold Funds",
  "Termination Recommended",
] as const

export const CURRENT_USER = { name: "Dana Ruiz", email: "dana.ruiz@example.com" }

// ---------- Formatting ----------
export function formatCurrency(n: number) {
  const s = Math.abs(n).toLocaleString("en-US", { style: "currency", currency: "USD" })
  return n < 0 ? `(${s})` : s
}

export function formatDateTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  const h = d.getHours() % 12 || 12
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(h)}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getHours() < 12 ? "AM" : "PM"}`
}

export function formatTime(d: Date) {
  return formatDateTime(d).split(" ").slice(1).join(" ")
}

export function formatSigned(n: number, suffix = "") {
  if (n === 0) return `0${suffix}`
  return `${n > 0 ? "+" : ""}${n}${suffix}`
}
