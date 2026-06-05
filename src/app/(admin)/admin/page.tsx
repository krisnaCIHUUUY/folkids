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

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const name = user?.name ?? "Admin";

  const supabase = await createClient();
  const [usersRes, ceritaRes, kuisRes, kelasRes, attemptsRes, readingRes] =
    await Promise.all([
      supabase.from("users").select("id, name, role, is_active, created_at"),
      supabase.from("stories").select("id, title, is_published, created_at"),
      supabase.from("quizzes").select("id, title, created_at"),
      supabase.from("classes").select("id"),
      supabase
        .from("quiz_attempts")
        .select("student_id, quiz_id, total_score, max_score, completed_at"),
      supabase
        .from("reading_progress")
        .select("student_id, story_id, is_completed, completed_at"),
    ]);

  const users = usersRes.data ?? [];
  const cerita = ceritaRes.data ?? [];
  const kuis = kuisRes.data ?? [];
  const kelas = kelasRes.data ?? [];
  const attempts = attemptsRes.data ?? [];
  const readings = readingRes.data ?? [];

  // --- Agregat statistik ---
  const skorVals = attempts
    .filter((a) => a.max_score > 0)
    .map((a) => (a.total_score / a.max_score) * 100);
  const rataSkor = skorVals.length
    ? Math.round(skorVals.reduce((s, v) => s + v, 0) / skorVals.length)
    : 0;

  const attemptsLulus = attempts.filter(
    (a) => a.max_score > 0 && a.total_score / a.max_score >= 0.6,
  ).length;

  const stats: AdminStatsData = {
    totalUsers: users.length,
    siswa: users.filter((u) => u.role === "siswa").length,
    guru: users.filter((u) => u.role === "guru").length,
    admin: users.filter((u) => u.role === "admin").length,
    aktif: users.filter((u) => u.is_active).length,
    nonaktif: users.filter((u) => !u.is_active).length,
    cerita: cerita.length,
    ceritaPublished: cerita.filter((c) => c.is_published).length,
    ceritaDraft: cerita.filter((c) => !c.is_published).length,
    kuis: kuis.length,
    kelas: kelas.length,
    attempts: attempts.length,
    attemptsLulus,
    rataSkor,
    readingTotal: readings.length,
    readingSelesai: readings.filter((r) => r.is_completed).length,
  };

  // --- Feed aktivitas (diturunkan dari timestamp) ---
  const userName = new Map(users.map((u) => [u.id, u.name]));
  const storyTitle = new Map(cerita.map((c) => [c.id, c.title]));
  const quizTitle = new Map(kuis.map((q) => [q.id, q.title]));

  const events: RawEvent[] = [];

  for (const u of users) {
    if (u.created_at) {
      events.push({
        kind: "user",
        text: `Pengguna baru: ${u.name} (${ROLE_LABEL[u.role] ?? u.role})`,
        at: new Date(u.created_at).getTime(),
        iso: u.created_at,
      });
    }
  }
  for (const c of cerita) {
    if (c.created_at) {
      events.push({
        kind: "cerita",
        text: `Cerita diunggah: ${c.title}`,
        at: new Date(c.created_at).getTime(),
        iso: c.created_at,
      });
    }
  }
  for (const a of attempts) {
    if (a.completed_at) {
      const siswa = userName.get(a.student_id) ?? "Siswa";
      const judul = quizTitle.get(a.quiz_id) ?? "kuis";
      const pct = a.max_score > 0 ? Math.round((a.total_score / a.max_score) * 100) : 0;
      events.push({
        kind: "kuis",
        text: `${siswa} menyelesaikan "${judul}" — ${pct}%`,
        at: new Date(a.completed_at).getTime(),
        iso: a.completed_at,
      });
    }
  }
  for (const r of readings) {
    if (r.is_completed && r.completed_at) {
      const siswa = userName.get(r.student_id) ?? "Siswa";
      const judul = storyTitle.get(r.story_id) ?? "cerita";
      events.push({
        kind: "baca",
        text: `${siswa} menuntaskan "${judul}"`,
        at: new Date(r.completed_at).getTime(),
        iso: r.completed_at,
      });
    }
  }

  const activities: ActivityItem[] = events
    .sort((a, b) => b.at - a.at)
    .slice(0, 15)
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
