"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { StudentParticipation, StudentStatus } from "@/lib/mock/guru-dashboard";

const STATUS_DOT: Record<StudentStatus, string> = {
  active: "bg-clay-mint",
  inactive: "bg-clay-sun",
  "at-risk": "bg-clay-coral",
};

const STATUS_BADGE: Record<StudentStatus, { label: string; className: string } | null> = {
  active: null,
  inactive: { label: "Tidak Aktif", className: "bg-clay-sun/30 text-clay-ink" },
  "at-risk": { label: "Perlu Perhatian", className: "bg-clay-coral/20 text-clay-coral" },
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

export function StudentCard({ data }: { data: StudentParticipation }) {
  const [open, setOpen] = useState(false);
  const badge = STATUS_BADGE[data.status];

  return (
    <article className="clay-sm flex flex-col gap-4 bg-white p-5 transition hover:[transform:translateY(-4px)]">
      <div className="flex items-center gap-3">
        <span className="clay-sm relative grid size-12 shrink-0 place-items-center bg-clay-mint text-base font-black text-clay-ink">
          {initials(data.name)}
          <span
            className={`absolute -right-0.5 -top-0.5 size-3.5 rounded-full border-2 border-white ${STATUS_DOT[data.status]}`}
          />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg font-bold leading-tight text-clay-ink">
            {data.name}
          </h3>
          {badge ? (
            <span
              className={`clay-sm mt-1 inline-block px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider ${badge.className}`}
            >
              {badge.label}
            </span>
          ) : (
            <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-wider text-clay-mint">
              Aktif
            </span>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between font-mono text-xs font-bold text-clay-ink/65">
          <span>Penyelesaian Tugas</span>
          <span>{data.completion}%</span>
        </div>
        <div className="clay-inset mt-1.5 h-3 overflow-hidden bg-clay-cream">
          <div
            className="h-full rounded-full bg-clay-mint transition-all"
            style={{ width: `${data.completion}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
          Rata-rata Nilai
        </span>
        <span className="text-xl font-black text-clay-ink">{data.avgScore}</span>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="clay-sm mt-auto inline-flex items-center justify-center gap-1.5 bg-white py-2 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
      >
        Aktivitas Terbaru
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="clay-inset flex flex-col gap-2 bg-clay-cream p-3">
          {data.recentActivity.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs font-semibold text-clay-ink/70"
            >
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-clay-ink/30" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
