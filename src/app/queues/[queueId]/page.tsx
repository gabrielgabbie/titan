import { Suspense } from "react"
import { notFound } from "next/navigation"
import { QUEUES, getQueue } from "@/lib/data"
import { QueueDetail } from "./queue-detail"

export function generateStaticParams() {
  return QUEUES.map((q) => ({ queueId: q.id }))
}

export default async function QueuePage({ params }: { params: Promise<{ queueId: string }> }) {
  const { queueId } = await params
  if (!getQueue(queueId)) notFound()
  // The report reads ?status= for the tab a Queue View count links to, which needs a Suspense boundary.
  return (
    <Suspense>
      <QueueDetail queueId={queueId} />
    </Suspense>
  )
}
