"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";

export default function ProfileForm({
  displayName,
  neighbourhood,
  contactNote,
}: {
  displayName: string;
  neighbourhood: string;
  contactNote: string | null;
}) {
  const [message, formAction, pending] = useActionState(updateProfile, null);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Display name
        <input
          name="display_name"
          defaultValue={displayName}
          required
          className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Neighbourhood
        <input
          name="neighbourhood"
          defaultValue={neighbourhood}
          required
          className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        How to reach you once a request is accepted
        <textarea
          name="contact_note"
          defaultValue={contactNote ?? ""}
          rows={2}
          placeholder="e.g. WhatsApp 05X-XXX-XXXX"
          className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>
      {message && <p className="text-sm text-neutral-500">{message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
