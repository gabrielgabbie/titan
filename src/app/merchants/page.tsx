"use client"

import { AlertGrid } from "@/components/titan/alert-grid"
import { PageShell } from "@/components/titan/page-shell"
import { ViewToolbar } from "@/components/titan/toolbar"
import { useRows } from "@/lib/use-rows"

export default function MerchantViewPage() {
  const rows = useRows()
  return (
    <PageShell crumbs={[{ label: "Merchant View" }]}>
      <h1 className="text-lg font-semibold">Alerted Merchants</h1>
      <ViewToolbar scope="merchant" />
      <AlertGrid rows={rows} scope="merchant" paginate />
    </PageShell>
  )
}
