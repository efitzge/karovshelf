import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: contact }] = await Promise.all([
    supabase.from("profiles").select("display_name, neighbourhood").eq("id", user.id).single(),
    supabase.from("profile_contacts").select("contact_note").eq("profile_id", user.id).maybeSingle(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      <ProfileForm
        displayName={profile?.display_name ?? ""}
        neighbourhood={profile?.neighbourhood ?? ""}
        contactNote={contact?.contact_note ?? null}
      />
    </div>
  );
}
