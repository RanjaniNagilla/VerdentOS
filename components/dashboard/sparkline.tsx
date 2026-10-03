type Accent = 'emerald' | 'amber' | 'slate';

// SVG gradient <stop> colors can't come from a Tailwind class (Tailwind
// never sees a literal class name to generate), so accents are resolved
// to real hex values here and applied as SVG attributes/inline styles.
const ACCENT_HEX: Record<Accent, string> = {
  emerald: '#34d399',
  amber: '#fbbf24',
  slate: '#94a3b8',
};

interface SparklineProps {
  id: string;
  data: number[];
  accent: Accent;
  height?: number;
}

function buildSmoothPath(points: [number, number][]) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0][0]},${points[0][1]}`;

  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;
    d += ` Q ${x0},${y0} ${midX},${midY}`;
  }
  const [lastX, lastY] = points[points.length - 1];
  d += ` L ${lastX},${lastY}`;
  return d;
}

export function Sparkline({ id, data, accent, height = 32 }: SparklineProps) {
  const width = 100;
  const color = ACCENT_HEX[accent];

  if (data.length < 2) return <div style={{ height }} />;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points: [number, number][] = data.map((value, i) => [
    Number((i * stepX).toFixed(2)),
    Number((height - ((value - min) / range) * height).toFixed(2)),
  ]);

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  const gradientId = `spark-fill-${id}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-8 w-full overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}