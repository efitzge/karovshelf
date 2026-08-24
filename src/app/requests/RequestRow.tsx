"use client";

import { useTransition } from "react";
import { respondToRequest, cancelRequest } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
};

export type RequestRowData = {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  bookTitle: string;
  otherPartyName: string;
  otherPartyContact?: string | null;
};

export default function RequestRow({
  request,
  direction,
}: {
  request: RequestRowData;
  direction: "incoming" | "outgoing";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <span className="font-medium">{request.bookTitle}</span>
        <span className="text-xs text-neutral-500">{STATUS_LABEL[request.status] ?? request.status}</span>
      </div>
      <div className="text-neutral-500">
        {direction === "incoming" ? "Requested by " : "Requested from "}
        {request.otherPartyName}
      </div>
      {request.message && <div className="mt-1 text-neutral-400">&ldquo;{request.message}&rdquo;</div>}
      {request.status === "accepted" && request.otherPartyContact && (
        <div className="mt-1 text-xs text-green-600 dark:text-green-500">
          Contact: {request.otherPartyContact}
        </div>
      )}

      {direction === "incoming" && request.status === "pending" && (
        <div className="mt-2 flex gap-2">
          <button
            disabled={pending}
            onClick={() => startTransition(() => respondToRequest(request.id, "accepted"))}
            className="rounded bg-neutral-900 px-3 py-1 text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            Accept
          </button>
          <button
            disabled={pending}
            onClick={() => startTransition(() => respondToRequest(request.id, "declined"))}
            className="rounded border border-neutral-300 px-3 py-1 dark:border-neutral-700"
          >
            Decline
          </button>
        </div>
      )}

      {direction === "outgoing" && request.status === "pending" && (
        <div className="mt-2">
          <button
            disabled={pending}
            onClick={() => startTransition(() => cancelRequest(request.id))}
            className="rounded border border-neutral-300 px-3 py-1 dark:border-neutral-700"
          >
            Cancel request
          </button>
        </div>
      )}
    </div>
  );
}
