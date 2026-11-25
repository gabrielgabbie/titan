"use client"

import * as React from "react"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CURRENT_USER, type Note } from "@/lib/data"
import { UserAvatar } from "./user-avatar"
import { useTitan } from "@/lib/store"

function NoteItem({ mid, note }: { mid: string; note: Note }) {
  const { updateNote, deleteNote } = useTitan()
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(note.body)
  const editable = note.author === CURRENT_USER.name

  return (
    <li className="flex gap-3">
      <UserAvatar name={note.author} className="size-10 text-sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg p-3 shadow-surface">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-medium">{note.author}</div>
            <div className="text-muted-foreground text-xs">{note.dateTime}</div>
          </div>
          {editable && !editing && (
            <div className="flex gap-1">
              <Button variant="outline" size="icon-sm" aria-label="Edit note" onClick={() => setEditing(true)}>
                <Pencil />
              </Button>
              <Button
                variant="destructive"
                size="icon-sm"
                aria-label="Delete note"
                onClick={() => {
                  deleteNote(mid, note.id)
                  toast.success("Note deleted.")
                }}
              >
                <Trash2 />
              </Button>
            </div>
          )}
        </div>
        {editing ? (
          <div className="flex flex-col gap-2">
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Edit note" />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setDraft(note.body)
                  setEditing(false)
                }}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                disabled={!draft.trim()}
                onClick={() => {
                  updateNote(mid, note.id, draft.trim())
                  toast.success("Note updated.")
                  setEditing(false)
                }}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm break-words">{note.body}</p>
        )}
        <Badge variant="secondary" className="font-normal">
          {note.source}
        </Badge>
      </div>
    </li>
  )
}

export function MerchantNotes({ mid }: { mid: string }) {
  const { notes, addNote } = useTitan()
  const [draft, setDraft] = React.useState("")
  const list = notes[mid] ?? []

  return (
    <Card className="gap-4 py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-sm font-semibold">Merchant Notes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-3">
        <form
          className="flex flex-col items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            addNote(mid, draft.trim())
            toast.success("Note added.")
            setDraft("")
          }}
        >
          <Textarea placeholder="Add a note" value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-16" aria-label="Add a note" />
          <Button type="submit" size="sm" disabled={!draft.trim()}>
            Add Note
          </Button>
        </form>
        {list.length === 0 ? (
          <p className="text-muted-foreground text-sm">No notes yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {list.map((n) => (
              <NoteItem key={n.id} mid={mid} note={n} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
