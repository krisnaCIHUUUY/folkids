"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard tidak tersedia — abaikan
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Salin kode kelas ${code}`}
      className="clay-sm inline-flex items-center gap-2 bg-clay-cream px-3 py-1.5 font-mono text-sm font-black tracking-wider text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
    >
      {code}
      {copied ? (
        <Check className="size-4 text-clay-mint" strokeWidth={3} />
      ) : (
        <Copy className="size-4 text-clay-ink/50" />
      )}
    </button>
  );
}
