"use client";

import { useTransition } from "react";
import { respondToRequest, cancelRequest } from "./actions";
import type { RequestRowData } from "./RequestRow";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
};

/** One card for a "whole set" request (see groupRequests.ts) - N real
 * book_requests rows, one per volume, accepted/declined/cancelled together
 * rather than one at a time. Not a single atomic DB transaction (each
 * update is its own call, looped) - acceptable here given how few real
 * requests this app has seen; worth revisiting if that changes. */
export default function RequestGroupRow({
  rows,
  direction,
}: {
  rows: RequestRowData[];
  direction: "incoming" | "outgoing";
}) {
  const [pending, startTransition] = useTransition();
  const first = rows[0];
  const status = first.status;

  function respondAll(newStatus: "accepted" | "declined") {
    startTransition(async () => {
      await Promise.all(rows.map((r) => respondToRequest(r.id, newStatus)));
    });
  }

  function cancelAll() {
    startTransition(async () => {
      await Promise.all(rows.map((r) => cancelRequest(r.id)));
    });
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <span className="font-medium">Whole set ({rows.length} volumes)</span>
        <span className="text-xs text-neutral-500">{STATUS_LABEL[status] ?? status}</span>
      </div>
      <ul className="mt-1 flex flex-col gap-0.5 text-neutral-500">
        {rows.map((r) => (
          <li key={r.id}>{r.bookTitle}</li>
        ))}
      </ul>
      <div className="mt-1 text-neutral-500">
        {direction === "incoming" ? "Requested by " : "Requested from "}
        {first.otherPartyName}
      </div>
      {first.message && <div className="mt-1 text-neutral-400">&ldquo;{first.message}&rdquo;</div>}
      {status === "accepted" && first.otherPartyContact && (
        <div className="mt-1 text-xs text-green-600 dark:text-green-500">Contact: {first.otherPartyContact}</div>
      )}

      {direction === "incoming" && status === "pending" && (
        <div className="mt-2 flex gap-2">
          <button
            disabled={pending}
            onClick={() => respondAll("accepted")}
            className="rounded bg-neutral-900 px-3 py-1 text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            Accept all {rows.length}
          </button>
          <button
            disabled={pending}
            onClick={() => respondAll("declined")}
            className="rounded border border-neutral-300 px-3 py-1 dark:border-neutral-700"
          >
            Decline all
          </button>
        </div>
      )}

      {direction === "outgoing" && status === "pending" && (
        <div className="mt-2">
          <button
            disabled={pending}
            onClick={cancelAll}
            className="rounded border border-neutral-300 px-3 py-1 dark:border-neutral-700"
          >
            Cancel request
          </button>
        </div>
      )}
    </div>
  );
}
