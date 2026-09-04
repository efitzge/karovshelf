"use client";

import { Fragment, useMemo, useState } from "react";
import RequestButton from "./RequestButton";
import SeriesRequestButton from "./SeriesRequestButton";
import { openLibraryUrl } from "@/lib/openLibrary";
import BookCover from "@/components/BookCover";
import SeriesGroupTile from "@/components/SeriesGroupTile";
import { groupBySeries, mergeForDisplay, volumeRangeLabel } from "@/lib/seriesGrouping";

export type SearchResult = {
  id: string;
  condition: string | null;
  book: {
    title: string;
    authors: string[];
    genre: string | null;
    category: string | null;
    cover_url: string | null;
    isbn13: string | null;
    isbn10: string | null;
    series_title: string | null;
    series_volume: number | null;
  } | null;
  owner: { id: string; display_name: string; neighbourhood: string } | null;
};

type SortKey = "title" | "author" | "genre";
type CategoryFilter = "all" | "Fiction" | "Non-fiction" | "Judaica" | "none";

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Fiction", label: "Fiction" },
  { value: "Non-fiction", label: "Non-fiction" },
  { value: "Judaica", label: "Judaica" },
  { value: "none", label: "Uncategorised" },
];

function categoryOf(r: SearchResult): CategoryFilter {
  return (r.book?.category as CategoryFilter) || "none";
}

