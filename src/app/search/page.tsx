import { createClient } from "@/lib/supabase/server";
import SearchResultsView, { type SearchResult } from "./SearchResultsView";

export default async function SearchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("library_items")
    .select(
      "id, condition, book:books!inner(title, authors, genre, category, cover_url), owner:profiles!inner(id, display_name, neighbourhood)"
    )
    .eq("shareable", true)
    .eq("confirmed", true)
    .neq("owner_id", user.id)
    .limit(200);

  if (error) {
    return <p className="text-sm text-red-600">Could not load the neighbourhood: {error.message}</p>;
  }

  const results = (data ?? []) as unknown as SearchResult[];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Search the neighbourhood</h1>
        <p className="text-sm text-neutral-500">
          Every book your neighbours have marked shareable.
        </p>
      </div>
      <SearchResultsView results={results} />
    </div>
  );
}
