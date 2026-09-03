"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(_prevState: string | null, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Not signed in.";

  const displayName = String(formData.get("display_name") || "").trim();
  const neighbourhood = String(formData.get("neighbourhood") || "").trim();
  const contactNote = String(formData.get("contact_note") || "").trim();

  if (!displayName || !neighbourhood) {
    return "Name and neighbourhood are required.";
  }

  const { error } = await supabase.rpc("update_profile_and_contact", {
    p_display_name: displayName,
    p_neighbourhood: neighbourhood,
    p_contact_note: contactNote,
  });

  if (error) return error.message;

  revalidatePath("/profile");
  revalidatePath("/");
  return "Saved.";
}
