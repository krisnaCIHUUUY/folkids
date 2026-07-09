"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { isHtml, sanitizeRichText, stripHtml } from "@/lib/rich-text";

type PlayState = "idle" | "playing" | "paused";

// Pisahkan teks polos jadi token kata + spasi, sambil menyimpan offset karakter
// awal tiap token. Offset dipakai memetakan charIndex dari event onboundary TTS
// ke kata yang sedang dibacakan. Token spasi (termasuk newline) ikut dirender
// agar whitespace-pre-line tetap utuh.
type Token = { text: string; start: number; isWord: boolean };

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const re = /(\s+)|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    tokens.push({ text: m[0], start: m.index, isWord: Boolean(m[2]) });
  }
  return tokens;
}

// Deteksi dukungan Web Speech API tanpa setState-in-effect & tanpa hydration
// mismatch: server selalu false, klien membaca keberadaan API.
const subscribeNoop = () => () => {};
const isSpeechSupported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

// Hook pembacaan teks via Web Speech API. Mengembalikan kontrol + index karakter
// aktif (untuk highlight). Semua jalur degradasi (tak ada API, tak ada voice
// id-ID, tak ada event boundary) ditangani tanpa membuat UI rusak. Komponen
// di-remount per halaman (via key) sehingga state otomatis tereset saat pindah
// halaman; efek di sini hanya membatalkan audio yang sedang berjalan saat unmount.
function useSpeech(text: string) {
  const supported = useSyncExternalStore(
    subscribeNoop,
    isSpeechSupported,
    () => false,
  );
  const [state, setState] = useState<PlayState>("idle");
  const [charIndex, setCharIndex] = useState(-1);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!isSpeechSupported()) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => v.lang?.toLowerCase().startsWith("id")) ?? null;
    };
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
      // Batalkan audio yang masih berjalan saat komponen di-unmount (pindah halaman).
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    if (isSpeechSupported()) window.speechSynthesis.cancel();
    setState("idle");
    setCharIndex(-1);
  }, []);

  const play = useCallback(() => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "id-ID";
    utter.rate = 0.95;
    if (voiceRef.current) utter.voice = voiceRef.current;

    utter.onboundary = (e) => {
      if (e.name === "word" || e.name === undefined) {
        setCharIndex(e.charIndex);
      }
    };
    utter.onend = () => {
      setState("idle");
      setCharIndex(-1);
    };
    utter.onerror = () => {
      setState("idle");
      setCharIndex(-1);
    };

    window.speechSynthesis.speak(utter);
    setState("playing");
  }, [supported, text]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setState("paused");
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setState("playing");
  }, [supported]);

  return { supported, state, charIndex, play, pause, resume, stop };
}

function Controls({
  state,
  onPlay,
  onPause,
  onResume,
  onStop,
}: {
  state: PlayState;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {state === "idle" && (
        <button
          type="button"
          onClick={onPlay}
          className="clay-sm inline-flex items-center gap-1.5 bg-clay-blue px-4 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <Volume2 className="size-4" /> Bacakan
        </button>
      )}
      {state === "playing" && (
        <button
          type="button"
          onClick={onPause}
          aria-pressed="true"
          className="clay-sm inline-flex items-center gap-1.5 bg-clay-sun px-4 py-2.5 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <Pause className="size-4" /> Jeda
        </button>
      )}
      {state === "paused" && (
        <button
          type="button"
          onClick={onResume}
          className="clay-sm inline-flex items-center gap-1.5 bg-clay-mint px-4 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <Play className="size-4" /> Lanjut
        </button>
      )}
      {state !== "idle" && (
        <button
          type="button"
          onClick={onStop}
          className="clay-sm inline-flex items-center gap-1.5 bg-white px-4 py-2.5 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <Square className="size-4" /> Stop
        </button>
      )}
    </div>
  );
}

const textClass =
  "rich-content font-serif text-lg leading-relaxed text-clay-ink md:text-xl";

// Komponen render teks halaman + tombol "Bacakan" (TTS). Untuk teks polos, kata
// yang sedang dibacakan disorot mengikuti event boundary; untuk konten HTML
// (TipTap), render kaya dipertahankan dan TTS membacakan versi teks polosnya
// tanpa sorotan per-kata.
export function ReadAloudText({ content }: { content: string }) {
  const html = isHtml(content);
  const speechText = useMemo(
    () => (html ? stripHtml(content) : content),
    [html, content],
  );
  const tokens = useMemo(
    () => (html ? [] : tokenize(content)),
    [html, content],
  );
  const { supported, state, charIndex, play, pause, resume, stop } =
    useSpeech(speechText);

  // Token aktif = token kata terakhir yang start-nya <= charIndex.
  const activeStart = useMemo(() => {
    if (charIndex < 0) return -1;
    let found = -1;
    for (const t of tokens) {
      if (t.isWord && t.start <= charIndex) found = t.start;
      else if (t.start > charIndex) break;
    }
    return found;
  }, [tokens, charIndex]);

  return (
    <div>
      {supported && (
        <Controls
          state={state}
          onPlay={play}
          onPause={pause}
          onResume={resume}
          onStop={stop}
        />
      )}

      {html ? (
        <div
          className={textClass}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
        />
      ) : (
        <p className={`whitespace-pre-line ${textClass}`}>
          {tokens.map((t, i) =>
            t.isWord ? (
              <span
                key={i}
                className={
                  t.start === activeStart
                    ? "rounded bg-clay-sun/60 box-decoration-clone"
                    : undefined
                }
              >
                {t.text}
              </span>
            ) : (
              <span key={i}>{t.text}</span>
            ),
          )}
        </p>
      )}
    </div>
  );
}
