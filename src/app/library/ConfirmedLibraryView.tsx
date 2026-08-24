"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import type { LibraryItemWithBook } from "./LibraryItemCard";
import LibraryItemCard from "./LibraryItemCard";
import { setShareable, deleteItem } from "./actions";

type SortKey = "title" | "author" | "genre";
type CategoryFilter = "all" | "Fiction" | "Non-fiction" | "Judaica" | "none";

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Fiction", label: "Fiction" },
  { value: "Non-fiction", label: "Non-fiction" },
  { value: "Judaica", label: "Judaica" },
  { value: "none", label: "Uncategorised" },
];

function categoryOf(item: LibraryItemWithBook): CategoryFilter {
  return (item.book?.category as CategoryFilter) || "none";
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

function ShareSwitch({ item }: { item: LibraryItemWithBook }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={item.shareable}
      disabled={pending}
      onClick={() => startTransition(() => setShareable(item.id, !item.shareable))}
      className={`relative h-4 w-7 flex-none rounded-full transition-colors disabled:opacity-50 ${
        item.shareable ? "bg-neutral-900 dark:bg-white" : "bg-neutral-300 dark:bg-neutral-700"
      }`}
    >
      <span
        className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform dark:bg-neutral-900 ${
          item.shareable ? "left-3.5" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function ConfirmedLibraryView({ items }: { items: LibraryItemWithBook[] }) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const visible = items.filter((i) => !removedIds.has(i.id));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visible.filter((item) => {
      const matchesCategory = category === "all" || categoryOf(item) === category;
      const haystack = `${item.book?.title ?? ""} ${(item.book?.authors ?? []).join(" ")}`.toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [visible, query, category]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valueOf = (i: LibraryItemWithBook) =>
        (sort === "author"
          ? (i.book?.authors ?? []).join(", ")
          : sort === "genre"
            ? i.book?.genre ?? ""
            : i.book?.title ?? ""
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

  function handleRemoved(id: string) {
    setRemovedIds((prev) => new Set(prev).add(id));
    if (openId === id) setOpenId(null);
  }

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
          {sorted.length === visible.length ? `${visible.length} books` : `${sorted.length} of ${visible.length} books`}
        </span>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-3">
          {sorted.map((item) => (
            <Fragment key={item.id}>
              <button
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className={`flex flex-col gap-1 rounded text-left ${openId === item.id ? "ring-2 ring-neutral-900 ring-offset-2 dark:ring-white dark:ring-offset-neutral-950" : ""}`}
              >
                {item.book?.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.book.cover_url}
                    alt=""
                    className="aspect-[2/3] w-full rounded object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center rounded bg-neutral-100 p-2 shadow-sm dark:bg-neutral-800">
                    <span className="line-clamp-4 text-[11px] font-medium leading-tight">
                      {item.book?.title}
                    </span>
                  </div>
                )}
                <span className="truncate text-[11px] text-neutral-500">{item.book?.title}</span>
              </button>
              {openId === item.id && (
                <div className="col-span-full">
                  <LibraryItemCard item={item} />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                {(["title", "author", "genre"] as SortKey[]).map((key) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className="cursor-pointer select-none px-3 py-2 font-medium capitalize"
                  >
                    {key} {sort === key ? (sortDir === 1 ? "↓" : "↑") : ""}
                  </th>
                ))}
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Share</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <Fragment key={item.id}>
                  <tr className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {item.book?.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.book.cover_url} alt="" className="h-8 w-6 flex-none rounded-sm object-cover" />
                        ) : (
                          <div className="h-8 w-6 flex-none rounded-sm bg-neutral-100 dark:bg-neutral-800" />
                        )}
                        <span className="font-medium">{item.book?.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-neutral-500">{(item.book?.authors ?? []).join(", ") || "—"}</td>
                    <td className="px-3 py-2 text-neutral-500">{item.book?.genre || "—"}</td>
                    <td className="px-3 py-2">
                      <CategoryTag category={categoryOf(item)} />
                    </td>
                    <td className="px-3 py-2">
                      <ShareSwitch item={item} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          onClick={() => setOpenId(openId === item.id ? null : item.id)}
                          className="text-neutral-500 hover:underline"
                        >
                          Fix
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Remove this book from your library?")) {
                              deleteItem(item.id).then(() => handleRemoved(item.id));
                            }
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                  {openId === item.id && (
                    <tr>
                      <td colSpan={6} className="bg-neutral-50 p-3 dark:bg-neutral-900">
                        <LibraryItemCard item={item} />
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
