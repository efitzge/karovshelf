/**
 * Same fixed vocabulary the scan pipeline classifies into
 * (pipeline/enrich.py's SPECIFIC_GENRES/TOPICAL_GENRES + the two derived
 * fiction buckets) - keeping manually-picked genres on the same list keeps
 * `categorize()`'s Fiction/Non-fiction bucketing working for hand-entered
 * and corrected books too, not just scanned ones.
 */
export const GENRES = [
  "Science Fiction",
  "Fantasy",
  "Mystery & Crime",
  "Horror",
  "Romance",
  "Graphic Novels",
  "Drama",
  "Historical Fiction",
  "Literary Fiction",
  "Children's",
  "Young Adult",
  "Poetry",
  "Biography & Memoir",
  "Cookery",
  "Travel",
  "History",
  "Science & Nature",
  "Philosophy & Religion",
  "Politics & Society",
  "Business & Self-Help",
  "Art & Music",
];
