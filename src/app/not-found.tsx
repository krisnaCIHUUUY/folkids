import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-clay-cream px-6">
      <div className="clay flex max-w-md flex-col items-center gap-5 bg-white p-10 text-center">
        <span className="clay-sm grid size-20 place-items-center bg-clay-sun text-4xl">
          🎭
        </span>
        <h1 className="font-serif text-4xl font-black text-clay-ink">
          404
        </h1>
        <p className="font-serif text-lg font-bold text-clay-ink/70">
          Halaman ini tidak ditemukan atau mungkin sudah dipindahkan.
        </p>
        <Link
          href="/"
          className="clay mt-2 bg-clay-rose px-7 py-3 font-black text-white transition hover:[transform:translateY(-3px)]"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
