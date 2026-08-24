"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UploadForm({ userId }: { userId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);

  async function handleUpload() {
    if (files.length === 0) return;
    setStatus("uploading");
    setError(null);

    const supabase = createClient();
    const newBatchId = crypto.randomUUID();

    try {
      const photoPaths: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
        const path = `${userId}/${newBatchId}/photo${String(i).padStart(2, "0")}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("shelf-photos")
          .upload(path, file, { contentType: file.type || "image/jpeg" });
        if (uploadError) throw uploadError;
        photoPaths.push(path);
      }

      const { error: insertError } = await supabase.from("scan_batches").insert({
        owner_id: userId,
        photo_paths: photoPaths,
        status: "uploaded",
      });
      if (insertError) throw insertError;

      setBatchId(newBatchId);
      setStatus("done");
      setFiles([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setStatus("error");
    }
  }

  if (status === "done" && batchId) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm dark:border-green-800 dark:bg-green-950">
        <p className="font-medium">Photos queued for scanning.</p>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Batch <code>{batchId}</code> is waiting to be processed. Check{" "}
          <a href="/library" className="underline">My Library</a> once it&apos;s done -
          new books show up there needing your review.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-3 rounded border border-neutral-300 px-3 py-1 dark:border-neutral-700"
        >
          Upload more
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        className="text-sm"
      />
      {files.length > 0 && (
        <p className="text-sm text-neutral-500">{files.length} photo(s) selected</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={files.length === 0 || status === "uploading"}
        className="w-fit rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {status === "uploading" ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
