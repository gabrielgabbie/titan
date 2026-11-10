import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

/** Subtle background / text pairs. Each person always gets the same one. */
const PALETTE = [
  "bg-zinc-100 text-zinc-700",
  "bg-sky-100 text-sky-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-violet-100 text-violet-800",
  "bg-teal-100 text-teal-800",
  "bg-orange-100 text-orange-800",
  "bg-lime-100 text-lime-800",
] as const

/** Stable "random" palette pick from the person's name (FNV-1a hash). */
export function avatarColor(name: string) {
  let h = 0x811c9dc5
  for (const ch of name.trim().toLowerCase()) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 0x01000193)
  }
  return PALETTE[(h >>> 0) % PALETTE.length]
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase()
}

export function UserAvatar({
  name,
  className,
  fallbackClassName,
}: {
  name: string
  className?: string
  /** Overrides the hashed palette (e.g. the sidebar user uses a fixed zinc avatar). */
  fallbackClassName?: string
}) {
  return (
    <Avatar className={className} title={name}>
      <AvatarFallback className={cn("font-medium", avatarColor(name), fallbackClassName)}>{initialsOf(name)}</AvatarFallback>
    </Avatar>
  )
}
