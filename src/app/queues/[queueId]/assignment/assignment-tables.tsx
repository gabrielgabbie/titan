"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { SortHeader } from "@/components/titan/badges"
import { gridCell, gridHead, gridRow } from "@/components/titan/grid"
import { PARAMETERS } from "@/lib/data"
import type { DqAssignment } from "@/lib/dq-assignments"
import { useSort } from "@/lib/use-sort"
import { greenBadge } from "./styles"
import { EmptyRow } from "@/components/titan/empty-row"
import { emptyMessage } from "@/lib/empty-message"


function SubTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg bg-card shadow-surface">
      <Table>{children}</Table>
    </div>
  )
}

/** A value with its grey second line, as every cell in the assignment tables shows it. */
function Two({ main, sub }: { main: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <>
      <div>{main}</div>
      {sub && <div className="text-muted-foreground text-xs">{sub}</div>}
    </>
  )
}

export function FiltersTable({ filters }: { filters: DqAssignment["filters"] }) {
  const { sorted, toggle, dirOf } = useSort(filters, { filter: (f) => f.filter, rule: (f) => f.rule, value: (f) => f.value })
  const head = (key: Parameters<typeof toggle>[0], label: string, width?: string) => (
    <TableHead className={cn(gridHead, width)}>
      <SortHeader label={label} dir={dirOf(key)} onClick={() => toggle(key)} />
    </TableHead>
  )
  return (
    <SubTable>
      <TableHeader className="bg-muted">
        <TableRow className="hover:bg-muted">
          {head("filter", "Filter", "w-[240px]")}
          {head("rule", "Rule", "w-[200px]")}
          {head("value", "Value")}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.length === 0 && <EmptyRow colSpan={3}>{emptyMessage("data")}</EmptyRow>}
        {sorted.map((f, i) => (
          <TableRow key={f.filter} className={gridRow(i, f.note ? "h-14" : "h-11")}>
            <TableCell className={gridCell}>{f.filter}</TableCell>
            <TableCell className={gridCell}>{f.rule}</TableCell>
            <TableCell className={gridCell}>
              <Two main={f.value} sub={f.note} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </SubTable>
  )
}

export function ParametersTable({ parameters }: { parameters: DqAssignment["parameters"] }) {
  const { sorted, toggle, dirOf } = useSort(parameters, {
    enabled: (p) => (p.enabled ? 0 : 1),
    parameter: (p) => p.code,
    indicator: (p) => p.indicator,
    threshold: (p) => p.threshold?.value ?? "",
    settings: (p) => p.settings,
    reAlert: (p) => p.reAlert,
  })
  const head = (key: Parameters<typeof toggle>[0], label: string, width?: string) => (
    <TableHead className={cn(gridHead, width)}>
      <SortHeader label={label} dir={dirOf(key)} onClick={() => toggle(key)} />
    </TableHead>
  )
  return (
    <SubTable>
      <TableHeader className="bg-muted">
        <TableRow className="hover:bg-muted">
          {head("enabled", "Enabled", "w-[110px]")}
          {head("parameter", "Parameter", "w-[220px]")}
          {head("indicator", "Parameter Indicator", "w-[220px]")}
          {head("threshold", "Parameter Threshold", "w-[204px]")}
          {head("settings", "Settings", "w-[180px]")}
          {head("reAlert", "Re-Alert Increment")}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.length === 0 && <EmptyRow colSpan={6}>{emptyMessage("data")}</EmptyRow>}
        {sorted.map((p, i) => (
          <TableRow key={p.code} className={gridRow(i, "h-[52px]")}>
            <TableCell className={gridCell}>
              {p.enabled ? (
                <Badge className={greenBadge}>Yes</Badge>
              ) : (
                <Badge variant="outline" className="rounded-full">
                  No
                </Badge>
              )}
            </TableCell>
            <TableCell className={gridCell}>
              <Two main={p.code} sub={PARAMETERS[p.code].name} />
            </TableCell>
            <TableCell className={gridCell}>
              <Two main={p.indicator} sub={p.indicatorNote} />
            </TableCell>
            <TableCell className={cn(gridCell, "max-w-[204px] truncate")}>
              {p.threshold ? <Two main={p.threshold.value} sub={p.threshold.note} /> : "Not used"}
            </TableCell>
            <TableCell className={gridCell}>
              <Two main={p.settings} sub={p.settingsNote} />
            </TableCell>
            <TableCell className={gridCell}>
              <Two main={p.reAlert} sub={p.reAlertNote} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </SubTable>
  )
}
