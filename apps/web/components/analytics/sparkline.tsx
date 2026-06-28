"use client";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  showDots?: boolean;
  ariaLabel?: string;
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "currentColor",
  fillOpacity = 0.12,
  showDots = false,
  ariaLabel = "Wykres trendu",
}: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <svg width={width} height={height} aria-label={ariaLabel} role="img">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeDasharray="2 2"
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return { x, y };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  const trend = data[data.length - 1] - data[0];
  const trendLabel = trend > 0 ? "rosnący" : trend < 0 ? "malejący" : "stabilny";

  return (
    <svg
      width={width}
      height={height}
      aria-label={`${ariaLabel}: trend ${trendLabel}`}
      role="img"
      style={{ color }}
    >
      <path d={fillPath} fill={color} fillOpacity={fillOpacity} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {showDots &&
        points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.5} fill={color} />
        ))}
    </svg>
  );
}
