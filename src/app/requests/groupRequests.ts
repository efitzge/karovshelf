import type { RequestRowData } from "./RequestRow";

export type RequestEntry =
  | { type: "single"; row: RequestRowData }
  | { type: "group"; groupKey: string; rows: RequestRowData[] };

/** A "request the whole set" action (SeriesRequestButton) writes one
 * book_requests row per volume sharing a group_key - this collapses them
 * back into one card for accept/decline, in the same created_at order the
 * ungrouped list already had. See PROJECT_SUMMARY.md #10. */
export function groupRequestRows(rows: RequestRowData[]): RequestEntry[] {
  const byGroup = new Map<string, RequestRowData[]>();
  for (const row of rows) {
    if (!row.groupKey) continue;
    const bucket = byGroup.get(row.groupKey);
    if (bucket) bucket.push(row);
    else byGroup.set(row.groupKey, [row]);
  }

  const entries: RequestEntry[] = [];
  const emitted = new Set<string>();
  for (const row of rows) {
    if (!row.groupKey) {
      entries.push({ type: "single", row });
      continue;
    }
    if (emitted.has(row.groupKey)) continue;
    emitted.add(row.groupKey);
    entries.push({ type: "group", groupKey: row.groupKey, rows: byGroup.get(row.groupKey)! });
  }
  return entries;
}
