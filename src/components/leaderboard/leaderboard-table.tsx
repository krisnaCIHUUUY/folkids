import { Trophy, Gamepad2, ListChecks, BookOpen, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export type LeaderboardRow = {
  student_id: string;
  name: string;
  game_points: number;
  quiz_points: number;
  reading_points: number;
  total_points: number;
  rank: number;
};

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

// Tabel papan peringkat (server-friendly, tanpa state). `currentUserId` opsional
// untuk menyorot baris milik siswa yang sedang melihat.
export function LeaderboardTable({
  rows,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  currentUserId?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="clay-inset mt-4 bg-white p-8 text-center font-semibold text-clay-ink/60">
        Belum ada peserta di kelas ini.
      </div>
    );
  }

  return (
    <ol className="mt-4 space-y-2.5">
      {rows.map((row) => {
        const isMe = row.student_id === currentUserId;
        const medal = MEDALS[row.rank];
        return (
          <li
            key={row.student_id}
            className={cn(
              "clay-sm flex items-center gap-3 p-3 transition md:gap-4 md:p-4",
              isMe ? "bg-clay-sun/30 ring-2 ring-clay-sun" : "bg-white",
            )}
          >
            {/* Peringkat / medali */}
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center font-serif text-lg font-black",
                medal ? "text-2xl" : "clay-inset bg-clay-cream text-clay-ink/70",
              )}
            >
              {medal ?? row.rank}
            </span>

            {/* Nama + rincian */}
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-clay-ink">
                {row.name}
                {isMe && (
                  <span className="ml-2 font-mono text-xs font-black uppercase tracking-wider text-clay-rose">
                    kamu
                  </span>
                )}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[0.7rem] font-bold text-clay-ink/55">
                <span className="inline-flex items-center gap-1">
                  <Gamepad2 className="size-3" /> {row.game_points}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ListChecks className="size-3" /> {row.quiz_points}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="size-3" /> {row.reading_points}
                </span>
              </div>
            </div>

            {/* Total poin */}
            <span className="clay-sm inline-flex shrink-0 items-center gap-1.5 bg-clay-mint px-3 py-1.5 font-mono text-sm font-black text-white">
              <Coins className="size-4" />
              {row.total_points}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// Header kecil yang dapat dipakai ulang di atas tabel.
export function LeaderboardHeading({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="clay-sm grid size-10 place-items-center bg-clay-sun text-clay-ink">
        <Trophy className="size-5" />
      </span>
      <div>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-clay-ink">
          Papan Peringkat
        </h2>
        {subtitle && (
          <p className="text-sm font-semibold text-clay-ink/60">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
