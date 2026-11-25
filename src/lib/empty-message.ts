/**
 * The one line an empty grid shows, by what produced nothing. `items` names the grid's rows:
 * "alerted merchants" (alert grids), "queues" (Detection Queues), "data" (every other grid).
 */
export function emptyMessage(
  items: string,
  { filtered = false, searched = false, loaded = true }: { filtered?: boolean; searched?: boolean; loaded?: boolean } = {}
) {
  const none = `No ${items} to display.`
  if (filtered && searched) return `${none} Adjust your search or filters.`
  if (filtered) return `${none} Adjust your filter criteria.`
  if (searched) return `${none} Adjust your search criteria.`
  if (!loaded) return `Add a filter or search to show ${items}.`
  return none
}
