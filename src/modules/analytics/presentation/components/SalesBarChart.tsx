/**
 * SalesBarChart — Daily sales bar chart using Recharts.
 *
 * Displays daily sales as bars with an optional reference line for the target.
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
import { formatCurrency } from "@/shared/presentation/format";
import type { DailySalesBar } from "../../domain";

interface SalesBarChartProps {
  data: DailySalesBar[];
  targetAmount?: number;
}

/** Compact currency label for the Y axis (e.g. `$12k`, `$1.5M`). */
function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value}`;
}

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-surface-container-highest text-on-surface text-xs py-1 px-2 rounded">
      {formatCurrency(payload[0].value)}
    </div>
  );
}

export function SalesBarChart({ data, targetAmount }: SalesBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-on-surface-variant text-sm">
        Sin datos para el período seleccionado
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.amount), targetAmount ?? 0);

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
          domain={[0, maxValue * 1.15]}
          allowDecimals={false}
          tickFormatter={formatCompactCurrency}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        {targetAmount !== undefined && targetAmount > 0 && (
          <ReferenceLine
            y={targetAmount}
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
          dataKey="amount"
          fill="#a5c8ff"
          radius={[2, 2, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
