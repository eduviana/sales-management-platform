/**
 * SectionCard — bordered container with an icon, a title and arbitrary content.
 *
 * Shared by read-only detail pages (sales, visits, training) so their section
 * layout stays consistent. Contains no business logic.
 *
 * Reference: ADR-019
 */

import type { ReactNode } from "react";

interface SectionCardProps {
  icon: ReactNode;
  accent: string;
  title: string;
  className?: string;
  children: ReactNode;
}

export function SectionCard({
  icon,
  accent,
  title,
  className = "",
  children,
}: SectionCardProps) {
  return (
    <section
      className={`bg-surface-container border border-outline-variant rounded-2xl p-7 ${className}`}
    >
      <div className="flex items-center gap-2.5 mb-6">
        <div className={`p-2 rounded-lg ${accent}`}>{icon}</div>
        <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
