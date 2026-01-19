"use client";

import * as React from "react";

type LineChartProps = {
  title: string;
  data: { label: string; value: number }[];
  yLabel: string;
  xLabel?: string;
  height?: number;
};

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export default function LineChart({ title, data, yLabel, xLabel = "Day", height = 300 }: LineChartProps) {
  const width = 640;
  const paddingLeft = 56;
  const paddingRight = 18;
  const paddingTop = 18;
  const paddingBottom = 48;
  const maxValue = Math.max(1, ...data.map((point) => point.value));
  const tickCount = 4;
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const xPositions = data.map((_, index) => {
    return (
      paddingLeft +
      (index / Math.max(data.length - 1, 1)) * (width - paddingLeft - paddingRight)
    );
  });
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => {
    const value = (maxValue / tickCount) * (tickCount - index);
    const y =
      paddingTop + (index / tickCount) * (height - paddingTop - paddingBottom);
    return { value, y };
  });

  const points = data.map((point, index) => {
    const x = xPositions[index];
    const y =
      height -
      paddingBottom -
      (point.value / maxValue) * (height - paddingTop - paddingBottom);
    return `${x},${y}`;
  });

  const pointCoords = points.map((point) => {
    const [x, y] = point.split(",").map(Number);
    return { x, y };
  });

  const xTickIndexes = React.useMemo(() => {
    if (data.length <= 6) {
      return data.map((_, index) => index);
    }
    const indexes = new Set<number>([0, data.length - 1]);
    const step = Math.ceil((data.length - 1) / 4);
    for (let i = step; i < data.length - 1; i += step) {
      indexes.add(i);
    }
    return Array.from(indexes).sort((a, b) => a - b);
  }, [data.length]);

  return (
    <div className="relative rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[color:var(--ink)]">{title}</h3>
        <span className="text-xs text-[color:var(--ink-muted)]">
          max {numberFormat.format(maxValue)}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={height - paddingBottom}
          stroke="var(--stroke)"
          strokeWidth="1"
        />
        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="var(--stroke)"
          strokeWidth="1"
        />
        {ticks.map((tick) => (
          <g key={`tick-${tick.value}`}>
            <line
              x1={paddingLeft}
              y1={tick.y}
              x2={width - paddingRight}
              y2={tick.y}
              stroke="var(--paper-strong)"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 8}
              y={tick.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--ink-muted)"
            >
              {numberFormat.format(tick.value)}
            </text>
          </g>
        ))}
        {xTickIndexes.map((index) => (
          <text
            key={`x-tick-${index}`}
            x={xPositions[index]}
            y={height - paddingBottom + 18}
            textAnchor="middle"
            fontSize="10"
            fill="var(--ink-muted)"
          >
            {data[index]?.label}
          </text>
        ))}
        <polyline
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.join(" ")}
        />
        {pointCoords.map((point, index) => {
          const isActive = hoveredIndex === index;
          return (
            <circle
              key={`${title}-${index}`}
              cx={point.x}
              cy={point.y}
              r={isActive ? "4" : "2.5"}
              fill={isActive ? "var(--accent)" : "rgba(22,163,74,0.35)"}
            />
          );
        })}
        {hoveredIndex !== null ? (
          <line
            x1={pointCoords[hoveredIndex].x}
            y1={paddingTop}
            x2={pointCoords[hoveredIndex].x}
            y2={height - paddingBottom}
            stroke="rgba(22,163,74,0.35)"
            strokeDasharray="4 4"
          />
        ) : null}
        <text
          x={paddingLeft - 28}
          y={paddingTop}
          textAnchor="middle"
          fontSize="10"
          fill="var(--ink-muted)"
          transform={`rotate(-90 ${paddingLeft - 28} ${paddingTop})`}
        >
          {yLabel}
        </text>
        <text
          x={(width + paddingLeft - paddingRight) / 2}
          y={height - 6}
          textAnchor="middle"
          fontSize="10"
          fill="var(--ink-muted)"
        >
          {xLabel}
        </text>
        {pointCoords.map((point, index) => (
          <rect
            key={`hover-${title}-${index}`}
            x={point.x - 10}
            y={paddingTop}
            width="20"
            height={height - paddingTop - paddingBottom}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </svg>
      {hoveredIndex !== null ? (
        <div
          className="pointer-events-none absolute rounded-xl border border-[color:var(--stroke)] bg-white px-3 py-2 text-xs text-[color:var(--ink)] shadow-lg"
          style={{
            left: `${(pointCoords[hoveredIndex].x / width) * 100}%`,
            top: `${(pointCoords[hoveredIndex].y / height) * 100}%`,
            transform: "translate(-50%, -120%)"
          }}
        >
          <div className="text-[color:var(--ink-muted)]">{data[hoveredIndex]?.label}</div>
          <div className="font-semibold">
            {numberFormat.format(data[hoveredIndex]?.value ?? 0)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
