/**
 * Collapses obvious multi-volume sets ("A Daily Dose of Torah, Vol. 1-13")
 * into one display group instead of N separate library/search entries.
 *
 * books.series_title/series_volume are computed at catalogue-write time by
 * the Python pipeline's detect_series() (see PROJECT_SUMMARY.md #10) - this
 * only groups what's already tagged, it does no detection of its own.
 *
 * MIN_GROUP_SIZE=3 matches the "obvious set" framing this was built for
 * (a 13-volume Daily Dose of Torah, four Sandman volumes) - two related
 * books sit fine as two ordinary entries without needing a collapsed card.
 */
export const MIN_SERIES_GROUP_SIZE = 3;

type SeriesBook = { series_title: string | null; series_volume: number | null } | null | undefined;

/** Groups differing only by a leading article ("The Sages" / "Sages") are
 * the same series - normalise for grouping, but keep the original string
 * for display (the most common member's own title wins). */
function groupKey(seriesTitle: string): string {
  return seriesTitle.trim().toLowerCase().replace(/^(the|a|an)\s+/, "");
}

/**
 * `ownerId`, when given, scopes grouping to one owner at a time - required
 * on Search (results span many neighbours; two different people's copies of
 * "Vol. 7"/"Vol. 8" are not a borrowable set together) but unnecessary on My
 * Library, which is implicitly single-owner already.
 */
export function groupBySeries<T extends { book: SeriesBook }>(
  items: T[],
  options: { minGroupSize?: number; ownerId?: (item: T) => string | null | undefined } = {}
): { groups: SeriesGroup<T>[]; ungrouped: T[] } {
  const { minGroupSize = MIN_SERIES_GROUP_SIZE, ownerId } = options;
  const byKey = new Map<string, T[]>();
  for (const item of items) {
    const title = item.book?.series_title;
    if (!title) continue;
    const owner = ownerId ? ownerId(item) ?? "" : "";
    const key = owner + "::" + groupKey(title);
    const bucket = byKey.get(key);
    if (bucket) bucket.push(item);
    else byKey.set(key, [item]);
  }

  const groups: { key: string; seriesTitle: string; items: T[] }[] = [];
  const grouped = new Set<T>();
  for (const [key, bucket] of byKey) {
    if (bucket.length < minGroupSize) continue;
    // Numbered volumes first, in order (e.g. detect_series() found "Vol.
    // 11"/"Vol. 13" among 14 real "A Daily Dose of Torah" books) - the rest
    // share the series but carry no number (cluster_series_by_prefix()
    // only had a title prefix to go on), so they sort alphabetically after.
    bucket.sort((a, b) => {
      const av = a.book?.series_volume;
      const bv = b.book?.series_volume;
      if (av != null && bv != null) return av - bv;
      if (av != null) return -1;
      if (bv != null) return 1;
      return 0;
    });
    // Display title: whichever exact string is most common in the group,
    // so "The Sages" (3 items) wins over a lone "Sages" (1 item).
    const counts = new Map<string, number>();
    for (const item of bucket) {
      const t = item.book?.series_title ?? "";
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    const seriesTitle = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    groups.push({ key, seriesTitle, items: bucket });
    for (const item of bucket) grouped.add(item);
  }

  const ungrouped = items.filter((item) => !grouped.has(item));
  return { groups, ungrouped };
}

export type SeriesGroup<T> = { key: string; seriesTitle: string; items: T[] };
export type DisplayEntry<T> = { type: "single"; item: T } | { type: "group"; group: SeriesGroup<T> };

/** Walks `sortedItems` in its existing sort order, emitting a group entry
 * once at the position of its first member, so grouped and ungrouped items
 * stay interleaved in roughly the same order the flat list already had. */
export function mergeForDisplay<T extends { book: SeriesBook }>(
  sortedItems: T[],
  groups: SeriesGroup<T>[]
): DisplayEntry<T>[] {
  const groupByItem = new Map<T, SeriesGroup<T>>();
  for (const group of groups) {
    for (const item of group.items) groupByItem.set(item, group);
  }
  const entries: DisplayEntry<T>[] = [];
  const emitted = new Set<SeriesGroup<T>>();
  for (const item of sortedItems) {
    const group = groupByItem.get(item);
    if (!group) {
      entries.push({ type: "single", item });
    } else if (!emitted.has(group)) {
      entries.push({ type: "group", group });
      emitted.add(group);
    }
  }
  return entries;
}

export function volumeRangeLabel(items: { book: SeriesBook }[]): string {
  const volumes = items
    .map((i) => i.book?.series_volume)
    .filter((v): v is number => typeof v === "number")
    .sort((a, b) => a - b);
  if (volumes.length === 0) return "";
  const min = volumes[0];
  const max = volumes[volumes.length - 1];
  return min === max ? `Vol. ${min}` : `Vol. ${min}–${max}`;
}
