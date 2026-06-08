import Link from "next/link";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  LeaderboardTable,
  type LeaderboardRow,
} from "@/components/leaderboard/leaderboard-table";
import { ClassPicker, type PickerClass } from "./class-picker";

export default async function PapanPeringkatPage({
  searchParams,
}: {
  searchParams: Promise<{ kelas?: string }>;
}) {
  const { kelas } = await searchParams;
  const user = await getCurrentUser();
  const supabase = await createClient();

  // Kelas yang diikuti siswa (RLS membatasi ke keanggotaan sendiri).
  const { data: rows } = await supabase
    .from("class_students")
    .select("classes(id, name)")
    .eq("student_id", user!.id);

  const myClasses: PickerClass[] = (rows ?? [])
    .map((r) => {
      const c = (Array.isArray(r.classes) ? r.classes[0] : r.classes) as
        | { id: number; name: string }
        | null;
      return c ? { id: c.id, name: c.name } : null;
    })
    .filter((c): c is PickerClass => c !== null);

  const heading = (
    <div className="flex items-center gap-3">
      <span className="clay-sm grid size-10 place-items-center bg-clay-sun text-clay-ink">
        <Trophy className="size-5" />
      </span>
      <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        Papan Peringkat
      </h1>
    </div>
  );

  if (myClasses.length === 0) {
    return (
      <div className="pt-6">
        {heading}
        <div className="clay mt-6 bg-white p-8 text-center">
          <p className="font-semibold text-clay-ink/70">
            Kamu belum bergabung ke kelas mana pun.
          </p>
          <Link
            href="/gabung-kelas"
            className="clay-sm mt-4 inline-flex bg-clay-rose px-5 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)]"
          >
            Gabung Kelas
          </Link>
        </div>
      </div>
    );
  }

  // Kelas terpilih: dari ?kelas= bila valid, jika tidak kelas pertama.
  const requested = Number(kelas);
  const selected =
    myClasses.find((c) => c.id === requested) ?? myClasses[0];

  const { data: lbRows } = await supabase.rpc("class_leaderboard", {
    p_class_id: selected.id,
  });
  const leaderboard = (lbRows ?? []) as LeaderboardRow[];

  return (
    <div className="pt-6">
      {heading}
      <p className="mt-2 font-semibold text-clay-ink/60">
        Peringkat Poin Literasi di kelas <strong>{selected.name}</strong> — dari
        game, kuis, dan cerita yang kamu selesaikan.
      </p>

      {myClasses.length > 1 && (
        <ClassPicker classes={myClasses} selectedId={selected.id} />
      )}

      <LeaderboardTable rows={leaderboard} currentUserId={user!.id} />
    </div>
  );
}
