"use client";

import { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export function PdfViewer({ url, title }: { url: string; title: string }) {
  const [expanded, setExpanded] = useState(false);

  const isRelative = url.startsWith("/");
  const viewerUrl = isRelative
    ? url
    : `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div
      className={`clay bg-white transition-all ${
        expanded ? "fixed inset-4 z-50" : "relative"
      }`}
    >
      <div className="flex items-center justify-between border-b border-clay-ink/10 px-4 py-3">
        <p className="truncate font-serif text-sm font-bold text-clay-ink">
          Modul: {title}
        </p>
        <button
          type="button"
          aria-label={expanded ? "Kecilkan" : "Perbesar"}
          onClick={() => setExpanded(!expanded)}
          className="clay-sm grid size-8 place-items-center bg-white text-clay-ink transition active:[transform:translateY(2px)]"
        >
          {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>
      </div>
      <iframe
        src={viewerUrl}
        title={`Modul PDF: ${title}`}
        className="w-full border-0 bg-gray-100"
        style={{ height: expanded ? "calc(100% - 52px)" : "600px" }}
      />
    </div>
  );
}
