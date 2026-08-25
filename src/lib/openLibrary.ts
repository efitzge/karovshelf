/**
 * Open Library (openlibrary.org) is an Internet Archive project that
 * disclaims any new copyright over its database and explicitly invites
 * third-party apps to link to and hotlink from it - this is a pure
 * outbound link to their own page, not content we host ourselves.
 */
export function openLibraryUrl(book: {
  title: string;
  authors: string[];
  isbn13?: string | null;
  isbn10?: string | null;
}): string {
  const isbn = book.isbn13 || book.isbn10;
  if (isbn) return `https://openlibrary.org/isbn/${isbn}`;

  const query = [book.title, ...(book.authors ?? [])].filter(Boolean).join(" ");
  return `https://openlibrary.org/search?q=${encodeURIComponent(query)}`;
}
