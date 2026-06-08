"use client";

import { useRouter } from "next/navigation";

export type PickerClass = { id: number; name: string };

// Pemilih kelas (muncul bila siswa tergabung di >1 kelas). Navigasi via ?kelas=.
export function ClassPicker({
  classes,
  selectedId,
}: {
  classes: PickerClass[];
  selectedId: number;
}) {
  const router = useRouter();
  return (
    <select
      aria-label="Pilih kelas"
      value={selectedId}
      onChange={(e) => router.push(`/papan-peringkat?kelas=${e.target.value}`)}
      className="clay-sm mt-4 bg-white px-4 py-2.5 font-bold text-clay-ink outline-none focus:ring-2 focus:ring-clay-rose/50"
    >
      {classes.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
