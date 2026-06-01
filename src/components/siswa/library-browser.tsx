"use client";

import { useMemo, useState } from "react";
import { Filter, MapPin, X } from "lucide-react";
import { LibraryCard, type LibraryStory } from "@/components/siswa/library-card";

type Difficulty = "mudah" | "sedang" | "sulit";

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "mudah", label: "Mudah" },
  { value: "sedang", label: "Sedang" },
  { value: "sulit", label: "Sulit" },
];

function chipClass(active: boolean) {
  return [
    "clay-sm inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold transition",
    "hover:[transform:translateY(-2px)] active:[transform:translateY(1px)]",
    active
      ? "bg-clay-rose text-white"
      : "bg-white text-clay-ink/70 hover:text-clay-ink",
  ].join(" ");
}

export function LibraryBrowser({ stories }: { stories: LibraryStory[] }) {
  const [region, setRegion] = useState<string | null>(null);
  const [level, setLevel] = useState<Difficulty | null>(null);

  // Opsi daerah diturunkan dari katalog (teks bebas, buang null), urut abjad.
  const regions = useMemo(
    () =>
      [...new Set(stories.map((s) => s.region).filter((r): r is string => !!r))].sort(
        (a, b) => a.localeCompare(b, "id"),
      ),
    [stories],
  );

  const filtered = useMemo(
    () =>
      stories.filter(
        (s) =>
          (!region || s.region === region) &&
          (!level || s.difficulty === level),
      ),
    [stories, region, level],
  );

  const hasFilter = region !== null || level !== null;

  return (
    <div>
      <div className="clay mt-6 bg-white/70 p-4">
        <div className="flex items-center gap-2 text-clay-ink/70">
          <Filter className="size-4" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            Saring cerita
          </span>
        </div>

        {/* Tingkat kesulitan */}
        <div className="mt-3">
          <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/45">
            Tingkat
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLevel(null)}
              className={chipClass(level === null)}
            >
              Semua
            </button>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setLevel((cur) => (cur === opt.value ? null : opt.value))
                }
                className={chipClass(level === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Daerah asal (hanya bila ada datanya) */}
        {regions.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/45">
              Daerah
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRegion(null)}
                className={chipClass(region === null)}
              >
                Semua
              </button>
              {regions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion((cur) => (cur === r ? null : r))}
                  className={chipClass(region === r)}
                >
                  <MapPin className="size-3.5" />
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="clay mt-6 flex flex-col items-center gap-3 bg-white p-10 text-center">
          <span className="clay-sm grid size-14 place-items-center bg-clay-sun text-clay-ink">
            <Filter className="size-7" />
          </span>
          <p className="font-serif text-lg font-bold text-clay-ink">
            Tidak ada cerita untuk filter ini
          </p>
          <p className="max-w-sm font-semibold text-clay-ink/60">
            Coba ganti pilihan tingkat atau daerah.
          </p>
          <button
            type="button"
            onClick={() => {
              setRegion(null);
              setLevel(null);
            }}
            className="clay-sm mt-1 inline-flex items-center gap-1.5 bg-clay-rose px-4 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            <X className="size-4" />
            Hapus filter
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((story) => (
            <LibraryCard key={story.id} story={story} />
          ))}
        </div>
      )}

      {hasFilter && filtered.length > 0 && (
        <p className="mt-4 font-mono text-xs font-bold text-clay-ink/45">
          Menampilkan {filtered.length} dari {stories.length} cerita
        </p>
      )}
    </div>
  );
}
