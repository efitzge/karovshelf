import BookCover from "./BookCover";

/** The collapsed grid tile for a detected multi-volume set (e.g. "A Daily
 * Dose of Torah, Vol. 1-13" shown as one card instead of 13) - see
 * PROJECT_SUMMARY.md #10 and src/lib/seriesGrouping.ts. Cover comes from
 * the lowest-numbered volume in the group. */
export default function SeriesGroupTile({
  seriesTitle,
  volumeLabel,
  count,
  coverBook,
  open,
  onClick,
}: {
  seriesTitle: string;
  volumeLabel: string;
  count: number;
  coverBook: { title: string; cover_url: string | null; category?: string | null } | null;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-1 rounded text-left ${open ? "ring-2 ring-neutral-900 ring-offset-2 dark:ring-white dark:ring-offset-neutral-950" : ""}`}
    >
      <div className="relative">
        <BookCover book={coverBook} variant="tile" className="aspect-[2/3] w-full" />
        <span className="absolute bottom-1 right-1 rounded-full bg-neutral-900/85 px-1.5 py-0.5 text-[10px] font-medium text-white dark:bg-white/85 dark:text-neutral-900">
          {count} vols
        </span>
      </div>
      <span className="truncate text-[11px] text-neutral-500">
        {volumeLabel ? `${seriesTitle} · ${volumeLabel}` : seriesTitle}
      </span>
    </button>
  );
}
