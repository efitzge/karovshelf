"use client";

import { useTransition } from "react";
import { confirmMany, shareAllConfirmed } from "./actions";

export function ConfirmAllButton({ itemIds }: { itemIds: string[] }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending || itemIds.length === 0}
      onClick={() => startTransition(() => confirmMany(itemIds))}
      className="rounded bg-neutral-900 px-3 py-1 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
    >
      {pending ? "Confirming..." : `Confirm all ${itemIds.length}`}
    </button>
  );
}

export function ShareAllButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => shareAllConfirmed())}
      className="rounded border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-neutral-700"
    >
      {pending ? "Sharing..." : "Share everything"}
    </button>
  );
}
