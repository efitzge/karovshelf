"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ViewShelfPhotos({ photoPaths }: { photoPaths: string[] }) {
  const [urls, setUrls] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: signError } = await supabase.storage
        .from("shelf-photos")
        .createSignedUrls(photoPaths, 300);
      if (signError) throw signError;
      setUrls((data ?? []).map((d) => d.signedUrl).filter((u): u is string => !!u));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load photos.");
    } finally {
      setLoading(false);
    }
  }

  if (urls) {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {urls.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Shelf photo ${i + 1}`}
              className="h-20 w-20 rounded object-cover ring-1 ring-neutral-300 dark:ring-neutral-700"
            />
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-1">
      <button
        onClick={load}
        disabled={loading}
        className="text-xs text-blue-600 underline disabled:opacity-50 dark:text-blue-400"
      >
        {loading ? "Loading photo..." : "View shelf photo"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
