export type FieldType = "text" | "number" | "enum"

export interface FilterField<T> {
  id: string
  label: string
  type: FieldType
  /** Allowed values for enum fields. */
  options?: string[]
  /** Value used for matching. Enum fields may return several values (e.g. violated parameters). */
  get: (row: T) => string | number | string[]
}

export interface FilterRule {
  id: string
  field: string
  op: string
  value: string
}

export const OPERATORS: Record<FieldType, { value: string; label: string }[]> = {
  text: [
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "does not contain" },
    { value: "equals", label: "equals" },
    { value: "starts", label: "starts with" },
    { value: "ends", label: "ends with" },
  ],
  number: [
    { value: "eq", label: "=" },
    { value: "neq", label: "≠" },
    { value: "gt", label: ">" },
    { value: "gte", label: "≥" },
    { value: "lt", label: "<" },
    { value: "lte", label: "≤" },
  ],
  enum: [
    { value: "is", label: "is" },
    { value: "is_not", label: "is not" },
  ],
}

let seq = 0
export const newRule = (field = "", type: FieldType = "text"): FilterRule => ({
  id: `f${++seq}`,
  field,
  op: field ? OPERATORS[type][0].value : "",
  value: "",
})

/** A rule only applies once column, operator and value are all set. */
export const isComplete = (r: FilterRule) => Boolean(r.field && r.op && r.value.trim() !== "")

function matches<T>(row: T, rule: FilterRule, field: FilterField<T>): boolean {
  const raw = field.get(row)
  const value = rule.value.trim()

  if (field.type === "number") {
    const n = Number(raw)
    const v = Number(value)
    if (Number.isNaN(v)) return true
    switch (rule.op) {
      case "eq": return n === v
      case "neq": return n !== v
      case "gt": return n > v
      case "gte": return n >= v
      case "lt": return n < v
      case "lte": return n <= v
    }
    return true
  }

  if (field.type === "enum") {
    const values = Array.isArray(raw) ? raw : [String(raw)]
    const has = values.includes(value)
    return rule.op === "is_not" ? !has : has
  }

  const s = String(raw).toLowerCase()
  const v = value.toLowerCase()
  switch (rule.op) {
    case "contains": return s.includes(v)
    case "not_contains": return !s.includes(v)
    case "equals": return s === v
    case "starts": return s.startsWith(v)
    case "ends": return s.endsWith(v)
  }
  return true
}

/** All complete rules must match (AND). */
export function applyFilters<T>(rows: T[], rules: FilterRule[], fields: FilterField<T>[]): T[] {
  const active = rules.filter(isComplete)
  if (active.length === 0) return rows
  const byId = new Map(fields.map((f) => [f.id, f]))
  return rows.filter((row) =>
    active.every((rule) => {
      const field = byId.get(rule.field)
      return field ? matches(row, rule, field) : true
    })
  )
}
