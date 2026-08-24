import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // middleware redirects to /login before this renders
  }

  const [{ count: needsReview }, { count: pendingForMe }, { count: mySent }] =
    await Promise.all([
      supabase
        .from("library_items")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .eq("confirmed", false),
      supabase
        .from("book_requests")
        .select("id, library_items!inner(owner_id)", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("library_items.owner_id", user.id),
      supabase
        .from("book_requests")
        .select("id", { count: "exact", head: true })
        .eq("requester_id", user.id)
        .eq("status", "pending"),
    ]);

  const cards = [
    {
      href: "/upload",
      title: "Upload shelf photos",
      body: "Add photos of your bookshelves to be catalogued.",
      art: "/art/home-upload.webp",
    },
    {
      href: "/library",
      title: "My Library",
      body:
        (needsReview ?? 0) > 0
          ? `${needsReview} book(s) waiting for your review`
          : "Review and manage your scanned books",
      art: "/art/home-library.webp",
    },
    {
      href: "/search",
      title: "Search the neighbourhood",
      body: "Find a book a neighbour is willing to lend",
      art: "/art/home-search.webp",
    },
    {
      href: "/requests",
      title: "Requests",
      body: `${pendingForMe ?? 0} pending for your books, ${mySent ?? 0} you're waiting on`,
      art: "/art/home-requests.webp",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Welcome back</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-art-surface">
              <Image src={c.art} alt="" width={1254} height={1254} className="h-12 w-12 object-contain" />
            </div>
            <div>
              <div className="font-medium">{c.title}</div>
              <div className="text-sm text-neutral-500">{c.body}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
