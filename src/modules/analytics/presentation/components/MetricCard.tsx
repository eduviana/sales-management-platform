/**
 * MetricCard — KPI card for the dashboard.
 *
 * Displays a single metric with label, value, icon, optional subtitle, and optional progress bar.
 * Follows the Stitch design system.
 *
 * Reference: design/stitch/code.html, DESIGN.md
 *
 * Typography from Stitch:
 * - Label: text-body-sm (14px) + font-label-md (JetBrains Mono 12px)
 * - Value: text-headline-md (24px bold)
 * - Spacing: p-lg (24px padding)
 */

import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "secondary" | "tertiary";
  subtitle?: string;
  progress?: number; // 0–100, shows progress bar when provided
  progressLabel?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  subtitle,
  progress,
  progressLabel,
}: MetricCardProps) {
  const containerBg = variant === "primary"
    ? "bg-surface-container-high"
    : "bg-surface";

  const valueColor = variant === "primary"
    ? "text-[#ffb95f]"
    : variant === "secondary"
      ? "text-secondary"
      : "text-on-surface";

  const iconColor = variant === "secondary"
    ? "text-secondary"
    : variant === "tertiary"
      ? "text-tertiary"
      : "text-primary";

  return (
    <div className={`${containerBg} rounded-xl border border-outline-variant p-6 flex flex-col justify-between h-full`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-mono text-on-surface-variant uppercase tracking-wider leading-tight">
            {label}
          </span>
          <Icon className={`${iconColor}`} size={22} strokeWidth={2} />
        </div>
        <div className={`text-2xl font-bold ${valueColor} mb-1 whitespace-nowrap`}>
          {value}
        </div>
        {subtitle && (
          <div className="text-sm text-on-surface-variant mt-1">
            {subtitle}
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-3">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: "#a5c8ff" }}
          />
        </div>
      )}

      {progressLabel && (
        <div className="flex items-center gap-2 text-sm font-mono mt-3">
          <span className="text-on-surface-variant px-2 py-0.5 rounded-full flex items-center gap-1">
            {progressLabel}
          </span>
        </div>
      )}
    </div>
  );
}
