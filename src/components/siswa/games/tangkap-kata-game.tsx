"use client";

import { useEffect, useRef, useState } from "react";
import { recordGamePlay } from "@/lib/actions/games";
import { GAME_BY_KEY } from "@/lib/games/config";
import { randomWords } from "@/lib/games/word-bank";
import { GameResult } from "@/components/siswa/games/game-result";

const config = GAME_BY_KEY.tangkap_kata;

// Parameter permainan (satuan: persen area main, kecuali TICK ms).
const TICK = 60;
const SPEED = 1.7; // % per tick
const MAX_ON_SCREEN = 6;
const SPAWN_PROB = 0.18;
const HALF_BASKET = 10; // setengah lebar keranjang (%)
const CATCH_Y = 80;
const CATCH_BAND = 16;
const DISTRACTORS = "AIUEORSTNKLMGPBDJH";
const ROUND_WORDS = 3;

type Letter = { id: number; char: string; xPct: number; y: number };

function buildWords(): string[] {
  return [...randomWords(2, "mudah"), ...randomWords(1, "sedang")].slice(0, ROUND_WORDS);
}

export function TangkapKataGame() {
  const [words, setWords] = useState<string[]>(() => buildWords());
  const [letters, setLetters] = useState<Letter[]>([]);
  const [caught, setCaught] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [basketX, setBasketX] = useState(50);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  // Refs cermin untuk dibaca di dalam loop interval (hindari stale closure &
  // setState-in-effect). State di atas hanya untuk render.
  const lettersRef = useRef<Letter[]>([]);
  const caughtRef = useRef("");
  const wordIdxRef = useRef(0);
  const scoreRef = useRef(0);
  const basketRef = useRef(50);
  const wordsRef = useRef<string[]>(words);
  const finishedRef = useRef(false);
  const idRef = useRef(0);
  const savedRef = useRef(false);
  const areaRef = useRef<HTMLDivElement>(null);

  function moveBasket(xPct: number) {
    const clamped = Math.max(HALF_BASKET, Math.min(100 - HALF_BASKET, xPct));
    basketRef.current = clamped;
    setBasketX(clamped);
  }

  function finishGame(finalScore: number) {
    finishedRef.current = true;
    setFinished(true);
    if (savedRef.current) return;
    savedRef.current = true;
    setSaving(true);
    // Skor maksimum teoretis: total huruf ×10 + bonus 20 per kata.
    const totalLetters = wordsRef.current.reduce((n, w) => n + w.length, 0);
    const maxScore = totalLetters * 10 + wordsRef.current.length * 20;
    const points = Math.round((finalScore / Math.max(1, maxScore)) * config.maxPoints);
    void recordGamePlay({
      game: "tangkap_kata",
      score: finalScore,
      points,
      detail: { words: wordsRef.current.length },
    }).finally(() => setSaving(false));
  }

  // Loop utama + kontrol; dipasang sekali. Semua logika baca/tulis via ref,
  // setState hanya untuk mirror render → tidak ada setState sinkron di body efek.
  useEffect(() => {
    function makeLetter(needed: string): Letter {
      const char =
        Math.random() < 0.5
          ? needed
          : DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)];
      return {
        id: idRef.current++,
        char,
        xPct: 6 + Math.random() * 88,
        y: -5,
      };
    }

    function tick() {
      if (finishedRef.current) return;
      const target = wordsRef.current[wordIdxRef.current] ?? "";
      let caughtStr = caughtRef.current;
      let scoreVal = scoreRef.current;

      let next = lettersRef.current.map((l) => ({ ...l, y: l.y + SPEED }));

      if (next.length < MAX_ON_SCREEN && Math.random() < SPAWN_PROB) {
        next.push(makeLetter(target[caughtStr.length] ?? "A"));
      }

      const remaining: Letter[] = [];
      for (const l of next) {
        const inCatchZone =
          l.y >= CATCH_Y &&
          l.y <= CATCH_Y + CATCH_BAND &&
          Math.abs(l.xPct - basketRef.current) <= HALF_BASKET;
        if (inCatchZone) {
          const needed = target[caughtStr.length];
          if (l.char === needed) {
            caughtStr += l.char;
            scoreVal += 10;
          }
          continue; // huruf yang masuk keranjang hilang dari layar
        }
        if (l.y > 108) continue; // terlewat
        remaining.push(l);
      }

      // Kata selesai?
      if (target && caughtStr.length === target.length) {
        scoreVal += 20; // bonus kata
        const ni = wordIdxRef.current + 1;
        if (ni >= wordsRef.current.length) {
          scoreRef.current = scoreVal;
          setScore(scoreVal);
          finishGame(scoreVal);
          return;
        }
        wordIdxRef.current = ni;
        caughtStr = "";
        next = []; // bersihkan layar saat ganti kata
        remaining.length = 0;
      }

      lettersRef.current = remaining;
      caughtRef.current = caughtStr;
      scoreRef.current = scoreVal;
      setLetters(remaining);
      setCaught(caughtStr);
      setScore(scoreVal);
      setWordIdx(wordIdxRef.current);
    }

    const interval = setInterval(tick, TICK);

    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveBasket(basketRef.current - 6);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        moveBasket(basketRef.current + 6);
      }
    }
    window.addEventListener("keydown", onKey);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  function onPointerMove(e: React.PointerEvent) {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    moveBasket(((e.clientX - rect.left) / rect.width) * 100);
  }

  function replay() {
    const fresh = buildWords();
    wordsRef.current = fresh;
    lettersRef.current = [];
    caughtRef.current = "";
    wordIdxRef.current = 0;
    scoreRef.current = 0;
    savedRef.current = false;
    finishedRef.current = false;
    setWords(fresh);
    setLetters([]);
    setCaught("");
    setWordIdx(0);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <GameResult
        score={score}
        points={Math.round(
          (score /
            Math.max(
              1,
              words.reduce((n, w) => n + w.length, 0) * 10 + words.length * 20,
            )) *
            config.maxPoints,
        )}
        saving={saving}
        onReplay={replay}
        caption={`Skor menangkap kata: ${score}`}
      />
    );
  }

  const target = words[wordIdx] ?? "";

  return (
    <div className="mx-auto mt-6 max-w-xl">
      <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
        <span>Kata {wordIdx + 1}/{words.length}</span>
        <span>Skor: {score}</span>
      </div>

      {/* Kata target dengan progres huruf tertangkap */}
      <div className="clay mt-2 bg-white p-4 text-center">
        <p className="font-serif text-3xl font-black tracking-[0.2em] text-clay-ink">
          {target.split("").map((ch, i) => (
            <span key={i} className={i < caught.length ? "text-clay-mint" : "text-clay-ink/25"}>
              {ch}
            </span>
          ))}
        </p>
      </div>

      {/* Area main */}
      <div
        ref={areaRef}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerMove}
        className="clay-inset relative mt-4 h-80 touch-none overflow-hidden bg-gradient-to-b from-clay-sky/40 to-clay-cream"
      >
        {letters.map((l) => (
          <span
            key={l.id}
            className="clay-sm absolute grid size-9 -translate-x-1/2 place-items-center bg-clay-sun text-lg font-black text-clay-ink"
            style={{ left: `${l.xPct}%`, top: `${l.y}%` }}
          >
            {l.char}
          </span>
        ))}

        {/* Keranjang */}
        <div
          className="absolute bottom-2 -translate-x-1/2 text-4xl"
          style={{ left: `${basketX}%` }}
          aria-hidden
        >
          🧺
        </div>
      </div>

      <p className="mt-4 text-center text-sm font-semibold text-clay-ink/55">
        Gerakkan keranjang dengan panah ← → atau geser jari/mouse untuk menangkap
        huruf yang tepat.
      </p>
    </div>
  );
}
