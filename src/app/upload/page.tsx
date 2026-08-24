import { createClient } from "@/lib/supabase/server";
import UploadForm from "./UploadForm";
import BatchThumbnails from "./BatchThumbnails";

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Upload shelf photos</h1>
        <p className="text-sm text-neutral-500">
          Photograph whole shelves from a step back rather than close up - the
          scanner tiles each photo itself.
        </p>
      </div>

      <UploadForm userId={user.id} />

      {batches && batches.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-neutral-500">Recent batches</h2>
          <ul className="flex flex-col gap-2">
            {batches.map((b) => (
              <li
                key={b.id}
                className="rounded border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
              >
                <div className="flex items-center justify-between">
                  <span>{b.photo_paths.length} photo(s) - {new Date(b.created_at).toLocaleString()}</span>
                  <span className="text-neutral-500">{STATUS_LABEL[b.status] ?? b.status}</span>
                </div>
                <BatchThumbnails photoPaths={b.photo_paths} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
