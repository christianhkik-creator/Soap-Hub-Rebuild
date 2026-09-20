export function QualityScoreBar({
  label,
  value,
  range,
  axisMax,
  decimals = 0,
}: {
  label: string;
  value: number;
  range: [number, number];
  axisMax: number;
  decimals?: number;
}) {
  const [min, max] = range;
  // Compare the rounded (displayed) value, not the raw float, so the color
  // never contradicts the number shown (e.g. a raw 11.83 that displays as
  // "12" — the bottom of a "12-22" range — must not render as out-of-range).
  const displayValue = Number(value.toFixed(decimals));
  const inRange = displayValue >= min && displayValue <= max;

  const rangeStartPct = (min / axisMax) * 100;
  const rangeWidthPct = ((max - min) / axisMax) * 100;
  const valuePct = Math.min(Math.max((displayValue / axisMax) * 100, 0), 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="font-medium">{label}</span>
        <span className={`font-display text-lg font-semibold ${inRange ? "text-success" : "text-warning"}`}>
          {value.toFixed(decimals)}
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <span
          className="absolute top-0 h-full bg-success/25"
          style={{ left: `${rangeStartPct}%`, width: `${rangeWidthPct}%` }}
        />
        <span
          className={`absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-card ${
            inRange ? "bg-success" : "bg-warning"
          }`}
          style={{ left: `calc(${valuePct}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>
          Ideal: {min}-{max}
        </span>
        <span>{axisMax}</span>
      </div>
    </div>
  );
}
