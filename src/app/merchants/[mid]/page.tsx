import { notFound } from "next/navigation"
import { MERCHANTS, getMerchant } from "@/lib/data"
import { MerchantDetail } from "./merchant-detail"

export function generateStaticParams() {
  return MERCHANTS.map((m) => ({ mid: m.mid }))
}

export default async function MerchantPage({ params }: { params: Promise<{ mid: string }> }) {
  const { mid } = await params
  if (!getMerchant(mid)) notFound()
  return <MerchantDetail mid={mid} />
}
