"use client";

import { useState, useTransition } from "react";
import { requestBook } from "./actions";

export default function RequestButton({ libraryItemId }: { libraryItemId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  if (sent) {
    return <span className="text-sm text-green-600 dark:text-green-500">Request sent</span>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-neutral-900 px-3 py-1 text-sm text-white dark:bg-white dark:text-neutral-900"
      >
        Request to borrow
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional message"
        className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      <div className="flex gap-2">
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await requestBook(libraryItemId, message);
              setSent(true);
            })
          }
          className="rounded bg-neutral-900 px-3 py-1 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          Send request
        </button>
        <button onClick={() => setOpen(false)} className="rounded border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700">
          Cancel
        </button>
      </div>
    </div>
  );
}
