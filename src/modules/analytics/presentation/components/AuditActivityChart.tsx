/**
 * AuditActivityChart — Stacked bar chart of audit events per day.
 *
 * Shows SUCCESS / FAILURE / DENIED stacked per day (last 7 days).
 * Follows the Stitch design system colors.
 *
 * Reference: design/stitch/code.html, DESIGN.md
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AuditActivityPoint } from "../../domain";

const SERIES = [
  { key: "success", name: "Éxitos", color: "#4edea3" },
  { key: "denied", name: "Denegados", color: "#ffb95f" },
  { key: "failure", name: "Fallos", color: "#ffb4ab" },
] as const;

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; dataKey: string; payload: AuditActivityPoint }>;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  return (
    <div className="bg-surface-container-highest text-on-surface text-xs py-1.5 px-2.5 rounded shadow-lg space-y-0.5">
      <div className="font-semibold text-on-surface-variant mb-1">{point.date}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="opacity-80">{entry.name}:</span>
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-0.5 border-t border-outline-variant mt-1">
        <span className="opacity-80">Total:</span>
        <span className="font-semibold">{point.success + point.failure + point.denied}</span>
      </div>
    </div>
  );
}

function CustomLegend({ payload }: {
  payload?: Array<{ value: string; color: string }>;
}) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-6 pt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span className="text-sm text-on-surface-variant">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function AuditActivityChart({ data }: { data: AuditActivityPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-on-surface-variant text-sm">
        Sin eventos en el período seleccionado
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.success + d.failure + d.denied), 5);
  const yTop = Math.max(Math.ceil(maxValue / 5) * 5, 5);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: "#c2c6d6", fontSize: 11 }}
          axisLine={{ stroke: "#424754" }}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tick={{ fill: "#c2c6d6", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={[0, yTop]}
          allowDecimals={false}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Legend content={<CustomLegend />} />
        {SERIES.map((series, index) => (
          <Bar
            key={series.key}
            dataKey={series.key}
            name={series.name}
            stackId="audit"
            fill={series.color}
            radius={index === SERIES.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
            maxBarSize={40}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}