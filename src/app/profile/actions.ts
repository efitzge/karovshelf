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

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, neighbourhood })
    .eq("id", user.id);

  if (error) return error.message;

  const { error: contactError } = await supabase
    .from("profile_contacts")
    .upsert({ profile_id: user.id, contact_note: contactNote || null });

  if (contactError) return contactError.message;

  revalidatePath("/profile");
  revalidatePath("/");
  return "Saved.";
}
