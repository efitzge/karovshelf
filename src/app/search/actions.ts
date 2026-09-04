"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function requestBook(libraryItemId: string, message: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase.from("book_requests").insert({
    library_item_id: libraryItemId,
    requester_id: user.id,
    message: message.trim() || null,
  });
  if (error) throw error;
  revalidatePath("/requests");
}

/** A grouped multi-volume set is requested (and later accepted/declined) as
 * one unit, not per volume - see PROJECT_SUMMARY.md #10. One book_requests
 * row is still written per volume (each is a real, separately-owned
 * library_item), sharing a group_key so the Requests page can display and
 * act on them together. */
export async function requestSeries(libraryItemIds: string[], message: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  if (libraryItemIds.length === 0) throw new Error("No volumes to request.");

  const groupKey = randomUUID();
  const { error } = await supabase.from("book_requests").insert(
    libraryItemIds.map((libraryItemId) => ({
      library_item_id: libraryItemId,
      requester_id: user.id,
      message: message.trim() || null,
      group_key: groupKey,
    }))
  );
  if (error) throw error;
  revalidatePath("/requests");
}
