"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { recordGamePlay } from "@/lib/actions/games";
import { GAME_BY_KEY } from "@/lib/games/config";
import { randomWords } from "@/lib/games/word-bank";
import { GameResult } from "@/components/siswa/games/game-result";

const TOTAL = 8;
const config = GAME_BY_KEY.ketik_cepat;

// Dibungkus agar tidak dianggap pemanggilan fungsi impur saat render oleh linter.
const nowMs = () => Date.now();

function buildWords(): string[] {
  const list = [...randomWords(4, "mudah"), ...randomWords(4, "sedang")];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list.slice(0, TOTAL);
}

export function KetikCepatGame() {
  const [words, setWords] = useState<string[]>(() => buildWords());
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const startRef = useRef<number | null>(null);
  const savedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  const target = words[idx] ?? "";
  const progress = useMemo(() => idx / words.length, [idx, words.length]);

  function handleChange(value: string) {
    if (finished) return;
    if (startRef.current === null) startRef.current = nowMs();

    if (value.trim().toUpperCase() === target.toUpperCase()) {
      const nextIdx = idx + 1;
      setTyped("");
      if (nextIdx >= words.length) {
        setIdx(nextIdx);
        finish(nextIdx);
      } else {
        setIdx(nextIdx);
      }
    } else {
      setTyped(value);
    }
  }

  function finish(completed: number) {
    setFinished(true);
    if (savedRef.current) return;
    savedRef.current = true;
    setSaving(true);
    const durationSeconds = startRef.current
      ? Math.round((nowMs() - startRef.current) / 1000)
      : undefined;
    const points = Math.round((completed / words.length) * config.maxPoints);
    void recordGamePlay({
      game: "ketik_cepat",
      score: completed,
      points,
      durationSeconds,
      detail: { total: words.length },
    }).finally(() => setSaving(false));
  }

  function replay() {
    savedRef.current = false;
    startRef.current = null;
    setWords(buildWords());
    setIdx(0);
    setTyped("");
    setFinished(false);
  }

  if (finished) {
    const points = Math.round((idx / words.length) * config.maxPoints);
    return (
      <GameResult
        score={idx}
        points={points}
        saving={saving}
        onReplay={replay}
        caption={`Kamu menyelesaikan ${idx} dari ${words.length} kata.`}
      />
    );
  }

  // Cek karakter yang sudah benar diketik untuk pewarnaan.
  const typedUpper = typed.toUpperCase();

  return (
    <div className="mx-auto mt-6 max-w-xl">
      <p className="text-center font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
        Kata {Math.min(idx + 1, words.length)} dari {words.length}
      </p>

      {/* Lintasan balap */}
      <div className="clay-inset relative mt-3 h-16 overflow-hidden bg-clay-cream">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 border-t-2 border-dashed border-clay-ink/20" />
        <motion.span
          className="absolute top-1/2 text-3xl"
          style={{ translateY: "-50%" }}
          animate={{ left: `calc(${progress * 100}% )` }}
          transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
          aria-hidden
        >
          🏎️
        </motion.span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-3xl" aria-hidden>
          🏁
        </span>
      </div>

      {/* Kata target */}
      <div className="clay mt-6 bg-white p-6 text-center">
        <p className="font-serif text-4xl font-black tracking-[0.15em] text-clay-ink md:text-5xl">
          {target.split("").map((ch, i) => (
            <span
              key={i}
              className={
                i < typedUpper.length
                  ? typedUpper[i] === ch
                    ? "text-clay-mint"
                    : "text-clay-coral"
                  : undefined
              }
            >
              {ch}
            </span>
          ))}
        </p>
        <input
          autoFocus
          type="text"
          value={typed}
          onChange={(e) => handleChange(e.target.value)}
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Ketik di sini…"
          aria-label="Ketik kata yang ditampilkan"
          className="clay-inset mt-5 w-full bg-white py-3 text-center font-mono text-xl font-black uppercase tracking-widest text-clay-ink outline-none focus-visible:ring-2 focus-visible:ring-clay-rose/50"
        />
      </div>

      <p className="mt-4 text-center text-sm font-semibold text-clay-ink/55">
        Ketik kata di atas dengan benar untuk membuat mobilmu melaju! 🏁
      </p>
    </div>
  );
}
