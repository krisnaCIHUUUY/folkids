import type { Database } from "@/types/database";

export type GameKey = Database["public"]["Enums"]["game_type"];

export type GameConfig = {
  key: GameKey;
  slug: string;
  title: string;
  emoji: string;
  difficulty: 1 | 2 | 3;
  // Batas atas poin per satu kali main (dipakai server untuk clamp).
  maxPoints: number;
  description: string;
};

// Satu sumber kebenaran metadata game — dipakai kartu hub, logika klien, dan
// server action (clamp poin). Slug dipakai sebagai segmen rute /game/<slug>.
export const GAMES: GameConfig[] = [
  {
    key: "tangkap_kata",
    slug: "tangkap-kata",
    title: "Tangkap Kata",
    emoji: "🧺",
    difficulty: 2,
    maxPoints: 120,
    description: "Gerakkan keranjang menangkap huruf yang tepat hingga membentuk kata.",
  },
  {
    key: "susun_kata",
    slug: "susun-kata",
    title: "Susun Kata Acak",
    emoji: "🔤",
    difficulty: 1,
    maxPoints: 100,
    description: "Susun huruf teracak menjadi kata yang sesuai gambar.",
  },
  {
    key: "ketik_cepat",
    slug: "ketik-cepat",
    title: "Ketik Cepat Berpacu",
    emoji: "🏎️",
    difficulty: 3,
    maxPoints: 150,
    description: "Ketik kata dengan cepat & benar untuk membuat karaktermu melaju.",
  },
];

export const GAME_BY_KEY: Record<GameKey, GameConfig> = Object.fromEntries(
  GAMES.map((g) => [g.key, g]),
) as Record<GameKey, GameConfig>;

export const GAME_BY_SLUG: Record<string, GameConfig> = Object.fromEntries(
  GAMES.map((g) => [g.slug, g]),
);
