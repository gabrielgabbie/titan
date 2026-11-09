"use client"

import * as React from "react"
import { toast } from "sonner"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { DISPOSITIONS, type Merchant } from "@/lib/data"
import { useTitan } from "@/lib/store"
import { STATUS_BG, STATUS_LABEL, StatusIcon } from "./badges"

/** Status split-button (opens the Mark Work and Disposition popover) + DQ Details link + status note. */
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
  const { statuses, submitDisposition, openDqDetails } = useTitan()
  const { status } = statuses[merchant.mid]
  const [open, setOpen] = React.useState(false)
  const [wip, setWip] = React.useState(status === "wip")
  const [disposition, setDisposition] = React.useState<string>("")
  const [other, setOther] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setWip(status === "wip")
      setDisposition("")
      setOther("")
    }
  }, [open, status])

  const isOther = disposition.startsWith("Other")
  const canSubmit = (disposition && (!isOther || other.trim())) || wip !== (status === "wip")

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <ButtonGroup className={cn("rounded-md text-white", STATUS_BG[status])}>
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
          <PopoverContent align="start" className="w-[360px] p-0">
            <form
              className="flex flex-col gap-4 p-2.5"
              onSubmit={(e) => {
                e.preventDefault()
                submitDisposition(merchant.mid, { wip, disposition: disposition || undefined, other })
                toast.success(
                  disposition ? "Disposition submitted." : wip ? "Marked as work in progress." : "Work in progress removed."
                )
                setOpen(false)
              }}
            >
              <div>
                <div className="text-sm font-medium">Mark Work and Disposition</div>
                <div className="text-muted-foreground text-sm">
                  {merchant.name} · {merchant.mid}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium">Mark Work</div>
                <div className="flex items-start gap-2">
                  <Checkbox id={`wip-${alertId}`} checked={wip} onCheckedChange={(v) => setWip(v === true)} className="mt-0.5" />
                  <div className="grid gap-1">
                    <Label htmlFor={`wip-${alertId}`} className="font-normal">
                      Work in Progress
                    </Label>
                    <p className="text-muted-foreground text-sm">Locks this merchant to you. Titan only.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div>
                  <div className="text-sm font-medium">Disposition</div>
                  <p className="text-muted-foreground text-sm">Sets Worked on all of this merchant&apos;s alerts in every queue.</p>
                </div>
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
                <Input
                  placeholder="Describe the disposition..."
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  disabled={!isOther}
                  className="ml-6 w-[calc(100%-1.5rem)]"
                  aria-label="Other disposition"
                />
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
        <Button variant="link" size="xs" className="text-link px-0 font-medium" onClick={() => openDqDetails(alertId)}>
          DQ Details
        </Button>
      </div>
      {note && <div className="text-muted-foreground text-xs">{note}</div>}
    </div>
  )
}
