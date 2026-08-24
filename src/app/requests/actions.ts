"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function respondToRequest(requestId: string, status: "accepted" | "declined") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("book_requests")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) throw error;
  revalidatePath("/requests");
}

export async function cancelRequest(requestId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("book_requests")
    .update({ status: "cancelled", responded_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) throw error;
  revalidatePath("/requests");
}