function CategoryTag({ category }: { category: CategoryFilter }) {
  if (category === "all") return null;
  const styles: Record<string, string> = {
    Fiction: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    "Non-fiction": "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    Judaica: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    none: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  };
  const label = category === "none" ? "Uncategorised" : category;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[category]}`}>
      {label}
    </span>
  );
}

function GroupDetailPanel({ seriesTitle, items }: { seriesTitle: string; items: SearchResult[] }) {
  const first = items[0];
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex items-start gap-3">
        <BookCover book={first.book} variant="icon" className="h-24 w-16 rounded" />
        <div className="min-w-0 flex-1">
          <div className="font-medium">
            {seriesTitle} · {volumeRangeLabel(items)}
          </div>
          <div className="text-sm text-neutral-500">{(first.book?.authors ?? []).join(", ") || "Unknown author"}</div>
          <div className="mt-1 text-xs text-neutral-400">
            {first.owner?.display_name} · {first.owner?.neighbourhood}
          </div>
          <div className="mt-2">
            <SeriesRequestButton libraryItemIds={items.map((i) => i.id)} />
          </div>
        </div>
      </div>
      <ul className="flex flex-col gap-1 border-t border-neutral-100 pt-2 text-xs text-neutral-500 dark:border-neutral-900">
        {items.map((i) => (
          <li key={i.id}>
            Vol. {i.book?.series_volume} — {i.book?.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailPanel({ r }: { r: SearchResult }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <BookCover book={r.book} variant="icon" className="h-24 w-16 rounded" />
      <div className="min-w-0 flex-1">
        <div className="font-medium">{r.book?.title}</div>
        <div className="text-sm text-neutral-500">{(r.book?.authors ?? []).join(", ") || "Unknown author"}</div>
        <div className="mt-1 flex items-center gap-2">
          {r.book?.genre && <span className="text-xs text-neutral-400">{r.book.genre}</span>}
          <CategoryTag category={categoryOf(r)} />
        </div>
        <div className="mt-1 text-xs text-neutral-400">
          {r.owner?.display_name} · {r.owner?.neighbourhood}
          {r.condition ? ` · condition: ${r.condition}` : ""}
        </div>
        {r.book && (
          <a
            href={openLibraryUrl(r.book)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs text-blue-600 underline dark:text-blue-400"
          >
            About this book
          </a>
        )}
        <div className="mt-2">
          <RequestButton libraryItemId={r.id} />
        </div>
      </div>
    </div>
  );
}

export default function SearchResultsView({ results }: { results: SearchResult[] }) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return results.filter((r) => {
      const matchesCategory = category === "all" || categoryOf(r) === category;
      const haystack = `${r.book?.title ?? ""} ${(r.book?.authors ?? []).join(" ")}`.toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [results, query, category]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valueOf = (r: SearchResult) =>
        (sort === "author"
          ? (r.book?.authors ?? []).join(", ")
          : sort === "genre"
            ? r.book?.genre ?? ""
            : r.book?.title ?? ""
        ).toLowerCase();
      const av = valueOf(a);
      const bv = valueOf(b);
      if (av < bv) return -sortDir;
      if (av > bv) return sortDir;
      return 0;
    });
  }, [filtered, sort, sortDir]);

  function toggleSort(key: SortKey) {
    if (sort === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSort(key);
      setSortDir(1);
    }
  }

  // Grouping is scoped per-owner (unlike My Library, results here span many
  // neighbours - two different people's copies of "Vol. 7"/"Vol. 8" aren't a
  // set either of them can lend as one unit).
  const { groups: seriesGroups } = useMemo(
    () => groupBySeries(sorted, { ownerId: (r) => r.owner?.id }),
    [sorted]
  );
  const displayEntries = useMemo(() => mergeForDisplay(sorted, seriesGroups), [sorted, seriesGroups]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex gap-0.5 rounded-lg border border-neutral-300 p-0.5 dark:border-neutral-700">
          <button
            onClick={() => setView("grid")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              view === "grid"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView("table")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              view === "table"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            Table
          </button>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or author..."
          className="w-48 rounded border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
        />

        <div className="flex flex-wrap gap-1">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                category === c.value
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-300 text-neutral-500 dark:border-neutral-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-neutral-400">
          {sorted.length === results.length ? `${results.length} books` : `${sorted.length} of ${results.length} books`}
        </span>
      </div>

      {sorted.length === 0 && (
        <p className="text-sm text-neutral-400">No shareable books match.</p>
      )}

      {view === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-3">
          {displayEntries.map((entry) =>
            entry.type === "single" ? (
              <Fragment key={entry.item.id}>
                <button
                  onClick={() => setOpenId(openId === entry.item.id ? null : entry.item.id)}
                  className={`flex flex-col gap-1 rounded text-left ${openId === entry.item.id ? "ring-2 ring-neutral-900 ring-offset-2 dark:ring-white dark:ring-offset-neutral-950" : ""}`}
                >
                  <BookCover book={entry.item.book} variant="tile" className="aspect-[2/3] w-full" />
                  <span className="truncate text-[11px] text-neutral-500">{entry.item.book?.title}</span>
                </button>
                {openId === entry.item.id && (
                  <div className="col-span-full">
                    <DetailPanel r={entry.item} />
                  </div>
                )}
              </Fragment>
            ) : (
              <Fragment key={entry.group.key}>
                <SeriesGroupTile
                  seriesTitle={entry.group.seriesTitle}
                  volumeLabel={volumeRangeLabel(entry.group.items)}
                  count={entry.group.items.length}
                  coverBook={entry.group.items[0].book}
                  open={openId === entry.group.key}
                  onClick={() => setOpenId(openId === entry.group.key ? null : entry.group.key)}
                />
                {openId === entry.group.key && (
                  <div className="col-span-full">
                    <GroupDetailPanel seriesTitle={entry.group.seriesTitle} items={entry.group.items} />
                  </div>
                )}
              </Fragment>
            )
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                {(["title", "author", "genre"] as SortKey[]).map((key) => (
                  <th key={key} onClick={() => toggleSort(key)} className="cursor-pointer select-none px-3 py-2 font-medium capitalize">
                    {key} {sort === key ? (sortDir === 1 ? "↓" : "↑") : ""}
                  </th>
                ))}
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Neighbour</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <Fragment key={r.id}>
                  <tr className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <BookCover book={r.book} variant="icon" className="h-8 w-6 rounded-sm" />
                        <span className="font-medium">{r.book?.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-neutral-500">{(r.book?.authors ?? []).join(", ") || "—"}</td>
                    <td className="px-3 py-2 text-neutral-500">{r.book?.genre || "—"}</td>
                    <td className="px-3 py-2">
                      <CategoryTag category={categoryOf(r)} />
                    </td>
                    <td className="px-3 py-2 text-neutral-500">
                      {r.owner?.display_name} · {r.owner?.neighbourhood}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => setOpenId(openId === r.id ? null : r.id)}
                        className="rounded bg-neutral-900 px-2 py-1 text-xs text-white dark:bg-white dark:text-neutral-900"
                      >
                        Request
                      </button>
                    </td>
                  </tr>
                  {openId === r.id && (
                    <tr>
                      <td colSpan={6} className="bg-neutral-50 p-3 dark:bg-neutral-900">
                        <DetailPanel r={r} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
