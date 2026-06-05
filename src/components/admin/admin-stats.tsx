import { DonutCard } from "@/components/admin/donut-chart";

export type AdminStatsData = {
  // Pengguna
  totalUsers: number;
  siswa: number;
  guru: number;
  admin: number;
  aktif: number;
  nonaktif: number;
  // Konten
  cerita: number;
  ceritaPublished: number;
  ceritaDraft: number;
  kuis: number;
  kelas: number;
  // Keterlibatan
  attempts: number;
  attemptsLulus: number;
  rataSkor: number; // persen 0-100
  readingTotal: number;
  readingSelesai: number;
};

// Warna palet claymorphism (CSS var dari @theme).
const C = {
  sky: "var(--color-clay-sky)",
  blue: "var(--color-clay-blue)",
  coral: "var(--color-clay-coral)",
  mint: "var(--color-clay-mint)",
  sun: "var(--color-clay-sun)",
  lavender: "var(--color-clay-lavender)",
};

export function AdminStats({ data }: { data: AdminStatsData }) {
  const readingBelum = Math.max(0, data.readingTotal - data.readingSelesai);
  const attemptsBelum = Math.max(0, data.attempts - data.attemptsLulus);

  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl font-bold tracking-tight text-clay-ink md:text-2xl">
        Statistik Platform
      </h2>
      <p className="mt-1 font-semibold text-clay-ink/60">
        Ringkasan data sistem dalam diagram donat.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DonutCard
          title="Pengguna menurut Peran"
          centerValue={data.totalUsers.toLocaleString("id-ID")}
          centerLabel="Total"
          segments={[
            { label: "Siswa", value: data.siswa, color: C.sky },
            { label: "Guru", value: data.guru, color: C.blue },
            { label: "Admin", value: data.admin, color: C.coral },
          ]}
        />

        <DonutCard
          title="Status Akun"
          centerValue={data.totalUsers.toLocaleString("id-ID")}
          centerLabel="Total"
          segments={[
            { label: "Aktif", value: data.aktif, color: C.mint },
            { label: "Nonaktif", value: data.nonaktif, color: C.sun },
          ]}
        />

        <DonutCard
          title="Konten Platform"
          centerValue={(data.cerita + data.kuis + data.kelas).toLocaleString("id-ID")}
          centerLabel="Item"
          segments={[
            { label: "Cerita", value: data.cerita, color: C.coral },
            { label: "Kuis", value: data.kuis, color: C.mint },
            { label: "Kelas", value: data.kelas, color: C.sky },
          ]}
        />

        <DonutCard
          title="Status Cerita"
          centerValue={data.cerita.toLocaleString("id-ID")}
          centerLabel="Cerita"
          segments={[
            { label: "Terbit", value: data.ceritaPublished, color: C.mint },
            { label: "Draf", value: data.ceritaDraft, color: C.sun },
          ]}
        />

        <DonutCard
          title="Hasil Kuis"
          centerValue={data.attempts.toLocaleString("id-ID")}
          centerLabel="Dikerjakan"
          segments={[
            { label: "Lulus (≥60%)", value: data.attemptsLulus, color: C.mint },
            { label: "Belum lulus", value: attemptsBelum, color: C.coral },
          ]}
        />

        <DonutCard
          title="Progres Baca"
          centerValue={data.readingTotal.toLocaleString("id-ID")}
          centerLabel="Sesi Baca"
          segments={[
            { label: "Selesai", value: data.readingSelesai, color: C.blue },
            { label: "Belum selesai", value: readingBelum, color: C.lavender },
          ]}
        />

        <DonutCard
          title="Rata-rata Skor Kuis"
          centerValue={`${data.rataSkor}%`}
          total={100}
          segments={[
            { label: "Skor tercapai", value: data.rataSkor, color: C.sun },
            { label: "Sisa", value: Math.max(0, 100 - data.rataSkor), color: C.lavender },
          ]}
        />
      </div>
    </section>
  );
}
