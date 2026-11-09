import { notFound } from "next/navigation"
import { QUEUES, getQueue } from "@/lib/data"
import { QueueDetail } from "./queue-detail"

export function generateStaticParams() {
  return QUEUES.map((q) => ({ queueId: q.id }))
}

export default async function QueuePage({ params }: { params: Promise<{ queueId: string }> }) {
  const { queueId } = await params
  if (!getQueue(queueId)) notFound()
  return <QueueDetail queueId={queueId} />
}
