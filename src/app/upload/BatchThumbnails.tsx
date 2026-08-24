"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BatchThumbnails({ photoPaths }: { photoPaths: string[] }) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.storage
        .from("shelf-photos")
        .createSignedUrls(photoPaths, 300);
      if (cancelled) return;
      setUrls((data ?? []).map((d) => d.signedUrl).filter((u): u is string => !!u));
    })();
    return () => {
      cancelled = true;
    };
    // photoPaths is a fresh array each render from the server payload, so key
    // off its content rather than identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoPaths.join(",")]);

  if (urls.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {urls.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Photo ${i + 1}`}
            className="h-12 w-12 rounded object-cover ring-1 ring-neutral-300 dark:ring-neutral-700"
          />
        </a>
      ))}
    </div>
  );
}
