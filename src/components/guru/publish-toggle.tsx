"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { togglePublish } from "@/lib/actions/stories";

export function PublishToggle({
  storyId,
  initial,
}: {
  storyId: number;
  initial: boolean;
}) {
  const [published, setPublished] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !published;
    setPublished(next); // optimistic
    startTransition(async () => {
      const result = await togglePublish(storyId, next);
      if ("error" in result) {
        setPublished(!next); // rollback
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
        {published ? "Terbit" : "Draf"}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={published}
        aria-label="Alihkan publikasi"
        disabled={pending}
        onClick={toggle}
        className={`clay-inset relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          published ? "bg-clay-mint" : "bg-clay-ink/15"
        }`}
      >
        <span
          className={`clay-sm absolute top-1 size-5 rounded-full bg-white transition-all ${
            published ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
