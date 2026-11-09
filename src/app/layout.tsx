import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/titan/app-sidebar"
import { DqDetailsDialog } from "@/components/titan/dq-details-dialog"
import { TitanProvider } from "@/lib/store"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Foresight · Titan",
  description: "Titan Foresight — Mastercard detection queues and alerted merchants",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. crypto wallets, password managers) inject
    // attributes on <html>/<body> before React hydrates. This only silences attribute diffs on these two tags.
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <TitanProvider>
          <TooltipProvider>
            <SidebarProvider className="titan-sidebar-bg" style={{ "--sidebar-width": "16.5rem" } as React.CSSProperties}>
              <AppSidebar />
              <SidebarInset className="min-w-0">{children}</SidebarInset>
            </SidebarProvider>
            <DqDetailsDialog />
            <Toaster
              theme="light"
              position="top-right"
              offset={24}
              mobileOffset={16}
              toastOptions={{ className: "titan-toast" }}
            />
          </TooltipProvider>
        </TitanProvider>
      </body>
    </html>
  )
}
