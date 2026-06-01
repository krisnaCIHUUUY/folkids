"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { WayangAccent } from "@/components/wayang-accent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ===== Tipe props (data mentah dari dashboard, sudah RLS-scoped) =====
export type TrendClass = { id: number; name: string };
export type TrendMember = { classId: number; studentId: string; name: string };
export type TrendAttempt = { studentId: string; completedAt: string | null; pct: number };
export type TrendReading = { studentId: string; completedAt: string | null };

type Metric = "score" | "quiz" | "activity";

const METRICS: { value: Metric; label: string; unit: string }[] = [
  { value: "score", label: "Rata-rata Nilai", unit: "%" },
  { value: "quiz", label: "Kuis Dikerjakan", unit: "" },
  { value: "activity", label: "Total Aktivitas", unit: "" },
];

const WEEKS = 8;
const DAY = 86_400_000;

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const mondayOffset = (x.getDay() + 6) % 7; // Senin = 0
  x.setDate(x.getDate() - mondayOffset);
  return x;
}

function chipClass(active: boolean) {
  return [
    "clay-sm inline-flex items-center px-3.5 py-2 text-sm font-bold transition",
    "hover:[transform:translateY(-2px)] active:[transform:translateY(1px)]",
    active ? "bg-clay-rose text-white" : "bg-white text-clay-ink/70 hover:text-clay-ink",
  ].join(" ");
}

