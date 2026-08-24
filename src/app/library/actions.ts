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
  fields: { title: string; authors: string[]; genre: string | null }
) {
  const supabase = await createClient();

  const { data: newBook, error: insertError } = await supabase
    .from("books")
    .insert({
      title: fields.title,
      authors: fields.authors,
      genre: fields.genre,
      lookup_key: "placeholder:" + crypto.randomUUID(),
      is_placeholder: true,
    })
    .select("id")
    .single();
  if (insertError) throw insertError;

  const { error: updateError } = await supabase
    .from("library_items")
    .update({ book_id: newBook.id, confirmed: true })
    .eq("id", itemId);
  if (updateError) throw updateError;

  revalidatePath("/library");
}
