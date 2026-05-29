import { cn } from "@/lib/utils";

// Siluet wayang dekoratif (gunung/kayon) — aksen halus low-opacity di sudut section.
export function WayangAccent({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 160"
      fill="currentColor"
      className={cn("pointer-events-none select-none", className)}
    >
      <path d="M50 2c4 10 2 18 8 22 5 3 9 2 9 8 0 4-4 6-4 10s5 6 5 12-6 8-6 13 6 7 6 14c0 9-9 14-9 24 0 12 6 18 6 28 0 8-6 13-18 13S29 154 29 146c0-10 6-16 6-28 0-10-9-15-9-24 0-7 6-9 6-14s-6-7-6-13 5-8 5-12-4-6-4-10c0-6 4-5 9-8 6-4 4-12 8-22 1-2 5-2 6 0Z" />
      <circle cx="50" cy="40" r="5" className="text-clay-cream" fill="currentColor" />
      <circle cx="50" cy="70" r="4" className="text-clay-cream" fill="currentColor" />
    </svg>
  );
}
