import Link from "next/link"
import * as React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarToggle } from "./sidebar-toggle"

export interface Crumb {
  label: string
  href?: string
}

/** Inset header (sidebar toggle + breadcrumb) followed by the page body. */
export function PageShell({ crumbs, children }: { crumbs: Crumb[]; children: React.ReactNode }) {
  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <SidebarToggle />
        <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1
              return (
                <React.Fragment key={c.label}>
                  <BreadcrumbItem>
                    {last || !c.href ? (
                      <BreadcrumbPage>{c.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={c.href}>{c.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!last && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex min-w-0 flex-1 flex-col gap-4 px-5 pt-4 pb-6">{children}</main>
    </>
  )
}
