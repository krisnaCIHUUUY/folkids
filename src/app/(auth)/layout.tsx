export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="relative grid min-h-screen place-items-center overflow-hidden bg-clay-cream p-6 font-sans text-clay-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-20 size-[28rem] rounded-full bg-clay-pink/50 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 size-[26rem] rounded-full bg-clay-sky/60 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 size-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-clay-lavender/40 blur-3xl" />
      </div>
      {children}
    </main>
  );
}
