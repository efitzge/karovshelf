// A book with no cover_url (most private placeholders - anything that never
// matched a real catalogue entry, which is common for niche Judaica editions)
// used to render as a flat empty grey box everywhere. This is the shared
// fallback: a category-tinted tile with a book glyph, so an uncovered book
// still reads as *a book* rather than a blank hole in the grid - never a
// fetched-but-wrong cover, which is exactly the class of bug this project
// spent 2026-09-03 finding and fixing across the catalogue-matching path.
type CoverBook = {
  title?: string | null;
  category?: string | null;
  cover_url?: string | null;
} | null | undefined;

// Same three colors CategoryTag (search/SearchResultsView.tsx) already uses,
// so a Judaica book with no cover still reads as Judaica at a glance.
const CATEGORY_TINTS: Record<string, string> = {
  Fiction: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Non-fiction": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  Judaica: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
};

// Uncategorised books have no meaningful color to draw on, but rendering
// every single one of them identically (dozens, in a real library) reads as
// broken/repetitive rather than "no cover". A stable hash of the title picks
// a consistent-per-book, pleasant tint instead - not meaningful data, just
// visual variety, the same idea as a GitHub identicon.
const VARIETY_TINTS = [
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
  "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-400",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
];

function tintFor(title: string, category: string | null | undefined) {
  if (category && CATEGORY_TINTS[category]) return CATEGORY_TINTS[category];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
  return VARIETY_TINTS[Math.abs(hash) % VARIETY_TINTS.length];
}

function BookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 4.5C5 3.67 5.67 3 6.5 3H17a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 18.5v-14Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M5 18.5c0-.83.67-1.5 1.5-1.5H18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8.5 7h6M8.5 10h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/**
 * Renders a real cover image when one exists, otherwise a designed fallback
 * tile instead of an empty box. `variant="icon"` is for small thumbnails
 * (table rows, list-card thumbnails) - just the glyph, no text, since a
 * title won't be legible at that size. `variant="tile"` is for grid cards
 * with room to spare - glyph plus the truncated title.
 */
export default function BookCover({
  book,
  variant,
  className,
}: {
  book: CoverBook;
  variant: "icon" | "tile";
  className: string;
}) {
  if (book?.cover_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={book.cover_url} alt="" className={`${className} object-cover`} />;
  }

  const title = book?.title || "";
  const tint = tintFor(title, book?.category);

  if (variant === "icon") {
    return (
      <div className={`flex flex-none items-center justify-center rounded ${tint} ${className}`}>
        <BookGlyph className="h-[55%] w-[55%]" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-1.5 rounded p-2 text-center shadow-sm ${tint} ${className}`}>
      <BookGlyph className="h-6 w-6 shrink-0 opacity-70" />
      <span className="line-clamp-4 text-[11px] font-medium leading-tight">{title}</span>
    </div>
  );
}
