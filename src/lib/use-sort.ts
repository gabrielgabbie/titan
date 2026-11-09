"use client"

import * as React from "react"

export type Dir = "asc" | "desc"

/** Click-to-cycle sorting (asc → desc → none) for small client-side tables. */
export function useSort<T, K extends string>(rows: T[], accessors: Record<K, (row: T) => string | number>) {
  const [sort, setSort] = React.useState<{ key: K; dir: Dir } | null>(null)

  const sorted = React.useMemo(() => {
    if (!sort) return rows
    const get = accessors[sort.key]
    return [...rows].sort((a, b) => {
      const va = get(a)
      const vb = get(b)
      const c = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb))
      return sort.dir === "asc" ? c : -c
    })
    // accessors are static per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort])

  const toggle = (key: K) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null))

  const dirOf = (key: K) => (sort?.key === key ? sort.dir : null)

  return { sorted, toggle, dirOf }
}
