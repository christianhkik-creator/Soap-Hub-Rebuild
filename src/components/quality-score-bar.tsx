export function QualityScoreBar({
  label,
  value,
  range,
  decimals = 0,
}: {
  label: string;
  value: number;
  range: [number, number];
  decimals?: number;
}) {
  const [min, max] = range;
  const axisMax = Math.max(max * 1.4, value * 1.1, 1);
  const inRange = value >= min && value <= max;

  const rangeStartPct = (min / axisMax) * 100;
  const rangeWidthPct = ((max - min) / axisMax) * 100;
  const valuePct = Math.min((value / axisMax) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          <span className={inRange ? "font-semibold text-success" : "font-semibold text-warning"}>
            {value.toFixed(decimals)}
          </span>{" "}
          <span className="text-xs">
            (ideal {min}-{max})
          </span>
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <span
          className="absolute top-0 h-full rounded-full bg-success/25"
          style={{ left: `${rangeStartPct}%`, width: `${rangeWidthPct}%` }}
        />
        <span
          className={`absolute top-0 h-full w-1 rounded-full ${
            inRange ? "bg-success" : "bg-warning"
          }`}
          style={{ left: `calc(${valuePct}% - 2px)` }}
        />
      </div>
    </div>
  );
}
