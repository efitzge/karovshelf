import { createClient } from "@/lib/supabase/server";
import RequestButton from "./RequestButton";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase
    .from("library_items")
    .select(
      "id, condition, book:books!inner(title, authors, genre, cover_url), owner:profiles!inner(id, display_name, neighbourhood)"
    )
    .eq("shareable", true)
    .eq("confirmed", true)
    .neq("owner_id", user.id)
    .limit(50);

  if (q) {
    query = query.ilike("book.title", `%${q}%`);
  }

  const { data, error } = await query;

  type Result = {
    id: string;
    condition: string | null;
    book: { title: string; authors: string[]; genre: string | null; cover_url: string | null } | null;
    owner: { id: string; display_name: string; neighbourhood: string } | null;
  };
  const results = (data ?? []) as unknown as Result[];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Search the neighbourhood</h1>
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Book title..."
          className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button type="submit" className="rounded bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-neutral-900">
          Search
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      {q && results.length === 0 && (
        <p className="text-sm text-neutral-400">No shareable matches for &ldquo;{q}&rdquo;.</p>
      )}

      <div className="flex flex-col gap-2">
        {results.map((r) => (
          <div key={r.id} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="flex items-start gap-3">
              {r.book?.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.book.cover_url} alt="" className="h-16 w-11 rounded object-cover" />
              ) : (
                <div className="h-16 w-11 flex-none rounded bg-neutral-100 dark:bg-neutral-800" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium">{r.book?.title}</div>
                <div className="text-sm text-neutral-500">
                  {(r.book?.authors ?? []).join(", ")}
                  {r.book?.genre ? ` · ${r.book.genre}` : ""}
                </div>
                <div className="mt-1 text-xs text-neutral-400">
                  {r.owner?.display_name} · {r.owner?.neighbourhood}
                  {r.condition ? ` · condition: ${r.condition}` : ""}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <RequestButton libraryItemId={r.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
