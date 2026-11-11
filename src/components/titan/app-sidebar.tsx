"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronsUpDown, ListChecks, LogOut, Store, UserRound } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CURRENT_USER } from "@/lib/data"
import { UserAvatar } from "./user-avatar"

/** Foresight · Powered by Titan logo, composed from the four Figma SVG assets at their design positions.
 *  Collapsed (icon) sidebar shows the mark only. */
function ForesightLogo() {
  return (
    <div
      className="relative h-10 w-[148.75px] group-data-[collapsible=icon]:h-[27.065px] group-data-[collapsible=icon]:w-[22.857px]"
      aria-label="Foresight, powered by Titan"
      role="img"
    >
      {/* eslint-disable @next/next/no-img-element */}
      <img src="/brand/logo-mark.svg" alt="" className="absolute top-0 left-[0.12px] h-[27.065px] w-[22.857px] group-data-[collapsible=icon]:left-0" />
      <div className="group-data-[collapsible=icon]:hidden">
        <img src="/brand/logo-foresight.svg" alt="" className="absolute top-[0.4px] left-[29.84px] h-[27.5px] w-[118.378px]" />
        <div className="absolute top-[30px] right-[-0.46px] h-[9.143px] w-[77.714px]">
          <img src="/brand/logo-powered-by.svg" alt="" className="absolute top-[1.94px] left-0 h-[6.152px] w-[51.466px]" />
          <div className="absolute top-0 left-[54.45px] h-[9.143px] w-[22.617px] overflow-hidden">
            <img src="/brand/logo-titan.svg" alt="" className="absolute top-0 right-[-0.5px] bottom-[2.92%] w-[22.426px]" />
          </div>
        </div>
      </div>
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  )
}

const NAV = [
  { href: "/queues", label: "Queue View", icon: ListChecks },
  { href: "/merchants", label: "Merchant View", icon: Store },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="inset-shadow-none group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
    >
      <SidebarHeader className="p-0 pt-2">
        <Link
          href="/queues"
          className="flex py-2.5 pl-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2.5"
        >
          <ForesightLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="gap-0.5 px-0 pt-0.5 pb-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Risk</SidebarGroupLabel>
          <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-0 pb-1">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2!"
                >
                  <UserAvatar
                    name={CURRENT_USER.name}
                    className="size-8"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left text-white/82 group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm leading-none font-semibold">{CURRENT_USER.name}</span>
                    <span className="truncate text-xs leading-none">{CURRENT_USER.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">{CURRENT_USER.name}</div>
                  <div className="text-muted-foreground text-xs">{CURRENT_USER.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserRound /> Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
