"use client"

import * as React from "react"
import {
  CURRENT_USER,
  INITIAL_CASES,
  INITIAL_NOTES,
  MERCHANTS,
  formatDateTime,
  type Case,
  type Note,
  type WorkStatus,
} from "./data"
import { defaultColumnSettings, type SavedView, type ViewScope } from "./columns"

interface MerchantStatus {
  status: WorkStatus
  note?: string
}

interface ViewState {
  views: SavedView[]
  activeId: string
  defaultId: string
}

interface TitanState {
  reportDate: Date
  setReportDate: (d: Date) => void

  statuses: Record<string, MerchantStatus>
  /** Apply Mark Work / Disposition. A disposition marks Worked on all of the merchant's alerts in every queue. */
  submitDisposition: (mid: string, input: { wip: boolean; disposition?: string; other?: string }) => void

  viewState: Record<ViewScope, ViewState>
  setActiveView: (scope: ViewScope, id: string) => void
  saveView: (scope: ViewScope, view: SavedView, makeDefault: boolean) => void
  deleteView: (scope: ViewScope, id: string) => void

  notes: Record<string, Note[]>
  addNote: (mid: string, body: string) => void
  updateNote: (mid: string, id: string, body: string) => void
  deleteNote: (mid: string, id: string) => void

  cases: Record<string, Case[]>
  createCase: (mid: string) => void

  /** The merchant whose DQ Details dialog is open. */
  dqMid: string | null
  openDqDetails: (mid: string) => void
  closeDqDetails: () => void
}

const TitanContext = React.createContext<TitanState | null>(null)

function initialViews(scope: ViewScope): ViewState {
  return {
    views: [
      { id: "my-view", name: "My View", columns: defaultColumnSettings(scope) },
      { id: "default-view", name: "Default view", columns: defaultColumnSettings(scope) },
      {
        id: "high-score-focus",
        name: "High score focus",
        columns: defaultColumnSettings(scope, ["mcc", "mcScore", "mcBand", "scoreDelta", "newHigh", "mcHighToday", "mcScore24hAvg", "netAmount"]),
      },
    ],
    activeId: "my-view",
    defaultId: "my-view",
  }
}

const dispositionShort = (d: string) => {
  const [, after] = d.split(" — ")
  return after ?? d
}

export function TitanProvider({ children }: { children: React.ReactNode }) {
  const [reportDate, setReportDate] = React.useState(() => new Date(2026, 9, 28))
  const [statuses, setStatuses] = React.useState<Record<string, MerchantStatus>>(() =>
    Object.fromEntries(MERCHANTS.map((m) => [m.mid, { status: m.initialStatus, note: m.statusNote }]))
  )
  const [viewState, setViewState] = React.useState<Record<ViewScope, ViewState>>(() => ({
    queue: initialViews("queue"),
    merchant: initialViews("merchant"),
  }))
  const [notes, setNotes] = React.useState(INITIAL_NOTES)
  const [cases, setCases] = React.useState(INITIAL_CASES)
  const [dqMid, setDqMid] = React.useState<string | null>(null)

  const value = React.useMemo<TitanState>(
    () => ({
      reportDate,
      setReportDate,
      statuses,
      submitDisposition: (mid, { wip, disposition, other }) => {
        setStatuses((prev) => {
          let next: MerchantStatus
          if (disposition) {
            const label = disposition.startsWith("Other") ? other?.trim() || "Other" : dispositionShort(disposition)
            next = { status: "worked", note: `${label} by ${CURRENT_USER.name}` }
          } else if (wip) {
            next = { status: "wip", note: `Locked by ${CURRENT_USER.name}` }
          } else {
            next = { status: "unworked" }
          }
          return { ...prev, [mid]: next }
        })
      },
      viewState,
      setActiveView: (scope, id) => setViewState((p) => ({ ...p, [scope]: { ...p[scope], activeId: id } })),
      saveView: (scope, view, makeDefault) =>
        setViewState((p) => {
          const s = p[scope]
          const exists = s.views.some((v) => v.id === view.id)
          const views = exists ? s.views.map((v) => (v.id === view.id ? view : v)) : [...s.views, view]
          return {
            ...p,
            [scope]: {
              views,
              activeId: view.id,
              defaultId: makeDefault ? view.id : s.defaultId === view.id ? "default-view" : s.defaultId,
            },
          }
        }),
      deleteView: (scope, id) =>
        setViewState((p) => {
          const s = p[scope]
          const views = s.views.filter((v) => v.id !== id)
          const fallback = views[0]?.id ?? ""
          return {
            ...p,
            [scope]: {
              views,
              activeId: s.activeId === id ? (s.defaultId !== id ? s.defaultId : fallback) : s.activeId,
              defaultId: s.defaultId === id ? fallback : s.defaultId,
            },
          }
        }),
      notes,
      addNote: (mid, body) =>
        setNotes((p) => ({
          ...p,
          [mid]: [
            {
              id: `n-${Date.now()}`,
              author: CURRENT_USER.name,
              dateTime: formatDateTime(new Date()),
              body,
              source: "Titan",
            },
            ...(p[mid] ?? []),
          ],
        })),
      updateNote: (mid, id, body) =>
        setNotes((p) => ({ ...p, [mid]: (p[mid] ?? []).map((n) => (n.id === id ? { ...n, body } : n)) })),
      deleteNote: (mid, id) => setNotes((p) => ({ ...p, [mid]: (p[mid] ?? []).filter((n) => n.id !== id) })),
      cases,
      createCase: (mid) =>
        setCases((p) => {
          const list = p[mid] ?? []
          const id = `CS-${105000 + list.length + 1}`
          return {
            ...p,
            [mid]: [
              { id, title: "New Case", open: true, meta: `Open · ${CURRENT_USER.name} · ${formatDateTime(new Date())} · created in Titan` },
              ...list,
            ],
          }
        }),
      dqMid,
      openDqDetails: setDqMid,
      closeDqDetails: () => setDqMid(null),
    }),
    [reportDate, statuses, viewState, notes, cases, dqMid]
  )

  return <TitanContext.Provider value={value}>{children}</TitanContext.Provider>
}

export function useTitan() {
  const ctx = React.useContext(TitanContext)
  if (!ctx) throw new Error("useTitan must be used inside TitanProvider")
  return ctx
}
