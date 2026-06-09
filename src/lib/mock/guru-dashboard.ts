// Data placeholder untuk dashboard guru. UI-only — sebagian besar belum punya tabel.
// Mudah diganti dengan query Supabase nanti tanpa mengubah komponen.

export type GuruMetrics = {
  ceritaDiunggah: number;
  kuisDibuat: number;
  kelasAktif: number;
};

export type ClassAccent = "sky" | "blue" | "lavender";

export type ClassSummary = {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  lastActivity: string;
  activeTasks: number;
  accent: ClassAccent;
  isEmpty?: boolean;
};

export type StudentStatus = "active" | "inactive" | "at-risk";

export type StudentParticipation = {
  id: string;
  name: string;
  status: StudentStatus;
  completion: number; // 0-100
  avgScore: number;
  recentActivity: string[];
};

export type QuizResultStatus = "in-progress" | "closed";

export type QuizResult = {
  id: string;
  title: string;
  className: string;
  status: QuizResultStatus;
  submitted: number;
  total: number;
  avg: number;
  highest: number;
  lowest: number;
};

export type ContentType = "story" | "quiz";
export type ContentState = "published" | "draft" | "under-review";

export type ContentItem = {
  id: string;
  title: string;
  type: ContentType;
  state: ContentState;
  meta: string;
  tags: string[];
  published: boolean;
};

export const metrics: GuruMetrics = {
  ceritaDiunggah: 18,
  kuisDibuat: 24,
  kelasAktif: 3,
};

export const classes: ClassSummary[] = [
  {
    id: "c1",
    name: "Kelas 4A — Literasi Pagi",
    code: "4A-WAYANG",
    studentCount: 28,
    lastActivity: "Aktivitas terakhir 10 menit lalu",
    activeTasks: 3,
    accent: "sky",
  },
  {
    id: "c2",
    name: "Kelas 5B — Cerita Nusantara",
    code: "5B-NUSA",
    studentCount: 31,
    lastActivity: "Aktivitas terakhir 2 jam lalu",
    activeTasks: 1,
    accent: "blue",
  },
  {
    id: "c3",
    name: "Kelas 6C — Klub Membaca",
    code: "6C-BACA",
    studentCount: 0,
    lastActivity: "Belum ada aktivitas",
    activeTasks: 0,
    accent: "lavender",
    isEmpty: true,
  },
];

export const students: StudentParticipation[] = [
  {
    id: "s1",
    name: "Andi Pratama",
    status: "active",
    completion: 92,
    avgScore: 88,
    recentActivity: [
      "Menyelesaikan kuis “Timun Mas” (90)",
      "Membaca cerita “Malin Kundang”",
    ],
  },
  {
    id: "s2",
    name: "Bunga Lestari",
    status: "inactive",
    completion: 45,
    avgScore: 72,
    recentActivity: ["Login terakhir 6 hari lalu"],
  },
  {
    id: "s3",
    name: "Citra Dewi",
    status: "at-risk",
    completion: 20,
    avgScore: 54,
    recentActivity: [
      "Belum mengerjakan 3 tugas",
      "Nilai kuis terakhir di bawah rata-rata",
    ],
  },
];

export const quizResults: QuizResult[] = [
  {
    id: "q1",
    title: "Kuis Literasi: Timun Mas",
    className: "Kelas 4A",
    status: "in-progress",
    submitted: 18,
    total: 28,
    avg: 0,
    highest: 0,
    lowest: 0,
  },
  {
    id: "q2",
    title: "Kuis Literasi: Malin Kundang",
    className: "Kelas 5B",
    status: "closed",
    submitted: 31,
    total: 31,
    avg: 82,
    highest: 100,
    lowest: 55,
  },
];

export const contents: ContentItem[] = [
  {
    id: "k1",
    title: "Timun Mas",
    type: "story",
    state: "published",
    meta: "Jawa Tengah · 8 halaman · 12 dibaca",
    tags: ["Cerita Rakyat", "Keberanian"],
    published: true,
  },
  {
    id: "k2",
    title: "Kuis: Sangkuriang",
    type: "quiz",
    state: "draft",
    meta: "10 soal · belum dipublikasikan",
    tags: ["Asesmen", "Jawa Barat"],
    published: false,
  },
  {
    id: "k3",
    title: "Bawang Merah Bawang Putih",
    type: "story",
    state: "under-review",
    meta: "Riau · 6 halaman · menunggu peninjauan",
    tags: ["Cerita Rakyat", "Kebaikan"],
    published: false,
  },
];
