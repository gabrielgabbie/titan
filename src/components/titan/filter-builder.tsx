"use client"

import * as React from "react"
import { Filter, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { OPERATORS, isComplete, newRule, type FilterField, type FilterRule } from "@/lib/filters"
import { CountBadge } from "./badges"

function FilterRow<T>({
  rule,
  fields,
  onChange,
  onRemove,
  showLabels,
}: {
  rule: FilterRule
  fields: FilterField<T>[]
  onChange: (r: FilterRule) => void
  onRemove: () => void
  showLabels: boolean
}) {
  const field = fields.find((f) => f.id === rule.field)
  const ops = field ? OPERATORS[field.type] : []
  const label = (text: string) =>
    showLabels ? <span className="text-muted-foreground mb-1.5 block text-xs font-medium">{text}</span> : null

  return (
    <div className="flex items-end gap-2" data-filter-row>
      <Button variant="ghost" size="icon-sm" className="mb-0 shrink-0" aria-label="Remove filter" onClick={onRemove}>
        <X />
      </Button>

      <div className="min-w-0 flex-1">
        {label("Column")}
        <Select
          value={rule.field}
          onValueChange={(id) => {
            const f = fields.find((x) => x.id === id)!
            onChange({ ...rule, field: id, op: OPERATORS[f.type][0].value, value: "" })
          }}
        >
          <SelectTrigger size="sm" className="w-full" aria-label="Column">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {fields.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[160px] shrink-0">
        {label("Operator")}
        <Select value={rule.op} onValueChange={(op) => onChange({ ...rule, op })} disabled={!field}>
          <SelectTrigger size="sm" className="w-full" aria-label="Operator">
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent>
            {ops.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 flex-1">
        {label("Value")}
        {field?.type === "enum" ? (
          <Select value={rule.value} onValueChange={(value) => onChange({ ...rule, value })}>
            <SelectTrigger size="sm" className="w-full" aria-label="Value">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            className="h-8"
            aria-label="Value"
            type={field?.type === "number" ? "number" : "text"}
            inputMode={field?.type === "number" ? "decimal" : undefined}
            placeholder={field ? (field.type === "number" ? "Enter number" : "Enter value") : "Select a column first"}
            disabled={!field}
            value={rule.value}
            onChange={(e) => onChange({ ...rule, value: e.target.value })}
          />
        )}
      </div>
    </div>
  )
}

/** "Filters" popover: build any number of column / operator / value rules (combined with AND). */
export function FilterBuilder<T>({
  fields,
  rules,
  onChange,
}: {
  fields: FilterField<T>[]
  rules: FilterRule[]
  onChange: (rules: FilterRule[]) => void
}) {
  const [open, setOpen] = React.useState(false)
  const active = rules.filter(isComplete).length

  // Opening with no rules starts with one empty row, like the concept.
  const handleOpen = (o: boolean) => {
    setOpen(o)
    if (o && rules.length === 0) onChange([newRule()])
    // Drop rows that were left blank when closing.
    if (!o) onChange(rules.filter((r) => r.field || r.value))
  }

  const update = (r: FilterRule) => onChange(rules.map((x) => (x.id === r.id ? r : x)))
  const remove = (id: string) => onChange(rules.filter((x) => x.id !== id))

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn((open || active > 0) && "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary")}
        >
          <Filter />
          Filter
          {active > 0 && <CountBadge count={active} active />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(720px,calc(100vw-2rem))] p-0">
        <div className="flex flex-col gap-3 p-4">
          <div className="text-base font-medium">Filters</div>
          {rules.length === 0 ? (
            <p className="text-muted-foreground text-sm">No filters applied.</p>
          ) : (
            rules.map((r, i) => (
              <FilterRow
                key={r.id}
                rule={r}
                fields={fields}
                showLabels={i === 0}
                onChange={update}
                onRemove={() => remove(r.id)}
              />
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t px-2 py-2">
          <Button variant="ghost" size="sm" className="text-link hover:text-link" onClick={() => onChange([...rules, newRule()])}>
            <Plus /> Add filter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-link hover:text-link"
            disabled={rules.length === 0}
            onClick={() => onChange([])}
          >
            <X /> Remove all
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
