import { createClient } from "@/lib/supabase/server";
import LibraryItemCard, { type LibraryItemWithBook } from "./LibraryItemCard";
import { isHighConfidence } from "./confidence";
import { ConfirmAllButton, ShareAllButton } from "./BulkActions";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("library_items")
    .select(
      "id, shareable, confirmed, scan_spine_text, scan_legibility, condition, book:books(id, title, authors, genre, cover_url, is_placeholder), scan_batch:scan_batches(photo_paths)"
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-sm text-red-600">Could not load your library: {error.message}</p>;
  }

  const items = (data ?? []) as unknown as LibraryItemWithBook[];
  const unconfirmed = items.filter((i) => !i.confirmed);
  const closerLook = unconfirmed.filter((i) => !isHighConfidence(i));
  const readyToConfirm = unconfirmed.filter((i) => isHighConfidence(i));
  const confirmed = items.filter((i) => i.confirmed);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">My Library</h1>
        <p className="text-sm text-neutral-500">
          Nothing here is visible to anyone else until you confirm it and mark it shareable.
        </p>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">
          Needs a closer look ({closerLook.length})
        </h2>
        <p className="mb-2 text-xs text-neutral-400">
          Low-confidence readings - no catalogue match, or the scan wasn&apos;t sure. Check
          against the shelf photo if you&apos;re not sure.
        </p>
        {closerLook.length === 0 ? (
          <p className="text-sm text-neutral-400">Nothing here right now.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {closerLook.map((item) => (
              <LibraryItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-500">
            Ready to confirm ({readyToConfirm.length})
          </h2>
          {readyToConfirm.length > 0 && (
            <ConfirmAllButton itemIds={readyToConfirm.map((i) => i.id)} />
          )}
        </div>
        <p className="mb-2 text-xs text-neutral-400">
          Clearly read and matched a catalogue record - almost certainly right, but still
          yours to confirm one by one or all at once.
        </p>
        {readyToConfirm.length === 0 ? (
          <p className="text-sm text-neutral-400">Nothing here right now.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {readyToConfirm.map((item) => (
              <LibraryItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-500">Confirmed ({confirmed.length})</h2>
          {confirmed.length > 0 && <ShareAllButton />}
        </div>
        {confirmed.length === 0 ? (
          <p className="text-sm text-neutral-400">No confirmed books yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {confirmed.map((item) => (
              <LibraryItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
