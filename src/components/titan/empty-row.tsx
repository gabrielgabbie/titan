import { TableCell, TableRow } from "@/components/ui/table"

/** The single muted line a grid shows when it has no rows, spanning every column. */
export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="text-muted-foreground h-20 text-center text-sm whitespace-normal">
        {children}
      </TableCell>
    </TableRow>
  )
}
