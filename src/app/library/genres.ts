/**
 * Same fixed vocabulary the scan pipeline classifies into
 * (pipeline/enrich.py's SPECIFIC_GENRES/TOPICAL_GENRES + the fiction-marker
 * fallback) - keeping manually-picked genres on the same list keeps
 * `categorize()`'s Fiction/Non-fiction bucketing working for hand-entered
 * and corrected books too, not just scanned ones.
 *
 * Condensed to 10 (from an earlier 21-value version, 2026-08-24) - six
 * fiction, four non-fiction.
 */
export const GENRES = [
  "Sci-Fi & Fantasy",
  "Mystery, Thriller & Horror",
  "Romance",
  "Literary & Historical Fiction",
  "Children's & Young Adult",
  "Poetry, Drama & Graphic Novels",
  "Biography & History",
  "Science & Nature",
  "Philosophy & Religion",
  "Society, Business & Lifestyle",
];
