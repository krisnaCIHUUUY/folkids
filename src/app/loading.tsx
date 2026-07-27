export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-clay-cream">
      <div className="flex flex-col items-center gap-4">
        <span className="clay-sm grid size-16 place-items-center bg-clay-sun text-3xl animate-bounce">
          🎭
        </span>
        <p className="font-serif text-lg font-bold text-clay-ink/60 animate-pulse">
          Memuat…
        </p>
      </div>
    </div>
  );
}
