import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import UploadForm from "./UploadForm";
import BatchThumbnails from "./BatchThumbnails";
import PageHero from "@/components/PageHero";

const STATUS_LABEL: Record<string, string> = {
  uploaded: "Queued - not yet scanned",
  processing: "Being scanned now",
  ready: "Scanned - ready for your review",
  needs_admin: "Needs a closer look before it's ready",
  imported: "Done - check My Library",
};

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: batches } = await supabase
    .from("scan_batches")
    .select("id, status, created_at, photo_paths")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // A manual import creates private, unconfirmed library items. Showing that
  // count alongside its upload gives the owner a clear next step without
  // revealing anything outside their own library or changing publication.
  const batchIds = (batches ?? []).map((batch) => batch.id);
  const { data: draftItems } = batchIds.length
    ? await supabase
        .from("library_items")
        .select("scan_batch_id")
        .eq("owner_id", user.id)
        .eq("confirmed", false)
        .in("scan_batch_id", batchIds)
    : { data: [] };

  const draftsByBatch = new Map<string, number>();
  for (const item of draftItems ?? []) {
    if (!item.scan_batch_id) continue;
    draftsByBatch.set(item.scan_batch_id, (draftsByBatch.get(item.scan_batch_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHero
        src="/art/upload-israel.webp"
        title="Upload shelf photos"
        description="Photograph whole shelves from a step back rather than close up - the scanner tiles each photo itself."
      />

      <UploadForm userId={user.id} />

      {batches && batches.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-neutral-500">Recent batches</h2>
          <ul className="flex flex-col gap-2">
            {batches.map((b) => (
              <li key={b.id} className="rounded border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span>{b.photo_paths.length} photo(s) - {new Date(b.created_at).toLocaleString()}</span>
                  <span className="text-neutral-500">{STATUS_LABEL[b.status] ?? b.status}</span>
                </div>
                {(draftsByBatch.get(b.id) ?? 0) > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="text-neutral-600 dark:text-neutral-300">
                      {draftsByBatch.get(b.id)} book{draftsByBatch.get(b.id) === 1 ? "" : "s"} awaiting your review
                    </span>
                    <Link href="/library" className="font-medium text-blue-600 underline dark:text-blue-400">
                      Review now
                    </Link>
                  </div>
                )}
                <BatchThumbnails photoPaths={b.photo_paths} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
