import { createClient } from "@/lib/supabase/server";
import LibraryItemCard, { type LibraryItemWithBook } from "./LibraryItemCard";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("library_items")
    .select(
      "id, shareable, confirmed, scan_spine_text, scan_legibility, condition, book:books(id, title, authors, genre, cover_url)"
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-sm text-red-600">Could not load your library: {error.message}</p>;
  }

  const items = (data ?? []) as unknown as LibraryItemWithBook[];
  const needsReview = items.filter((i) => !i.confirmed);
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
          Needs review ({needsReview.length})
        </h2>
        {needsReview.length === 0 ? (
          <p className="text-sm text-neutral-400">Nothing waiting on you right now.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {needsReview.map((item) => (
              <LibraryItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">
          Confirmed ({confirmed.length})
        </h2>
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
