import type { LibraryItemWithBook } from "./LibraryItemCard";

export function isHighConfidence(item: LibraryItemWithBook) {
  return item.scan_legibility === "clear" && item.book != null && !item.book.is_placeholder;
}
