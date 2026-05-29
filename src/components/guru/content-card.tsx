"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen, HelpCircle, MoreVertical } from "lucide-react";
import type { ContentItem, ContentState } from "@/lib/mock/guru-dashboard";

const STATE_BADGE: Record<ContentState, { label: string; className: string }> = {
  published: { label: "Terbit", className: "bg-clay-mint/30 text-clay-ink" },
  draft: { label: "Draf", className: "bg-clay-ink/10 text-clay-ink/60" },
  "under-review": { label: "Ditinjau", className: "bg-clay-sun/30 text-clay-ink" },
};

const MENU_ITEMS = ["Edit", "Duplikat", "Hapus"];

export function ContentCard({ data }: { data: ContentItem }) {
  const [published, setPublished] = useState(data.published);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const badge = STATE_BADGE[data.state];
  const Icon = data.type === "story" ? BookOpen : HelpCircle;

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  return (
    <article className="clay-sm flex flex-col gap-3 bg-white p-5 transition hover:[transform:translateY(-4px)]">
      <div className="flex items-start gap-3">
        <span
          className={`clay-sm grid size-11 shrink-0 place-items-center text-white ${
            data.type === "story" ? "bg-clay-sun" : "bg-clay-lavender"
          }`}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg font-bold leading-snug text-clay-ink">
            {data.title}
          </h3>
          <span
            className={`clay-sm mt-1 inline-block px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="Aksi konten"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="clay-sm grid size-9 place-items-center bg-white text-clay-ink/60 transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            <MoreVertical className="size-4" />
          </button>
          {menuOpen && (
            <div className="clay absolute right-0 top-11 z-50 w-36 overflow-hidden bg-white p-1.5">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition hover:bg-clay-cream ${
                    item === "Hapus" ? "text-clay-coral" : "text-clay-ink"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="font-mono text-xs font-semibold text-clay-ink/60">{data.meta}</p>

      <div className="flex flex-wrap gap-1.5">
        {data.tags.map((tag) => (
          <span
            key={tag}
            className="clay-sm bg-clay-cream px-2.5 py-1 text-xs font-bold text-clay-ink/70"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-clay-ink/10 pt-3">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
          {published ? "Dipublikasikan" : "Tidak Terbit"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={published}
          aria-label="Alihkan publikasi"
          onClick={() => setPublished((v) => !v)}
          className={`clay-inset relative h-7 w-12 shrink-0 rounded-full transition-colors ${
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
    </article>
  );
}
