"use client"

import * as React from "react"
import { toast } from "sonner"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { DISPOSITIONS, type Merchant } from "@/lib/data"
import { useTitan } from "@/lib/store"
import { STATUS_BG, STATUS_LABEL, StatusIcon } from "./badges"

const POPOVER_WIDTH = 360

/** Status split-button (opens the Mark Work and Disposition popover) + status note. */
export function DispositionControl({
  merchant,
  alertId,
  note,
}: {
  merchant: Merchant
  alertId: string
  /** Optional line under the control, e.g. "Locked by Marcus Lee". */
  note?: string
}) {
  const { statuses, submitDisposition } = useTitan()
  const { status } = statuses[alertId]
  const [open, setOpen] = React.useState(false)
  // Align the popover's left edge with the button; when it would not fit on screen, align right edges instead.
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const [align, setAlign] = React.useState<"start" | "end">("start")
  const onOpenChange = (next: boolean) => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (next && rect) setAlign(rect.left + POPOVER_WIDTH + 8 > document.documentElement.clientWidth ? "end" : "start")
    setOpen(next)
  }
  const [wip, setWip] = React.useState(status === "wip")
  const [disposition, setDisposition] = React.useState<string>("")

  React.useEffect(() => {
    if (open) {
      setWip(status === "wip")
      setDisposition("")
    }
  }, [open, status])

  const canSubmit = !!disposition || wip !== (status === "wip")

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={onOpenChange}>
          <PopoverAnchor asChild>
            <ButtonGroup ref={anchorRef} className={cn("rounded-md text-white", STATUS_BG[status])}>
              <PopoverTrigger asChild>
                <Button size="xs" className={cn("min-w-[75px] justify-center text-white shadow-none", STATUS_BG[status])}>
                  <StatusIcon status={status} />
                  {STATUS_LABEL[status]}
                </Button>
              </PopoverTrigger>
              <ButtonGroupSeparator className="bg-white/30" />
              <PopoverTrigger asChild>
                <Button size="icon-xs" className={cn("text-white shadow-none", STATUS_BG[status])} aria-label="Mark work and disposition">
                  <ChevronDown />
                </Button>
              </PopoverTrigger>
            </ButtonGroup>
          </PopoverAnchor>
          <PopoverContent align={align} className="p-0" style={{ width: POPOVER_WIDTH }}>
            <form
              className="flex flex-col gap-3 p-2.5"
              onSubmit={(e) => {
                e.preventDefault()
                submitDisposition(alertId, { wip, disposition: disposition || undefined })
                toast.success(
                  disposition ? "Disposition submitted." : wip ? "Marked as work in progress." : "Work in progress removed."
                )
                setOpen(false)
              }}
            >
              <div className="flex flex-col gap-2.5">
                <div className="text-sm font-medium">Mark Work</div>
                <div className="flex items-center gap-2">
                  <Checkbox id={`wip-${alertId}`} checked={wip} onCheckedChange={(v) => setWip(v === true)} />
                  <Label htmlFor={`wip-${alertId}`} className="font-normal">
                    Work in Progress
                  </Label>
                </div>
              </div>

              <div className="inset-shadow-edge-t h-px" role="separator" />

              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium">Disposition</div>
                <RadioGroup value={disposition} onValueChange={setDisposition} className="gap-2">
                  {DISPOSITIONS.map((d) => (
                    <div key={d} className="flex items-center gap-2">
                      <RadioGroupItem value={d} id={`${alertId}-${d}`} />
                      <Label htmlFor={`${alertId}-${d}`} className="font-normal">
                        {d}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={!canSubmit}>
                  Submit
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
      </div>
      {note && <div className="text-muted-foreground max-w-[126px] truncate text-xs" title={note}>{note}</div>}
    </div>
  )
}
