import { createClient } from "@/lib/supabase/server";
import RequestRow, { type RequestRowData } from "./RequestRow";
import PageHero from "@/components/PageHero";

type IncomingRow = {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  requester: { display_name: string; contact_note: string | null } | null;
  library_item: { owner_id: string; book: { title: string } | null } | null;
};

type OutgoingRow = {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  library_item: {
    book: { title: string } | null;
    owner: { display_name: string; contact_note: string | null } | null;
  } | null;
};

export default async function RequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: incomingData, error: incomingError }, { data: outgoingData, error: outgoingError }] =
    await Promise.all([
      supabase
        .from("book_requests")
        .select(
          "id, status, message, created_at, requester:profiles!inner(display_name, contact_note), library_item:library_items!inner(owner_id, book:books(title))"
        )
        .eq("library_item.owner_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("book_requests")
        .select(
          "id, status, message, created_at, library_item:library_items!inner(book:books(title), owner:profiles!inner(display_name, contact_note))"
        )
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  const incoming = ((incomingData ?? []) as unknown as IncomingRow[]).map(
    (r): RequestRowData => ({
      id: r.id,
      status: r.status,
      message: r.message,
      created_at: r.created_at,
      bookTitle: r.library_item?.book?.title ?? "(unknown book)",
      otherPartyName: r.requester?.display_name ?? "(unknown)",
      otherPartyContact: r.requester?.contact_note,
    })
  );

  const outgoing = ((outgoingData ?? []) as unknown as OutgoingRow[]).map(
    (r): RequestRowData => ({
      id: r.id,
      status: r.status,
      message: r.message,
      created_at: r.created_at,
      bookTitle: r.library_item?.book?.title ?? "(unknown book)",
      otherPartyName: r.library_item?.owner?.display_name ?? "(unknown)",
      otherPartyContact: r.library_item?.owner?.contact_note,
    })
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHero src="/art/requests-israel.webp" title="Requests" />

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">For your books</h2>
        {incomingError && <p className="text-sm text-red-600">{incomingError.message}</p>}
        {incoming.length === 0 ? (
          <p className="text-sm text-neutral-400">No one has requested your books yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {incoming.map((r) => (
              <RequestRow key={r.id} request={r} direction="incoming" />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">You&apos;ve sent</h2>
        {outgoingError && <p className="text-sm text-red-600">{outgoingError.message}</p>}
        {outgoing.length === 0 ? (
          <p className="text-sm text-neutral-400">You haven&apos;t requested anything yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {outgoing.map((r) => (
              <RequestRow key={r.id} request={r} direction="outgoing" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
