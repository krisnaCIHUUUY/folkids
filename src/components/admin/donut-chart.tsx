export type DonutSegment = { label: string; value: number; color: string };

// Diagram donat SVG ringan (server-rendered, tanpa JS). Tooltip native via <title>.
export function DonutChart({
  segments,
  centerValue,
  centerLabel,
  total,
  size = 168,
  thickness = 24,
}: {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel?: string;
  total?: number; // override (mis. untuk gauge persentase berbasis 100)
  size?: number;
  thickness?: number;
}) {
  const sum = total ?? segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;

  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Track latar */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="var(--color-clay-ink)"
          strokeOpacity={0.07}
          strokeWidth={thickness}
        />
        {sum > 0 &&
          segments.map((seg, i) => {
            const len = (seg.value / sum) * circumference;
            if (len <= 0) return null;
            const node = (
              <circle
                key={i}
                cx={cx}
                cy={cx}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${circumference - len}`}
                strokeDashoffset={-offset}
              >
                <title>{`${seg.label}: ${seg.value}`}</title>
              </circle>
            );
            offset += len;
            return node;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-3xl font-black leading-none text-clay-ink">
          {centerValue}
        </span>
        {centerLabel && (
          <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-clay-ink/50">
            {centerLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export function DonutCard({
  title,
  segments,
  centerValue,
  centerLabel,
  total,
}: {
  title: string;
  segments: DonutSegment[];
  centerValue: string;
  centerLabel?: string;
  total?: number;
}) {
  const legendTotal = total ?? segments.reduce((s, x) => s + x.value, 0);
  return (
    <div className="clay flex flex-col items-center bg-white p-5">
      <h3 className="self-start font-serif text-lg font-bold text-clay-ink">{title}</h3>
      <div className="mt-3">
        <DonutChart
          segments={segments}
          centerValue={centerValue}
          centerLabel={centerLabel}
          total={total}
        />
      </div>
      <ul className="mt-4 w-full space-y-2">
        {segments.map((seg) => {
          const pct = legendTotal > 0 ? Math.round((seg.value / legendTotal) * 100) : 0;
          return (
            <li key={seg.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-bold text-clay-ink">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ background: seg.color }}
                />
                {seg.label}
              </span>
              <span className="font-mono font-black text-clay-ink/70">
                {seg.value.toLocaleString("id-ID")}
                <span className="ml-1 text-clay-ink/40">({pct}%)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
