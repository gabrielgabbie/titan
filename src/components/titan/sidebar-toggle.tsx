"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** Header sidebar toggle with the Figma "Collapse Sidebar" / "Expand Sidebar" tooltip. */
export function SidebarToggle() {
  const { state, isMobile } = useSidebar()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger className="size-8" />
      </TooltipTrigger>
      <TooltipContent side="right" hidden={isMobile}>
        {state === "expanded" ? "Collapse Sidebar" : "Expand Sidebar"}
      </TooltipContent>
    </Tooltip>
  )
}
