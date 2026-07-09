import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Sparkles,
  Trophy,
  Headphones,
  Palette,
  Star,
  Heart,
  Rocket,
  Play,
  CheckCircle2,
  Flame,
  GraduationCap,
  Map,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-clay-cream font-sans text-clay-ink">
      <BackdropBlobs />
      <SiteNav />
      <Hero />
      <FeatureStrip />
      <CatalogPreview />
      <ProgressDemo />
      <Testimonials />
      <FooterNote />
    </main>
  );
}

/* ---------- Decorative background ---------- */

function BackdropBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-24 -left-20 size-[28rem] rounded-full bg-clay-pink/50 blur-3xl" />
      <div className="absolute top-40 -right-24 size-[26rem] rounded-full bg-clay-sky/60 blur-3xl" />
      <div className="absolute top-[60rem] -left-10 size-[22rem] rounded-full bg-clay-mint/50 blur-3xl" />
      <div className="absolute top-[90rem] right-0 size-[24rem] rounded-full bg-clay-lavender/55 blur-3xl" />
      <BatikDots />
    </div>
  );
}

function BatikDots() {
  return (
    <svg
      className="absolute inset-x-0 top-[42rem] mx-auto h-40 w-full opacity-30"
      viewBox="0 0 1200 200"
      fill="none"
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2.4" fill="#1e4285" />
          <circle cx="20" cy="20" r="1.4" fill="#2b5cb8" />
        </pattern>
      </defs>
      <rect width="1200" height="200" fill="url(#dots)" />
    </svg>
  );
}

/* ---------- Nav ---------- */

function SiteNav() {
  return (
    <header className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:py-8">
      <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="clay-sm grid size-10 place-items-center bg-clay-sun text-xl sm:size-12 sm:text-2xl">
          🎭
        </span>
        <span className="hidden text-2xl font-black tracking-tight sm:inline">
          Wayang<span className="text-clay-rose">Folkids</span>
        </span>
      </Link>

      <nav className="hidden items-center gap-8 text-sm font-bold md:flex">
        <a href="#cerita" className="hover:text-clay-rose">Perpustakaan</a>
        <a href="#progres" className="hover:text-clay-rose">Progres</a>
        <a href="#cerita-mereka" className="hover:text-clay-rose">Cerita Mereka</a>
        <Link href="/register" className="hover:text-clay-rose">Untuk Guru</Link>
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/login"
          className="clay-sm inline-flex bg-white px-3 py-2 text-sm font-bold hover:[transform:translateY(-2px)] sm:px-5 sm:py-2.5"
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className="clay-sm inline-flex items-center gap-2 bg-clay-rose px-3 py-2 text-sm font-bold text-white hover:[transform:translateY(-2px)] sm:px-5 sm:py-2.5"
        >
          Daftar
          <Sparkles className="size-4" />
        </Link>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 md:grid-cols-2 md:pb-28 md:pt-16">
      <div>
        <span className="clay-sm inline-flex items-center gap-2 bg-clay-mint px-4 py-2 text-xs font-black uppercase tracking-wider">
          <Flame className="size-4" /> Petualangan Literasi Anak SD
        </span>
        <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
          Belajar Cerita{" "}
          <span className="relative inline-block">
            <span className="relative z-10">Rakyat</span>
            <span className="absolute inset-x-0 bottom-2 -z-0 h-4 rounded-full bg-clay-sun/80" />
          </span>{" "}
          & Wayang Jadi{" "}
          <span className="text-clay-rose">Seru!</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-clay-ink/75">
          Perpustakaan digital interaktif penuh ilustrasi, narasi audio,
          animasi wayang, dan kuis seru. Anak baca sambil bermain, guru pantau
          progres tanpa repot.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/register"
            className="clay inline-flex items-center gap-3 bg-clay-rose px-7 py-4 text-base font-black text-white hover:[transform:translateY(-3px)]"
          >
            <Rocket className="size-5" /> Mulai Petualangan
          </Link>
          <a
            href="#cerita"
            className="clay inline-flex items-center gap-3 bg-white px-7 py-4 text-base font-black hover:[transform:translateY(-3px)]"
          >
            <Play className="size-5 fill-clay-ink" /> Lihat Demo
          </a>
        </div>

        <div className="mt-10 flex items-center gap-6 text-sm font-semibold text-clay-ink/70">
          <div className="flex -space-x-2">
            <Avatar emoji="👧" bg="bg-clay-pink" />
            <Avatar emoji="🧒" bg="bg-clay-sun" />
            <Avatar emoji="👦" bg="bg-clay-mint" />
            <Avatar emoji="🧑‍🏫" bg="bg-clay-sky" />
          </div>
          <span>
            <strong className="text-clay-ink">12.480+</strong> anak sudah membaca
            <br />
            di 38 sekolah dasar
          </span>
        </div>
      </div>

      <HeroCard />
    </section>
  );
}

