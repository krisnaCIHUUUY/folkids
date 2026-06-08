// Bank kata Bahasa Indonesia bertema cerita rakyat/wayang & alam Nusantara,
// dikelompokkan per tingkat kesulitan. Dipakai ketiga game literasi. Statis di
// kode (bukan dari konten cerita / bukan dikelola guru) agar langsung jalan.

export type Level = "mudah" | "sedang" | "sulit";

// Pasangan kata + emoji untuk game "Susun Kata" (emoji sebagai pengganti gambar).
export type WordPic = { word: string; emoji: string };

export const WORD_PICS: Record<Level, WordPic[]> = {
  mudah: [
    { word: "GAJAH", emoji: "🐘" },
    { word: "RUSA", emoji: "🦌" },
    { word: "ULAR", emoji: "🐍" },
    { word: "BUAYA", emoji: "🐊" },
    { word: "KURA", emoji: "🐢" },
    { word: "BEBEK", emoji: "🦆" },
    { word: "AYAM", emoji: "🐔" },
    { word: "IKAN", emoji: "🐟" },
  ],
  sedang: [
    { word: "HARIMAU", emoji: "🐯" },
    { word: "MERAK", emoji: "🦚" },
    { word: "GUNUNG", emoji: "⛰️" },
    { word: "PERAHU", emoji: "🛶" },
    { word: "ISTANA", emoji: "🏯" },
    { word: "MAHKOTA", emoji: "👑" },
    { word: "KERIS", emoji: "🗡️" },
    { word: "BULAN", emoji: "🌙" },
  ],
  sulit: [
    { word: "WAYANG", emoji: "🎭" },
    { word: "GAMELAN", emoji: "🥁" },
    { word: "NUSANTARA", emoji: "🗺️" },
    { word: "RAKSASA", emoji: "👹" },
    { word: "PENDEKAR", emoji: "🥋" },
    { word: "KESATRIA", emoji: "⚔️" },
  ],
};

// Daftar kata polos per tingkat (untuk Tangkap Kata & Ketik Cepat). Diturunkan
// dari WORD_PICS + tambahan kata bertema agar variatif.
export const WORDS: Record<Level, string[]> = {
  mudah: [
    ...WORD_PICS.mudah.map((w) => w.word),
    "BUDI",
    "DESA",
    "PADI",
    "BATU",
    "HUTAN",
  ],
  sedang: [
    ...WORD_PICS.sedang.map((w) => w.word),
    "CERITA",
    "LEGENDA",
    "PAHLAWAN",
    "KERAJAAN",
    "DONGENG",
  ],
  sulit: [
    ...WORD_PICS.sulit.map((w) => w.word),
    "PETUALANGAN",
    "KEBIJAKSANAAN",
    "PERSAHABATAN",
    "KEBERANIAN",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomWord(level: Level): string {
  return pick(WORDS[level]);
}

// n kata berbeda (sebisa mungkin) dari satu tingkat.
export function randomWords(n: number, level: Level): string[] {
  const pool = [...WORDS[level]];
  const out: string[] = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export function randomWordPic(level: Level): WordPic {
  return pick(WORD_PICS[level]);
}

// Acak urutan huruf sebuah kata; pastikan hasilnya berbeda dari aslinya
// (kecuali kata 1 huruf). Mengembalikan array huruf.
export function scramble(word: string): string[] {
  const letters = word.split("");
  if (letters.length < 2) return letters;
  const shuffled = [...letters];
  for (let attempt = 0; attempt < 10; attempt++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    if (shuffled.join("") !== word) break;
  }
  return shuffled;
}
