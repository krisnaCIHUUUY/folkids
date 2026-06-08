"use client";

import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { recordGamePlay } from "@/lib/actions/games";
import { GAME_BY_KEY } from "@/lib/games/config";
import { WORD_PICS, scramble, type WordPic } from "@/lib/games/word-bank";
import { GameResult } from "@/components/siswa/games/game-result";

const ROUNDS = 5;
const config = GAME_BY_KEY.susun_kata;

type Tile = { id: string; char: string };

function buildRounds(): WordPic[] {
  const pool = [...WORD_PICS.mudah, ...WORD_PICS.sedang];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, ROUNDS);
}

function makeTiles(word: string): Tile[] {
  return scramble(word).map((char, i) => ({ id: `t${i}-${char}`, char }));
}

export function SusunKataGame() {
  const [rounds, setRounds] = useState<WordPic[]>(() => buildRounds());
  const [roundIdx, setRoundIdx] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>(() => makeTiles(rounds[0].word));
  // slots[i] = tile id atau null
  const [slots, setSlots] = useState<(string | null)[]>(() =>
    new Array(rounds[0].word.length).fill(null),
  );
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const current = rounds[roundIdx];
  const tileById = useMemo(() => new Map(tiles.map((t) => [t.id, t])), [tiles]);
  const placedIds = useMemo(() => new Set(slots.filter(Boolean) as string[]), [slots]);
  const tray = tiles.filter((t) => !placedIds.has(t.id));

  function resetRound(idx: number, list: WordPic[]) {
    setTiles(makeTiles(list[idx].word));
    setSlots(new Array(list[idx].word.length).fill(null));
  }

  function placeInSlot(tileId: string, slotIndex: number) {
    const next = slots.map((id) => (id === tileId ? null : id)); // hapus dari slot lama
    next[slotIndex] = tileId;
    setSlots(next);
    checkComplete(next);
  }

  function removeFromSlot(slotIndex: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  }

  function tapTile(tileId: string) {
    const empty = slots.findIndex((s) => s === null);
    if (empty === -1) return;
    placeInSlot(tileId, empty);
  }

  function checkComplete(next: (string | null)[]) {
    if (next.some((s) => s === null)) return;
    const built = next.map((id) => tileById.get(id!)?.char ?? "").join("");
    if (built === current.word) {
      const nextCorrect = correct + 1;
      setCorrect(nextCorrect);
      const isLast = roundIdx === rounds.length - 1;
      if (isLast) {
        finish(nextCorrect);
      } else {
        toast.success("Benar! 🎉");
        const ni = roundIdx + 1;
        setRoundIdx(ni);
        resetRound(ni, rounds);
      }
    } else {
      toast.error("Belum tepat, coba lagi ya!");
      // Kosongkan slot agar anak menyusun ulang.
      setTimeout(() => setSlots(new Array(current.word.length).fill(null)), 600);
    }
  }

  function finish(correctCount: number) {
    setFinished(true);
    if (savedRef.current) return;
    savedRef.current = true;
    setSaving(true);
    const points = Math.round((correctCount / rounds.length) * config.maxPoints);
    void recordGamePlay({
      game: "susun_kata",
      score: correctCount,
      points,
      detail: { rounds: rounds.length },
    }).finally(() => setSaving(false));
  }

  function handleDragEnd(e: DragEndEvent) {
    const tileId = String(e.active.id);
    const over = e.over?.id ? String(e.over.id) : null;
    if (!over) return;
    if (over.startsWith("slot-")) {
      placeInSlot(tileId, Number(over.slice(5)));
    } else if (over === "tray") {
      setSlots((prev) => prev.map((id) => (id === tileId ? null : id)));
    }
  }

  function replay() {
    const fresh = buildRounds();
    savedRef.current = false;
    setRounds(fresh);
    setRoundIdx(0);
    setCorrect(0);
    setFinished(false);
    resetRound(0, fresh);
  }

  if (finished) {
    const points = Math.round((correct / rounds.length) * config.maxPoints);
    return (
      <GameResult
        score={correct}
        points={points}
        saving={saving}
        onReplay={replay}
        caption={`Kamu menyusun ${correct} dari ${rounds.length} kata dengan benar.`}
      />
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="mx-auto mt-6 max-w-xl">
        <p className="text-center font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
          Kata {roundIdx + 1} dari {rounds.length}
        </p>

        {/* Gambar (emoji) */}
        <div className="clay mt-3 grid place-items-center bg-white p-8">
          <span className="text-7xl md:text-8xl" aria-hidden>
            {current.emoji}
          </span>
        </div>

        {/* Slot tujuan */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {slots.map((tileId, i) => (
            <Slot key={i} index={i} tile={tileId ? tileById.get(tileId) : undefined} onClear={() => removeFromSlot(i)} />
          ))}
        </div>

        {/* Baki huruf teracak */}
        <Tray>
          {tray.map((t) => (
            <DraggableTile key={t.id} tile={t} onTap={() => tapTile(t.id)} />
          ))}
          {tray.length === 0 && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-clay-mint">
              <CheckCircle2 className="size-4" /> Semua huruf tersusun
            </span>
          )}
        </Tray>

        <p className="mt-4 text-center text-sm font-semibold text-clay-ink/55">
          Seret huruf ke kotak, atau ketuk huruf untuk menempatkannya.
        </p>
      </div>
    </DndContext>
  );
}

function Slot({
  index,
  tile,
  onClear,
}: {
  index: number;
  tile?: Tile;
  onClear: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${index}` });
  return (
    <button
      type="button"
      ref={setNodeRef}
      onClick={tile ? onClear : undefined}
      className={`clay-inset grid size-12 place-items-center text-2xl font-black text-clay-ink transition md:size-14 ${
        isOver ? "bg-clay-mint/40" : "bg-clay-cream"
      } ${tile ? "cursor-pointer" : ""}`}
    >
      {tile?.char ?? ""}
    </button>
  );
}

function Tray({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "tray" });
  return (
    <div
      ref={setNodeRef}
      className={`clay-sm mt-6 flex min-h-16 flex-wrap items-center justify-center gap-2 p-4 transition ${
        isOver ? "bg-clay-sky/30" : "bg-white"
      }`}
    >
      {children}
    </div>
  );
}

function DraggableTile({ tile, onTap }: { tile: Tile; onTap: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tile.id,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      onClick={onTap}
      {...listeners}
      {...attributes}
      className={`clay-sm grid size-12 touch-none place-items-center bg-clay-sun text-2xl font-black text-clay-ink transition md:size-14 ${
        isDragging ? "opacity-50" : "hover:[transform:translateY(-2px)]"
      }`}
    >
      {tile.char}
    </button>
  );
}
