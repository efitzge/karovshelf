"use client";

import { useState, useTransition } from "react";
import { addManualBook } from "./actions";

const CATEGORIES = ["", "Fiction", "Non-fiction", "Judaica"];

export default function AddBookForm() {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [genre, setGenre] = useState("");
  const [category, setCategory] = useState("");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      await addManualBook({
        title: title.trim(),
        authors: authors.split(",").map((a) => a.trim()).filter(Boolean),
        genre: genre.trim() || null,
        category: category || null,
      });
      setTitle("");
      setAuthors("");
      setGenre("");
      setCategory("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <section>
      <h2 className="mb-2 text-sm font-medium text-neutral-500">Add a book by hand</h2>
      <p className="mb-2 text-xs text-neutral-400">
        For anything that was never scanned. Goes straight into your confirmed library, private
        until you mark it shareable.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
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
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Optional"
              className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c || "Uncategorised"}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending || !title.trim()}
            className="w-fit rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            {pending ? "Adding..." : "Add book"}
          </button>
          {saved && <span className="text-xs text-green-600 dark:text-green-500">Added.</span>}
        </div>
      </form>
    </section>
  );
}
