"use client"

import Link from "next/link"
import { BadgeInfo } from "lucide-react"

import { cn } from "@/lib/utils"
import { getQueue, type Merchant } from "@/lib/data"
import { useTitan } from "@/lib/store"

/** Every text link in Titan: link blue, medium weight, underline on hover. */
export const linkClass = "text-link font-medium underline-offset-2 hover:underline"

/** A detection queue's name always opens its DQ Assignment. */
export const assignmentHref = (queueId: string) => `/queues/${queueId}/assignment`

/** A queue's alerted merchants report, optionally opened on one status tab. */
export const reportHref = (queueId: string, status?: string) => `/queues/${queueId}${status ? `?status=${status}` : ""}`

export function QueueLink({ queueId, className, onClick }: { queueId: string; className?: string; onClick?: () => void }) {
  return (
    <Link href={assignmentHref(queueId)} className={cn(linkClass, className)} onClick={onClick}>
      {getQueue(queueId)?.name}
    </Link>
  )
}

/** The small outline chip beside a merchant name that opens the merchant's DQ Details. */
export function DqDetailsBadge({ merchant }: { merchant: Merchant }) {
  const { openDqDetails } = useTitan()
  return (
    <button
      type="button"
      onClick={() => openDqDetails(merchant.mid)}
      aria-label={`DQ Details for ${merchant.name}`}
      className="bg-card shadow-surface hover:bg-accent inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-medium whitespace-nowrap"
    >
      <BadgeInfo className="size-3" aria-hidden />
      DQ Details
    </button>
  )
}
