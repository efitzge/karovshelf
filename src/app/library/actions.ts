"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function confirmItem(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("library_items")
    .update({ confirmed: true })
    .eq("id", itemId);
  if (error) throw error;
  revalidatePath("/library");
}

export async function confirmMany(itemIds: string[]) {
  if (itemIds.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("library_items")
    .update({ confirmed: true })
    .in("id", itemIds);
  if (error) throw error;
  revalidatePath("/library");
}

/** Marks every confirmed book shareable in one shot. Un-sharing a specific
 * book afterward is just the per-item Shareable checkbox - no separate
 * "remove from sharing" action needed. */
export async function shareAllConfirmed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase
    .from("library_items")
    .update({ shareable: true })
    .eq("owner_id", user.id)
    .eq("confirmed", true);
  if (error) throw error;
  revalidatePath("/library");
}

export async function setShareable(itemId: string, shareable: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("library_items")
    .update({ shareable })
    .eq("id", itemId);
  if (error) throw error;
  revalidatePath("/library");
}

export async function deleteItem(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("library_items").delete().eq("id", itemId);
  if (error) throw error;
  revalidatePath("/library");
}

/**
 * There is deliberately no UPDATE policy on `books` - it's a shared cache, and
 * a matched row is used by every owner whose scan happened to agree with it.
 * Correcting a wrong reading always creates a fresh private books row
 * (is_placeholder=true) and re-points this one library_item at it, rather
 * than ever mutating a row other people's libraries might also reference.
 */
export async function correctBook(
  itemId: string,
  fields: { title: string; authors: string[]; genre: string | null; category: string | null }
) {
  await bulkCorrectBooks([{ itemId, ...fields }]);
}

/**
 * Same placeholder-row pattern as correctBook, applied to many library_items
 * at once - e.g. selecting a shelf's worth of misclassified books and
 * setting their genre or category in one action instead of one by one. Each
 * item gets its own new books row (never a shared-cache UPDATE), keyed back
 * up by a client-generated lookup_key since a multi-row INSERT's RETURNING
 * order isn't something to rely on.
 *
 * The library_item this repoints was, before this edit, either pointed at a
 * shared catalogue match (never touched - other owners' libraries may still
 * reference it) or at this owner's own private placeholder. A placeholder
 * maps 1:1 to exactly one library_item and is never looked up by anyone else
 * (see pipeline/worker.py's insert_placeholder_book docstring), so once we've
 * repointed away from it nothing can still reference it - it's now pure
 * orphaned junk. Deleted at the end of this same action, same cleanup
 * `supersede_owner_placeholder()` already does on the Python pipeline side.
 * Found 2026-09-09: every "fix details"/bulk-correct edit was leaving its old
 * placeholder behind uncleaned, so a book corrected repeatedly (or bulk-set
 * by mistake) accumulated one dead row per edit - e.g. one real title ended
 * up with 8 duplicate placeholder rows carrying stale, inconsistent
 * genre/category values from past edits.
 */
export async function bulkCorrectBooks(
  edits: {
    itemId: string;
    title: string;
    authors: string[];
    genre: string | null;
    category: string | null;
  }[]
) {
  if (edits.length === 0) return;
  const supabase = await createClient();

  const { data: current, error: currentError } = await supabase
    .from("library_items")
    .select("id, book_id, books(is_placeholder)")
    .in(
      "id",
      edits.map((e) => e.itemId)
    );
  if (currentError) throw currentError;
  const oldPlaceholderIdByItemId = new Map(
    (current ?? [])
      .filter((i) => i.book_id && i.books?.is_placeholder)
      .map((i) => [i.id, i.book_id as string])
  );

  const keyed = edits.map((e) => ({ ...e, key: "placeholder:" + crypto.randomUUID() }));

  const { data: newBooks, error: insertError } = await supabase
    .from("books")
    .insert(
      keyed.map((e) => ({
        title: e.title,
        authors: e.authors,
        genre: e.genre,
        category: e.category,
        lookup_key: e.key,
        is_placeholder: true,
      }))
    )
    .select("id, lookup_key");
  if (insertError) throw insertError;

  const idByKey = new Map((newBooks ?? []).map((b) => [b.lookup_key, b.id]));

  // Never throw inside this map - a rejected Promise.all short-circuits
  // before any result is inspected, which used to skip the orphan cleanup
  // below entirely for items that had already succeeded (found 2026-09-11:
  // one failed item in a 5-item bulk edit meant items 1-3's old placeholders
  // never got deleted, reopening the exact leak this cleanup exists to
  // close). Every item now always produces a result; only cleanup for the
  // items that actually succeeded, then re-throw the first failure after.
  const results = await Promise.all(
    keyed.map(async (e) => {
      const bookId = idByKey.get(e.key);
      if (!bookId) {
        return { itemId: e.itemId, error: new Error(`Bulk insert did not return a book for item ${e.itemId}`) };
      }
      const { error } = await supabase
        .from("library_items")
        .update({ book_id: bookId, confirmed: true })
        .eq("id", e.itemId);
      return { itemId: e.itemId, error };
    })
  );

  const orphanedIds = results
    .filter((r) => !r.error)
    .map((r) => oldPlaceholderIdByItemId.get(r.itemId))
    .filter((id): id is string => Boolean(id));
  if (orphanedIds.length > 0) {
    const { error: deleteError } = await supabase.from("books").delete().in("id", orphanedIds);
    // Best-effort: each of these edits already succeeded and is visible, so
    // a cleanup failure here (e.g. a stale RLS edge case) shouldn't surface
    // as an error to someone who just corrected a book's title.
    if (deleteError) console.error("bulkCorrectBooks: failed to clean up old placeholder(s)", deleteError);
  }

  revalidatePath("/library");

  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

/**
 * A book the owner types in by hand - never scanned, so there's no spine
 * reading to attach. Goes straight in as its own private placeholder book
 * (same reasoning as correctBook: never touches the shared cache) and an
 * already-confirmed library_item, since typing it in yourself already is
 * the confirmation.
 */
export async function addManualBook(fields: {
  title: string;
  authors: string[];
  genre: string | null;
  category: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: newBook, error: insertBookError } = await supabase
    .from("books")
    .insert({
      title: fields.title,
      authors: fields.authors,
      genre: fields.genre,
      category: fields.category,
      lookup_key: "placeholder:" + crypto.randomUUID(),
      is_placeholder: true,
    })
    .select("id")
    .single();
  if (insertBookError) throw insertBookError;

  const { error: insertItemError } = await supabase.from("library_items").insert({
    owner_id: user.id,
    book_id: newBook.id,
    confirmed: true,
    shareable: false,
  });
  if (insertItemError) throw insertItemError;

  revalidatePath("/library");
}
