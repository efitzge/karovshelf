import { createClient } from "@/lib/supabase/server";
import RequestRow, { type RequestRowData } from "./RequestRow";
import RequestGroupRow from "./RequestGroupRow";
import PageHero from "@/components/PageHero";
import { groupRequestRows } from "./groupRequests";

type IncomingRow = {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  group_key: string | null;
  requester: {
    display_name: string;
    contact: { contact_note: string | null } | null;
  } | null;
  library_item: { owner_id: string; book: { title: string } | null } | null;
};

type OutgoingRow = {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  group_key: string | null;
  library_item: {
    book: { title: string } | null;
    owner: {
      display_name: string;
      contact: { contact_note: string | null } | null;
    } | null;
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
          "id, status, message, created_at, group_key, requester:profiles!inner(display_name, contact:profile_contacts(contact_note)), library_item:library_items!inner(owner_id, book:books(title))"
        )
        .eq("library_item.owner_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("book_requests")
        .select(
          "id, status, message, created_at, group_key, library_item:library_items!inner(book:books(title), owner:profiles!inner(display_name, contact:profile_contacts(contact_note)))"
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
      otherPartyContact: r.requester?.contact?.contact_note,
      groupKey: r.group_key,
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
      otherPartyContact: r.library_item?.owner?.contact?.contact_note,
      groupKey: r.group_key,
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
            {groupRequestRows(incoming).map((entry) =>
              entry.type === "single" ? (
                <RequestRow key={entry.row.id} request={entry.row} direction="incoming" />
              ) : (
                <RequestGroupRow key={entry.groupKey} rows={entry.rows} direction="incoming" />
              )
            )}
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
            {groupRequestRows(outgoing).map((entry) =>
              entry.type === "single" ? (
                <RequestRow key={entry.row.id} request={entry.row} direction="outgoing" />
              ) : (
                <RequestGroupRow key={entry.groupKey} rows={entry.rows} direction="outgoing" />
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
