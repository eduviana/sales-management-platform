/**
 * MonthlySalesChart — Bar chart showing monthly sale counts (N1/N2).
 *
 * Displays number of sales per month with an optional target reference line.
 * Follows the Stitch design system colors.
 *
 * Reference: design/stitch/code.html
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { DailySaleCount } from "../../domain";

interface MonthlySalesChartProps {
  data: DailySaleCount[];
  targetCount?: number;
}

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
}) {
  if (!active || !payload?.length) return null;

  const count = payload[0].value;
  return (
    <div className="bg-surface-container-highest text-on-surface text-xs py-1 px-2 rounded">
      {count} {count === 1 ? "venta" : "ventas"}
    </div>
  );
}

export function MonthlySalesChart({ data, targetCount }: MonthlySalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-on-surface-variant text-sm">
        Sin datos para el período seleccionado
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.count), targetCount ?? 0);
  const yTop = Math.max(Math.ceil(maxValue / 5) * 5, 20);
  const yTicks = Array.from({ length: Math.ceil(yTop / 5) + 1 }, (_, i) => i * 5);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 60, bottom: 5, left: 10 }}>
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
          ticks={yTicks}
          allowDecimals={false}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        {targetCount !== undefined && targetCount > 0 && (
          <ReferenceLine
            y={targetCount}
            stroke="#ffb95f"
            strokeDasharray="6 4"
            strokeWidth={2}
            label={{
              value: "Objetivo",
              position: "right",
              fill: "#ffb95f",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
        )}
        <Bar
          dataKey="count"
          fill="#a5c8ff"
          radius={[2, 2, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
