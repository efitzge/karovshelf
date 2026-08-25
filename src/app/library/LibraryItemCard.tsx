"use client";

import { useState, useTransition } from "react";
import { confirmItem, setShareable, deleteItem, correctBook } from "./actions";
import ViewShelfPhotos from "./ViewShelfPhotos";
import { isHighConfidence } from "./confidence";
import { GENRES } from "./genres";
import { openLibraryUrl } from "@/lib/openLibrary";

export type LibraryItemWithBook = {
  id: string;
  shareable: boolean;
  confirmed: boolean;
  scan_spine_text: string | null;
  scan_legibility: string | null;
  condition: string | null;
  book: {
    id: string;
    title: string;
    authors: string[];
    genre: string | null;
    category: string | null;
    cover_url: string | null;
    is_placeholder: boolean;
    isbn13: string | null;
    isbn10: string | null;
  } | null;
  scan_batch: { photo_paths: string[] } | null;
  source_photo_path: string | null;
};

const LEGIBILITY_LABEL: Record<string, string> = {
  clear: "read clearly",
  partial: "partially legible",
  guess: "best guess - please check",
};

export default function LibraryItemCard({ item }: { item: LibraryItemWithBook }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.book?.title ?? "");
  const [authors, setAuthors] = useState((item.book?.authors ?? []).join(", "));
  const [genre, setGenre] = useState(
    item.book?.genre && item.book.genre !== "Uncategorised" ? item.book.genre : ""
  );
  const [pending, startTransition] = useTransition();
  const [gone, setGone] = useState(false);

  if (gone) return null;

  const legibility = item.scan_legibility;
  const needsAttention = legibility === "guess" || !item.book;
  const photoPaths = item.source_photo_path
    ? [item.source_photo_path]
    : item.scan_batch?.photo_paths ?? [];
  const showPhotoLink = !isHighConfidence(item) && photoPaths.length > 0;

  return (
    <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      {!editing ? (
        <div className="flex items-start gap-3">
          {item.book?.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.book.cover_url} alt="" className="h-16 w-11 rounded object-cover" />
          ) : (
            <div className="h-16 w-11 flex-none rounded bg-neutral-100 dark:bg-neutral-800" />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{item.book?.title || "(untitled)"}</div>
            <div className="truncate text-sm text-neutral-500">
              {(item.book?.authors ?? []).join(", ") || "Unknown author"}
              {item.book?.genre ? ` · ${item.book.genre}` : ""}
              {item.book?.category ? ` · ${item.book.category}` : ""}
            </div>
            {item.scan_spine_text && (
              <div className="mt-1 truncate text-xs text-neutral-400">
                Spine: &ldquo;{item.scan_spine_text}&rdquo;
              </div>
            )}
            {needsAttention && (
              <div className="mt-1 text-xs text-amber-600 dark:text-amber-500">
                {legibility ? LEGIBILITY_LABEL[legibility] ?? legibility : "no catalogue match"}
              </div>
            )}
            {showPhotoLink && <ViewShelfPhotos photoPaths={photoPaths} />}
            {item.book && (
              <a
                href={openLibraryUrl(item.book)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-blue-600 underline dark:text-blue-400"
              >
                About this book
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-xs">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Author(s), comma separated
            <input
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Genre
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="">Uncategorised</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {!item.confirmed && !editing && (
          <button
            disabled={pending}
            onClick={() => startTransition(() => confirmItem(item.id))}
            className="rounded bg-neutral-900 px-2 py-1 text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            Confirm
          </button>
        )}

        {editing ? (
          <>
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await correctBook(item.id, {
                    title,
                    authors: authors.split(",").map((a) => a.trim()).filter(Boolean),
                    genre: genre.trim() || null,
                    category: item.book?.category ?? null,
                  });
                  setEditing(false);
                })
              }
              className="rounded bg-neutral-900 px-2 py-1 text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
            >
              Save correction
            </button>
            <button onClick={() => setEditing(false)} className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700">
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setEditing(true)} className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700">
            Fix title/author
          </button>
        )}

        <label className="ml-auto flex items-center gap-1">
          <input
            type="checkbox"
            checked={item.shareable}
            disabled={pending}
            onChange={(e) => startTransition(() => setShareable(item.id, e.target.checked))}
          />
          Shareable
        </label>

        <button
          disabled={pending}
          onClick={() => {
            if (confirm("Remove this book from your library?")) {
              startTransition(async () => {
                await deleteItem(item.id);
                setGone(true);
              });
            }
          }}
          className="text-red-600 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