function Avatar({ emoji, bg }: { emoji: string; bg: string }) {
  return (
    <span className={`clay-sm grid size-11 place-items-center text-lg ${bg}`}>
      {emoji}
    </span>
  );
}

function HeroCard() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        className="animate-float clay absolute -top-6 -left-6 z-20 bg-clay-sun px-4 py-3 text-sm font-black"
        style={{ ["--rot" as string]: "-6deg" } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <Star className="size-4 fill-clay-ink" /> +50 XP!
        </div>
      </div>
      <div
        className="animate-float clay absolute -right-4 top-24 z-20 bg-clay-mint px-4 py-3 text-sm font-black"
        style={{
          animationDelay: "1.2s",
          ["--rot" as string]: "8deg",
        } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <Trophy className="size-4" /> Lencana Baru
        </div>
      </div>

      <div className="clay relative z-10 bg-white p-6">
        <div className="clay-inset relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-clay-grape via-clay-ink to-clay-ink">
          {/* Halo sorot panggung di belakang wayang */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-clay-sun/35 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/3 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-clay-rose/30 blur-2xl"
          />

          {/* Percikan bintang */}
          <Sparkles className="absolute left-5 top-6 size-5 text-clay-sun/90" />
          <Sparkles className="absolute right-6 top-10 size-4 text-clay-pink/80" />
          <Sparkles className="absolute right-8 bottom-28 size-5 text-clay-sun/70" />

          {/* Ilustrasi wayang */}
          <Image
            src="/ChatGPT_Image_8_Mei_2026__12.12.42-removebg-preview.png"
            alt="Tokoh wayang Folkids"
            fill
            priority
            sizes="(max-width: 768px) 90vw, 28rem"
            className="animate-float object-contain p-6 drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
          />

          <div className="absolute bottom-4 left-4 right-4">
            <div className="clay-sm flex items-center gap-3 bg-white/90 px-4 py-3 backdrop-blur">
              <Headphones className="size-5 text-clay-grape" />
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider text-clay-ink/60">
                  Sedang Diputar
                </div>
                <div className="text-sm font-black">Timun Mas — Bag. 2</div>
              </div>
              <div className="clay-sm grid size-10 place-items-center bg-clay-rose text-white">
                <Play className="size-4 fill-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-clay-ink/60">
              Progres Buku
            </div>
            <div className="text-lg font-black">Bab 3 dari 5</div>
          </div>
          <span className="clay-sm bg-clay-sun px-3 py-1.5 text-xs font-black">
            60%
          </span>
        </div>
        <div className="clay-inset mt-3 h-4 bg-clay-cream">
          <div
            className="h-full rounded-full bg-gradient-to-r from-clay-rose via-clay-coral to-clay-sun"
            style={{ width: "60%" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Feature strip ---------- */

function FeatureStrip() {
  const items = [
    { icon: BookOpen, label: "120+ cerita", bg: "bg-clay-pink" },
    { icon: Headphones, label: "Narasi audio", bg: "bg-clay-sky" },
    { icon: Palette, label: "Animasi wayang", bg: "bg-clay-sun" },
    { icon: Trophy, label: "Lencana & XP", bg: "bg-clay-mint" },
    { icon: GraduationCap, label: "Mode guru", bg: "bg-clay-lavender" },
  ];
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16">
      <div className="clay flex flex-wrap items-center justify-center gap-3 bg-white p-6 md:gap-6">
        {items.map(({ icon: Icon, label, bg }) => (
          <div key={label} className="flex items-center gap-3">
            <span className={`clay-sm grid size-11 place-items-center ${bg}`}>
              <Icon className="size-5" />
            </span>
            <span className="text-sm font-black">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Catalog preview ---------- */

type Story = {
  emoji: string;
  title: string;
  region: string;
  theme: string;
  difficulty: "Mudah" | "Sedang" | "Sulit";
  minutes: number;
  bg: string;
  accent: string;
};

const STORIES: Story[] = [
  {
    emoji: "🐉",
    title: "Legenda Timun Mas",
    region: "Jawa Tengah",
    theme: "Keberanian",
    difficulty: "Mudah",
    minutes: 12,
    bg: "bg-clay-pink",
    accent: "bg-clay-rose",
  },
  {
    emoji: "🦌",
    title: "Sang Kancil & Buaya",
    region: "Nusantara",
    theme: "Kecerdikan",
    difficulty: "Mudah",
    minutes: 8,
    bg: "bg-clay-mint",
    accent: "bg-clay-blue",
  },
  {
    emoji: "👑",
    title: "Bawang Merah Bawang Putih",
    region: "Riau",
    theme: "Kejujuran",
    difficulty: "Sedang",
    minutes: 15,
    bg: "bg-clay-sun",
    accent: "bg-clay-coral",
  },
  {
    emoji: "🪁",
    title: "Malin Kundang",
    region: "Sumatera Barat",
    theme: "Bakti pada Orang Tua",
    difficulty: "Sedang",
    minutes: 14,
    bg: "bg-clay-sky",
    accent: "bg-clay-grape",
  },
  {
    emoji: "🦚",
    title: "Roro Jonggrang",
    region: "Yogyakarta",
    theme: "Tekad & Konsekuensi",
    difficulty: "Sulit",
    minutes: 18,
    bg: "bg-clay-lavender",
    accent: "bg-clay-rose",
  },
  {
    emoji: "🐅",
    title: "Wayang: Arjuna Mencari Cinta",
    region: "Jawa Klasik",
    theme: "Kepemimpinan",
    difficulty: "Sulit",
    minutes: 22,
    bg: "bg-clay-peach",
    accent: "bg-clay-blue",
  },
];

function CatalogPreview() {
  return (
    <section id="cerita" className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeader
        kicker="Perpustakaan"
        title={
          <>
            Pilih cerita,{" "}
            <span className="text-clay-grape">mulai petualangan</span>
          </>
        }
        subtitle="Setiap cerita dilengkapi ilustrasi besar, audio narasi pendongeng, dan kuis ringan di akhir bab."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STORIES.map((s) => (
          <StoryCard key={s.title} story={s} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/perpustakaan"
          className="clay inline-flex items-center gap-3 bg-clay-ink px-6 py-3.5 text-sm font-black text-white hover:[transform:translateY(-2px)]"
        >
          Jelajahi 120+ cerita <Map className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function StoryCard({ story }: { story: Story }) {
  const diffColor =
    story.difficulty === "Mudah"
      ? "bg-clay-mint"
      : story.difficulty === "Sedang"
        ? "bg-clay-sun"
        : "bg-clay-coral text-white";
  return (
    <article className="clay group bg-white p-5 transition hover:[transform:translateY(-4px)]">
      <div className={`clay-inset relative aspect-[5/4] overflow-hidden ${story.bg}`}>
        <div className="absolute inset-0 grid place-items-center text-7xl">
          <span className="transition group-hover:scale-110">{story.emoji}</span>
        </div>
        <span className={`clay-sm absolute right-3 top-3 px-3 py-1 text-[10px] font-black uppercase tracking-wider ${diffColor}`}>
          {story.difficulty}
        </span>
      </div>

      <div className="mt-5 flex items-start justify-between gap-3">
        <h3 className="text-lg font-black leading-tight">{story.title}</h3>
        <span className={`clay-sm grid size-9 shrink-0 place-items-center text-white ${story.accent}`}>
          <Play className="size-4 fill-white" />
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-clay-ink/70">
        <span className="clay-sm bg-clay-cream px-2.5 py-1">📍 {story.region}</span>
        <span className="clay-sm bg-clay-cream px-2.5 py-1">💡 {story.theme}</span>
        <span className="clay-sm bg-clay-cream px-2.5 py-1">⏱ {story.minutes} mnt</span>
      </div>
    </article>
  );
}

/* ---------- Progress demo ---------- */

function ProgressDemo() {
  return (
    <section id="progres" className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <SectionHeader
            align="left"
            kicker="Progres Anak"
            title={
              <>
                Lihat <span className="text-clay-rose">tumbuh kembang</span>{" "}
                literasi mereka.
              </>
            }
            subtitle="Setiap halaman yang dibaca dan kuis yang dikerjakan langsung tersimpan. Guru dan orang tua bisa pantau kapan saja."
          />

          <ul className="mt-8 space-y-4">
            {[
              ["Lencana otomatis", "Cerita selesai = lencana baru. Anak makin semangat membaca."],
              ["Riwayat baca", "Tahu cerita apa yang sudah dibaca, mana yang lagi seru-serunya."],
              ["Skor kuis adil", "Penilaian otomatis, ramah anak, dengan umpan balik per soal."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-4">
                <span className="clay-sm grid size-10 shrink-0 place-items-center bg-clay-mint">
                  <CheckCircle2 className="size-5" />
                </span>
                <div>
                  <div className="font-black">{t}</div>
                  <div className="text-sm text-clay-ink/70">{d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <ProgressCard />
      </div>
    </section>
  );
}

function ProgressCard() {
  const bars = [
    { label: "Membaca", value: 82, color: "from-clay-rose to-clay-coral" },
    { label: "Mendengar", value: 64, color: "from-clay-blue to-clay-grape" },
    { label: "Memahami", value: 91, color: "from-clay-sun to-clay-coral" },
    { label: "Kosakata", value: 48, color: "from-clay-mint to-clay-blue" },
  ];

  return (
    <div className="clay relative bg-white p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="clay-sm grid size-12 place-items-center bg-clay-sun text-2xl">
            🧒
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-clay-ink/60">
              Murid · Kelas 3B
            </div>
            <div className="text-lg font-black">Rara Pratiwi</div>
          </div>
        </div>
        <span className="clay-sm bg-clay-mint px-3 py-1.5 text-xs font-black">
          🔥 7 hari beruntun
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between text-sm font-bold">
              <span>{b.label}</span>
              <span className="text-clay-ink/70">{b.value}%</span>
            </div>
            <div className="clay-inset mt-1.5 h-4 bg-clay-cream">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${b.color}`}
                style={{ width: `${b.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3">
        <Stat label="Cerita" value="24" bg="bg-clay-pink" />
        <Stat label="Lencana" value="11" bg="bg-clay-sky" />
        <Stat label="Skor Kuis" value="92" bg="bg-clay-mint" />
      </div>
    </div>
  );
}

function Stat({ label, value, bg }: { label: string; value: string; bg: string }) {
  return (
    <div className={`clay-sm grid place-items-center px-3 py-4 text-center ${bg}`}>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-clay-ink/70">
        {label}
      </div>
    </div>
  );
}

/* ---------- Testimonials ---------- */

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  emoji: string;
  bg: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Anak saya jadi minta dibacain cerita tiap malam. Sekarang malah dia yang baca sendiri sambil ikutin audionya!",
    name: "Bu Lestari",
    role: "Orang tua siswa kelas 2",
    emoji: "👩",
    bg: "bg-clay-pink",
  },
  {
    quote:
      "CMS-nya mudah banget. Saya bisa upload cerita baru, atur kuis, dan pantau kelas tanpa harus jadi orang IT.",
    name: "Pak Ardi",
    role: "Guru SDN Sukamaju 03",
    emoji: "🧑‍🏫",
    bg: "bg-clay-mint",
  },
  {
    quote:
      "Aku suka pas Sang Kancil-nya gerak-gerak! Aku udah dapat 8 lencana, mau kumpulin sampai 50.",
    name: "Bima, 8 tahun",
    role: "Siswa kelas 3",
    emoji: "🧒",
    bg: "bg-clay-sun",
  },
];

function Testimonials() {
  return (
    <section id="cerita-mereka" className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeader
        kicker="Cerita Mereka"
        title={
          <>
            Disukai anak, dipercaya{" "}
            <span className="text-clay-blue">guru & orang tua</span>
          </>
        }
        subtitle="Suara langsung dari kelas yang sudah pakai Wayang Folkids."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <TestimonialCard key={t.name} t={t} />
        ))}
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="clay flex h-full flex-col bg-white p-6">
      <div className="flex items-center gap-1 text-clay-sun">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="size-4 fill-clay-sun" />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-base font-semibold leading-relaxed text-clay-ink/85">
        “{t.quote}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-clay-ink/10 pt-4">
        <span className={`clay-sm grid size-11 place-items-center text-xl ${t.bg}`}>
          {t.emoji}
        </span>
        <div>
          <div className="font-black">{t.name}</div>
          <div className="text-xs font-bold text-clay-ink/60">{t.role}</div>
        </div>
        <Heart className="ml-auto size-5 fill-clay-rose text-clay-rose" />
      </figcaption>
    </figure>
  );
}

/* ---------- Footer ---------- */

function FooterNote() {
  return (
    <footer className="relative z-10 mx-auto max-w-7xl px-6 pb-12">
      <div className="flex flex-col items-center justify-between gap-4 border-t border-clay-ink/10 pt-8 text-sm text-clay-ink/60 md:flex-row">
        <div className="flex items-center gap-2 font-bold">
          <span>🎭</span> WayangFolkids · 2026
        </div>
        <div className="flex items-center gap-6 font-semibold">
          <a href="#" className="hover:text-clay-rose">Kebijakan Privasi</a>
          <a href="#" className="hover:text-clay-rose">Untuk Sekolah</a>
          <a href="#" className="hover:text-clay-rose">Kontak</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Section header ---------- */

function SectionHeader({
  kicker,
  title,
  subtitle,
  align = "center",
}: {
  kicker: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignCls =
    align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col ${alignCls}`}>
      <span className="clay-sm inline-flex items-center gap-2 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider">
        <Sparkles className="size-3.5 text-clay-rose" /> {kicker}
      </span>
      <h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-base text-clay-ink/70 md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