export function LiteracyTrendSection({
  classes,
  members,
  attempts,
  readings,
}: {
  classes: TrendClass[];
  members: TrendMember[];
  attempts: TrendAttempt[];
  readings: TrendReading[];
}) {
  const [classId, setClassId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("score");

  // Siswa pada kelas terpilih (untuk dropdown drill).
  const classStudents = useMemo(() => {
    if (classId === null) return [];
    const seen = new Set<string>();
    const out: { id: string; name: string }[] = [];
    for (const m of members) {
      if (m.classId === classId && !seen.has(m.studentId)) {
        seen.add(m.studentId);
        out.push({ id: m.studentId, name: m.name });
      }
    }
    return out.sort((a, b) => a.name.localeCompare(b.name, "id"));
  }, [members, classId]);

  // Set siswa dalam scope (siswa tunggal / kelas / semua kelas guru).
  const scope = useMemo(() => {
    if (studentId) return new Set([studentId]);
    if (classId !== null)
      return new Set(members.filter((m) => m.classId === classId).map((m) => m.studentId));
    return new Set(members.map((m) => m.studentId));
  }, [members, classId, studentId]);

  // 8 bucket mingguan hingga minggu berjalan.
  const buckets = useMemo(() => {
    const thisMon = startOfWeek(new Date()).getTime();
    return Array.from({ length: WEEKS }, (_, i) => {
      const start = thisMon - (WEEKS - 1 - i) * 7 * DAY;
      return { start, end: start + 7 * DAY };
    });
  }, []);

  const bucketIndex = (iso: string | null): number => {
    if (!iso) return -1;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return -1;
    const first = buckets[0].start;
    const idx = Math.floor((t - first) / (7 * DAY));
    return idx >= 0 && idx < WEEKS ? idx : -1;
  };

  const series = useMemo(() => {
    const scoreSum = Array<number>(WEEKS).fill(0);
    const scoreCnt = Array<number>(WEEKS).fill(0);
    const quizCnt = Array<number>(WEEKS).fill(0);
    const readCnt = Array<number>(WEEKS).fill(0);

    for (const a of attempts) {
      if (!scope.has(a.studentId)) continue;
      const i = bucketIndex(a.completedAt);
      if (i < 0) continue;
      scoreSum[i] += a.pct;
      scoreCnt[i] += 1;
      quizCnt[i] += 1;
    }
    for (const r of readings) {
      if (!scope.has(r.studentId)) continue;
      const i = bucketIndex(r.completedAt);
      if (i < 0) continue;
      readCnt[i] += 1;
    }

    const values: (number | null)[] = buckets.map((_, i) => {
      if (metric === "score") return scoreCnt[i] ? Math.round(scoreSum[i] / scoreCnt[i]) : null;
      if (metric === "quiz") return quizCnt[i];
      return quizCnt[i] + readCnt[i];
    });

    const labels = buckets.map((b) => {
      const d = new Date(b.start);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    const hasAny =
      quizCnt.some((n) => n > 0) || readCnt.some((n) => n > 0);

    return { values, labels, hasAny };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts, readings, scope, metric, buckets]);

  const unit = METRICS.find((m) => m.value === metric)!.unit;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <span className="relative grid size-10 place-items-center overflow-hidden">
          <WayangAccent className="absolute inset-0 h-full w-full text-clay-sky/30" />
          <span className="clay-sm relative grid size-10 place-items-center bg-clay-sky text-clay-ink">
            <TrendingUp className="size-5" />
          </span>
        </span>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-clay-ink">
          Tren Progres Literasi
        </h2>
      </div>

      <div className="clay mt-5 bg-white p-5 md:p-6">
        {/* Kontrol */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="mb-1 font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/45">
                Kelas
              </p>
              <Select
                value={classId === null ? "all" : String(classId)}
                onValueChange={(v) => {
                  setClassId(v === "all" ? null : Number(v));
                  setStudentId(null);
                }}
              >
                <SelectTrigger className="h-10 min-w-[180px] bg-clay-cream">
                  <SelectValue placeholder="Semua kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua kelas</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {classId !== null && (
              <div>
                <p className="mb-1 font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/45">
                  Siswa
                </p>
                <Select
                  value={studentId ?? "all"}
                  onValueChange={(v) => setStudentId(v === "all" ? null : v)}
                >
                  <SelectTrigger className="h-10 min-w-[180px] bg-clay-cream">
                    <SelectValue placeholder="Semua siswa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua siswa (agregat)</SelectItem>
                    {classStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Chip metrik */}
          <div className="flex flex-wrap gap-2">
            {METRICS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMetric(m.value)}
                className={chipClass(metric === m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grafik */}
        <div className="mt-6">
          {series.hasAny ? (
            <TrendChart values={series.values} labels={series.labels} unit={unit} />
          ) : (
            <div className="grid place-items-center rounded-2xl bg-clay-cream/60 py-16 text-center">
              <p className="font-semibold text-clay-ink/60">
                Belum ada aktivitas untuk ditampilkan pada periode ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ===== Chart SVG kustom =====
function niceMax(values: (number | null)[], unit: string): number {
  if (unit === "%") return 100;
  const max = Math.max(1, ...values.map((v) => v ?? 0));
  if (max <= 5) return max;
  return Math.ceil(max / 5) * 5;
}

function TrendChart({
  values,
  labels,
  unit,
}: {
  values: (number | null)[];
  labels: string[];
  unit: string;
}) {
  const W = 720;
  const H = 240;
  const padL = 38;
  const padR = 14;
  const padT = 14;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const yMax = niceMax(values, unit);
  const n = values.length;

  const x = (i: number) => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => padT + plotH - (v / yMax) * plotH;

  // Segmen kontinu (titik null → putus).
  const segments: { i: number; v: number }[][] = [];
  let cur: { i: number; v: number }[] = [];
  values.forEach((v, i) => {
    if (v === null) {
      if (cur.length) segments.push(cur);
      cur = [];
    } else {
      cur.push({ i, v });
    }
  });
  if (cur.length) segments.push(cur);

  const ticks = unit === "%" ? [0, 25, 50, 75, 100] : tickList(yMax);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Grafik tren progres literasi"
    >
      <defs>
        <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-clay-rose)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-clay-rose)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Gridlines + label Y */}
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={padL}
            y1={y(t)}
            x2={W - padR}
            y2={y(t)}
            stroke="currentColor"
            className="text-clay-ink/10"
            strokeWidth={1}
          />
          <text
            x={padL - 8}
            y={y(t) + 4}
            textAnchor="end"
            className="fill-clay-ink/45 font-mono text-[11px]"
          >
            {t}
            {unit}
          </text>
        </g>
      ))}

      {/* Label X */}
      {labels.map((lbl, i) => (
        <text
          key={i}
          x={x(i)}
          y={H - 8}
          textAnchor="middle"
          className="fill-clay-ink/45 font-mono text-[11px]"
        >
          {lbl}
        </text>
      ))}

      {/* Area + garis per segmen */}
      {segments.map((seg, si) => {
        const line = seg.map((p) => `${x(p.i)},${y(p.v)}`).join(" ");
        const area =
          `M ${x(seg[0].i)},${padT + plotH} ` +
          seg.map((p) => `L ${x(p.i)},${y(p.v)}`).join(" ") +
          ` L ${x(seg[seg.length - 1].i)},${padT + plotH} Z`;
        return (
          <g key={si}>
            <path d={area} fill="url(#trendArea)" />
            <polyline
              points={line}
              fill="none"
              stroke="var(--color-clay-rose)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* Titik */}
      {values.map((v, i) =>
        v === null ? null : (
          <circle
            key={i}
            cx={x(i)}
            cy={y(v)}
            r={4.5}
            className="fill-white"
            stroke="var(--color-clay-rose)"
            strokeWidth={3}
          >
            <title>
              Minggu {labels[i]}: {v}
              {unit}
            </title>
          </circle>
        ),
      )}
    </svg>
  );
}

function tickList(max: number): number[] {
  const step = max / 4;
  return [0, 1, 2, 3, 4].map((k) => Math.round(k * step));
}
