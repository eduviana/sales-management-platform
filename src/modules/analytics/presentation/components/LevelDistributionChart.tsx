/**
 * LevelDistributionChart — Donut chart for sales distribution by level.
 *
 * Uses Recharts PieChart with custom colors following the Stitch palette.
 *
 * Reference: design/stitch/code.html
 */

"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { LevelDistribution } from "../../domain";

const COLORS = [
  "#4d8eff", // primary-container (blue)
  "#ca8100", // tertiary-container (amber)
  "#00a572", // secondary-container (green)
  "#93000a", // error-container (red)
  "#adc6ff", // primary-fixed-dim
  "#4edea3", // secondary-fixed-dim
  "#ffb95f", // tertiary-fixed-dim
];

interface LevelDistributionChartProps {
  data: LevelDistribution[];
}

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { percentage: number } }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-surface-container-highest text-on-surface text-xs py-1 px-2 rounded">
      {payload[0].name}: ${payload[0].value.toLocaleString("es-AR")} ({payload[0].payload.percentage}%)
    </div>
  );
}

export function LevelDistributionChart({ data }: LevelDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-on-surface-variant text-sm">
        Sin datos para el período seleccionado
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="levelCode"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {data.map((entry, index) => (
          <div key={entry.levelCode} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-on-surface-variant">
              {entry.levelCode} ({entry.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
