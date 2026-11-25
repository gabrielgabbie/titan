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
import { SidebarToggle } from "./sidebar-toggle"
import { UserAvatar } from "./user-avatar"

/** Foresight · Powered by Titan logo, composed from the four Figma SVG assets at their design positions (148.75 × 40),
 *  then scaled to 0.8 so it stands 32px tall, level with the toggle beside it in the 47px header row. */
function ForesightLogo() {
  return (
    <div className="relative h-8 w-[119px]" aria-label="Foresight, powered by Titan" role="img">
      <div className="absolute top-0 left-0 h-10 w-[148.75px] origin-top-left scale-[0.8]">
      {/* eslint-disable @next/next/no-img-element */}
      <img src="/brand/logo-mark.svg" alt="" className="absolute top-0 left-[0.12px] h-[27.065px] w-[22.857px]" />
      <div>
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
    </div>
  )
}

/** Hairline between the sidebar's header, menu and account row: as wide as the menu items, or the icon buttons when
 *  collapsed. */
function SidebarRule() {
  return <div aria-hidden className="mx-2 h-px shrink-0 bg-sidebar-border group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-8" />
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
      {/* Logo on the left and the open/close toggle on the right; collapsed, the toggle alone tops the rail. A fixed
          height keeps the menu from moving when the sidebar collapses. */}
      {/* 47px tall so its separator lines up with the page header's bottom line. The logo mark starts on the menu
          icons' x (16px inset + 8px button padding); the toggle ends on the menu items' right edge. */}
      <SidebarHeader className="h-[47px] flex-row items-center justify-between gap-2 px-2 py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <Link href="/queues" className="flex pl-2 group-data-[collapsible=icon]:hidden">
          <ForesightLogo />
        </Link>
        <SidebarToggle placement="sidebar" className="hidden md:inline-flex" />
      </SidebarHeader>
      <SidebarRule />
      <SidebarContent className="pt-2">
        <SidebarGroup className="gap-0 p-0 px-2 group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Risk</SidebarGroupLabel>
          <SidebarMenu className="gap-0 group-data-[collapsible=icon]:items-center">
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
      <SidebarRule />
      <SidebarFooter className="px-2 pt-2 pb-2 group-data-[collapsible=icon]:px-0">
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
