"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(_prevState: string | null, formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const pin = String(formData.get("pin") || "").trim();

  if (!email || !pin) {
    return "Enter your email and PIN.";
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: pin,
  });

  if (error) {
    return "Email or PIN not recognized.";
  }

  redirect("/");
}
