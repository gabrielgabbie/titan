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
  SidebarSeparator,
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

/** Foresight · Powered by Titan logo, composed from the four Figma SVG assets at their design positions. */
function ForesightLogo() {
  return (
    <div className="relative h-8 w-[119px]" aria-label="Foresight, powered by Titan" role="img">
      {/* eslint-disable @next/next/no-img-element */}
      <img src="/brand/logo-mark.svg" alt="" className="absolute top-0 left-[0.1px] h-[21.652px] w-[18.286px]" />
      <img src="/brand/logo-foresight.svg" alt="" className="absolute top-[0.32px] left-[23.87px] h-[22px] w-[94.702px]" />
      <div className="absolute top-[24px] right-[-0.17px] h-[7.314px] w-[62.171px]">
        <img src="/brand/logo-powered-by.svg" alt="" className="absolute top-[1.56px] left-0 h-[4.922px] w-[41.173px]" />
        <div className="absolute top-0 left-[43.56px] h-[7.314px] w-[18.093px] overflow-hidden">
          <img src="/brand/logo-titan.svg" alt="" className="absolute top-0 right-0 bottom-[2.92%] w-[17.941px]" />
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
    <Sidebar variant="inset" className="border-none">
      <SidebarHeader className="p-0">
        <Link href="/queues" className="flex pt-3 pb-2.5 pl-2.5">
          <ForesightLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0 py-0.5">
          <SidebarGroupLabel className="text-sidebar-ring">Risk</SidebarGroupLabel>
          <SidebarMenu className="gap-0.5">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <SidebarMenuButton
                  key={item.href}
                  asChild
                  isActive={active}
                  className="data-[active=true]:bg-white/12 data-[active=true]:font-normal"
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator className="mx-0 bg-white/12" />
      <SidebarFooter className="px-0 pt-1 pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <UserAvatar name={CURRENT_USER.name} className="size-8 rounded-lg [&>*]:rounded-lg" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{CURRENT_USER.name}</span>
                    <span className="truncate text-xs">{CURRENT_USER.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
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
