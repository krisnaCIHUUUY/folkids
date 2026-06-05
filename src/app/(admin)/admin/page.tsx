import { LayoutDashboard } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { WayangAccent } from "@/components/wayang-accent";
import { AdminStats, type AdminStatsData } from "@/components/admin/admin-stats";
import {
  ActivityFeed,
  type ActivityItem,
  type ActivityKind,
} from "@/components/admin/activity-feed";

const ROLE_LABEL: Record<string, string> = {
  siswa: "Siswa",
  guru: "Guru",
  admin: "Admin",
};

const ZERO_STATS: AdminStatsData = {
  totalUsers: 0,
  siswa: 0,
  guru: 0,
  admin: 0,
  aktif: 0,
  nonaktif: 0,
  cerita: 0,
  ceritaPublished: 0,
  ceritaDraft: 0,
  kuis: 0,
  kelas: 0,
  attempts: 0,
  attemptsLulus: 0,
  rataSkor: 0,
  readingTotal: 0,
  readingSelesai: 0,
};

// Waktu relatif ringkas dalam Bahasa Indonesia.
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (Number.isNaN(then) || diff < 0) return "baru saja";
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari === 1) return "kemarin";
  if (hari < 7) return `${hari} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type RawEvent = { kind: ActivityKind; text: string; at: number; iso: string };

// Embed PostgREST relasi many-to-one bisa berupa objek atau array; ambil fieldnya.
function rel(value: unknown, key: "name" | "title"): string | undefined {
  if (!value) return undefined;
  const obj = Array.isArray(value) ? value[0] : value;
  return (obj as Record<string, string> | undefined)?.[key];
}

const FEED_LIMIT = 15;

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const name = user?.name ?? "Admin";

  const supabase = await createClient();

  // Statistik diagregasi di DB (satu round-trip, menghormati RLS).
  // Feed dibatasi 15 baris terbaru per sumber, lalu digabung di aplikasi.
  const [statsRes, usersFeedRes, ceritaFeedRes, attemptsFeedRes, readingFeedRes] =
    await Promise.all([
      supabase.rpc("admin_dashboard_stats"),
      supabase
        .from("users")
        .select("name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(FEED_LIMIT),
      supabase
        .from("stories")
        .select("title, created_at")
        .order("created_at", { ascending: false })
        .limit(FEED_LIMIT),
      supabase
        .from("quiz_attempts")
        .select("total_score, max_score, completed_at, users(name), quizzes(title)")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(FEED_LIMIT),
      supabase
        .from("reading_progress")
        .select("completed_at, users(name), stories(title)")
        .eq("is_completed", true)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(FEED_LIMIT),
    ]);

  const stats = (statsRes.data as AdminStatsData | null) ?? ZERO_STATS;

  // --- Feed aktivitas (gabungan sumber terbaru, terurut) ---
  const events: RawEvent[] = [];

  for (const u of usersFeedRes.data ?? []) {
    if (u.created_at) {
      events.push({
        kind: "user",
        text: `Pengguna baru: ${u.name} (${ROLE_LABEL[u.role] ?? u.role})`,
        at: new Date(u.created_at).getTime(),
        iso: u.created_at,
      });
    }
  }
  for (const c of ceritaFeedRes.data ?? []) {
    if (c.created_at) {
      events.push({
        kind: "cerita",
        text: `Cerita diunggah: ${c.title}`,
        at: new Date(c.created_at).getTime(),
        iso: c.created_at,
      });
    }
  }
  for (const a of attemptsFeedRes.data ?? []) {
    if (!a.completed_at) continue;
    const siswa = rel(a.users, "name") ?? "Siswa";
    const judul = rel(a.quizzes, "title") ?? "kuis";
    const pct = a.max_score > 0 ? Math.round((a.total_score / a.max_score) * 100) : 0;
    events.push({
      kind: "kuis",
      text: `${siswa} menyelesaikan "${judul}" — ${pct}%`,
      at: new Date(a.completed_at).getTime(),
      iso: a.completed_at,
    });
  }
  for (const r of readingFeedRes.data ?? []) {
    if (!r.completed_at) continue;
    const siswa = rel(r.users, "name") ?? "Siswa";
    const judul = rel(r.stories, "title") ?? "cerita";
    events.push({
      kind: "baca",
      text: `${siswa} menuntaskan "${judul}"`,
      at: new Date(r.completed_at).getTime(),
      iso: r.completed_at,
    });
  }

  const activities: ActivityItem[] = events
    .sort((a, b) => b.at - a.at)
    .slice(0, FEED_LIMIT)
    .map((e) => ({ kind: e.kind, text: e.text, time: timeAgo(e.iso) }));

  return (
    <div className="pt-2">
      <section className="clay relative overflow-hidden bg-white p-6 md:p-8">
        <WayangAccent className="absolute -right-6 -top-8 h-40 text-clay-rose/10" />
        <div className="relative flex items-center gap-3">
          <span className="clay-sm grid size-12 place-items-center bg-clay-sun text-clay-ink">
            <LayoutDashboard className="size-6" />
          </span>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
              Dasbor Admin
            </p>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-clay-ink md:text-4xl">
              Halo, {name}! 👋
            </h1>
          </div>
        </div>
        <p className="relative mt-3 max-w-lg font-semibold text-clay-ink/70">
          Ringkasan statistik platform dan aktivitas sistem terkini.
        </p>
      </section>

      <AdminStats data={stats} />
      <ActivityFeed items={activities} />
    </div>
  );
}
