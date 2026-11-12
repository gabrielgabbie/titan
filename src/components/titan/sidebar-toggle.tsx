"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * Sidebar open/close toggle with its tooltip. `placement="sidebar"` is the one in the sidebar's header (desktop),
 * styled for the dark sidebar; `placement="header"` is the page header's, shown on phones where the sidebar is hidden.
 */
export function SidebarToggle({ placement = "header", className }: { placement?: "sidebar" | "header"; className?: string }) {
  const { state, isMobile } = useSidebar()
  const expanded = state === "expanded"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger
          className={cn(
            "size-8",
            // The page's light ghost hover would turn white on the dark sidebar and hide the icon; use the sidebar's accent.
            placement === "sidebar" &&
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            className
          )}
        />
      </TooltipTrigger>
      <TooltipContent side={placement === "sidebar" && expanded ? "bottom" : "right"} hidden={isMobile}>
        {expanded ? "Close sidebar" : "Open sidebar"}
      </TooltipContent>
    </Tooltip>
  )
}
