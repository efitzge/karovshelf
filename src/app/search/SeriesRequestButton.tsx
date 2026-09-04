"use client";

import { useState, useTransition } from "react";
import { requestSeries } from "./actions";

/** Requests every volume in a grouped set at once - "whole set only"
 * borrowing (Elliot's call: simpler UI, matches how these sets actually
 * get lent in practice - see PROJECT_SUMMARY.md #10). */
export default function SeriesRequestButton({ libraryItemIds }: { libraryItemIds: string[] }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  if (sent) {
    return <span className="text-sm text-green-600 dark:text-green-500">Request sent for all {libraryItemIds.length} volumes</span>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-neutral-900 px-3 py-1 text-sm text-white dark:bg-white dark:text-neutral-900"
      >
        Request the whole set ({libraryItemIds.length} volumes)
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
              await requestSeries(libraryItemIds, message);
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
