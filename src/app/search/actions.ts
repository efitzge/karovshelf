"use server";

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
