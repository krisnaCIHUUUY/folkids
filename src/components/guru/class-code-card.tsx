"use client";

import { useState, useTransition } from "react";
import { Copy, Check, RefreshCw, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { regenerateClassCode } from "@/lib/actions/classes";

export function ClassCodeCard({
  classId,
  initialCode,
}: {
  classId: number;
  initialCode: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Kode disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin kode");
    }
  }

  function handleRegenerate() {
    startTransition(async () => {
      const result = await regenerateClassCode(classId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setCode(result.code);
      toast.success("Kode kelas diperbarui");
    });
  }

  return (
    <section className="clay bg-white p-6">
      <div className="flex items-center gap-2.5">
        <span className="clay-sm grid size-9 place-items-center bg-clay-sun text-clay-ink">
          <KeyRound className="size-4" />
        </span>
        <h2 className="font-serif text-lg font-bold text-clay-ink">Kode Kelas</h2>
      </div>
      <p className="mt-2 text-sm font-semibold text-clay-ink/60">
        Bagikan kode ini agar siswa dapat bergabung ke kelas.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="clay-inset rounded-xl bg-clay-cream px-5 py-3 font-mono text-2xl font-black tracking-[0.3em] text-clay-ink">
          {code}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="clay-sm inline-flex items-center gap-1.5 bg-white px-4 py-2.5 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          {copied ? <Check className="size-4 text-clay-blue" /> : <Copy className="size-4" />}
          {copied ? "Tersalin" : "Salin"}
        </button>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={pending}
          className="clay-sm inline-flex items-center gap-1.5 bg-white px-4 py-2.5 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
          Buat Ulang
        </button>
      </div>
    </section>
  );
}
