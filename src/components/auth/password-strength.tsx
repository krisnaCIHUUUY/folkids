"use client";

import { getPasswordStrength } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  { level: 1, color: "bg-clay-coral" },
  { level: 2, color: "bg-clay-sun" },
  { level: 3, color: "bg-clay-mint" },
];

const LABEL_COLOR: Record<string, string> = {
  Lemah: "text-clay-coral",
  Sedang: "text-clay-ink/70",
  Kuat: "text-clay-mint",
};

export function PasswordStrengthMeter({ value }: { value: string }) {
  if (!value) return null;

  const { label, level } = getPasswordStrength(value);

  return (
    <div className="mt-2 space-y-1.5">
      <div className="clay-inset flex gap-1.5 bg-clay-cream p-1.5">
        {SEGMENTS.map((seg) => (
          <div
            key={seg.level}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              level >= seg.level ? seg.color : "bg-clay-ink/10",
            )}
          />
        ))}
      </div>
      <p className="text-right text-xs font-bold">
        Kekuatan:{" "}
        <span className={cn(LABEL_COLOR[label])}>{label}</span>
      </p>
    </div>
  );
}
