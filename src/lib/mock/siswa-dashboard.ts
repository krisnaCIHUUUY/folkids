// Data placeholder untuk dashboard siswa. UI-only — belum ada tabel games/badges/tugas.
// Mudah diganti dengan query Supabase nanti tanpa mengubah komponen.

export type DashboardMetrics = {
  ceritaDibaca: number;
  gameDimainkan: number;
  totalPoin: number;
};

export type TaskStatus = "unstarted" | "in-progress" | "overdue";

export type DashboardTask = {
  id: string;
  title: string;
  story: string;
  status: TaskStatus;
  dueLabel: string;
};

export type StoryVariant = "default" | "in-progress" | "assigned";

export type DashboardStory = {
  id: string;
  title: string;
  region: string;
  characterTags: string[];
  variant: StoryVariant;
  progress: number; // 0-100
  // gradient Tailwind untuk cover placeholder
  cover: string;
};

export type GameStatus = "available" | "completed" | "locked";

export type DashboardGame = {
  id: string;
  title: string;
  emoji: string;
  difficulty: 1 | 2 | 3;
  poinReward: number;
  status: GameStatus;
};

export const metrics: DashboardMetrics = {
  ceritaDibaca: 12,
  gameDimainkan: 8,
  totalPoin: 1450,
};

export const tasks: DashboardTask[] = [
  {
    id: "t1",
    title: "Baca cerita & kerjakan kuis",
    story: "Timun Mas",
    status: "unstarted",
    dueLabel: "Tenggat 3 hari lagi",
  },
  {
    id: "t2",
    title: "Lanjutkan membaca",
    story: "Malin Kundang",
    status: "in-progress",
    dueLabel: "Tenggat besok",
  },
  {
    id: "t3",
    title: "Kerjakan kuis literasi",
    story: "Sangkuriang",
    status: "overdue",
    dueLabel: "Terlambat 1 hari",
  },
];

export const stories: DashboardStory[] = [
  {
    id: "s1",
    title: "Timun Mas",
    region: "Jawa Tengah",
    characterTags: ["Timun Mas", "Buto Ijo"],
    variant: "default",
    progress: 0,
    cover: "from-clay-mint to-clay-sky",
  },
  {
    id: "s2",
    title: "Malin Kundang",
    region: "Sumatra Barat",
    characterTags: ["Malin", "Ibu"],
    variant: "in-progress",
    progress: 60,
    cover: "from-clay-peach to-clay-rose",
  },
  {
    id: "s3",
    title: "Sangkuriang",
    region: "Jawa Barat",
    characterTags: ["Sangkuriang", "Dayang Sumbi"],
    variant: "assigned",
    progress: 0,
    cover: "from-clay-lavender to-clay-grape",
  },
  {
    id: "s4",
    title: "Bawang Merah Bawang Putih",
    region: "Riau",
    characterTags: ["Bawang Putih", "Bawang Merah"],
    variant: "default",
    progress: 0,
    cover: "from-clay-sun to-clay-coral",
  },
];

export const games: DashboardGame[] = [
  {
    id: "g1",
    title: "Tebak Tokoh Wayang",
    emoji: "🎭",
    difficulty: 1,
    poinReward: 50,
    status: "available",
  },
  {
    id: "g2",
    title: "Susun Cerita",
    emoji: "🧩",
    difficulty: 2,
    poinReward: 100,
    status: "completed",
  },
  {
    id: "g3",
    title: "Cocokkan Kata",
    emoji: "🔤",
    difficulty: 2,
    poinReward: 80,
    status: "available",
  },
  {
    id: "g4",
    title: "Petualangan Batik",
    emoji: "🗺️",
    difficulty: 3,
    poinReward: 150,
    status: "locked",
  },
];

