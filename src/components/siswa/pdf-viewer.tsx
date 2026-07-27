"use client";

import { useState } from "react";
import { FileText, X, Maximize2, Minimize2 } from "lucide-react";

export function PdfViewer({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="clay-sm inline-flex items-center gap-2 bg-clay-coral px-5 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <FileText className="size-4" /> Lihat Modul PDF
        </button>
      ) : (
        <div
          className={`clay bg-white transition-all ${
            expanded ? "fixed inset-4 z-50" : "relative"
          }`}
        >
          <div className="flex items-center justify-between border-b border-clay-ink/10 px-4 py-3">
            <p className="truncate font-serif text-sm font-bold text-clay-ink">
              Modul: {title}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={expanded ? "Kecilkan" : "Perbesar"}
                onClick={() => setExpanded(!expanded)}
                className="clay-sm grid size-8 place-items-center bg-white text-clay-ink transition active:[transform:translateY(2px)]"
              >
                {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>
              <button
                type="button"
                aria-label="Tutup PDF"
                onClick={() => { setOpen(false); setExpanded(false); }}
                className="clay-sm grid size-8 place-items-center bg-white text-clay-coral transition active:[transform:translateY(2px)]"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <iframe
            src={url}
            title={`Modul PDF: ${title}`}
            className="w-full border-0 bg-gray-100"
            style={{ height: expanded ? "calc(100% - 52px)" : "600px" }}
          />
        </div>
      )}
    </div>
  );
}
