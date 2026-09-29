/**
 * AdminSystemOverview — ADMIN system dashboard.
 *
 * Combines system health (audit charts, KPIs, recent activity) with
 * relevant organization information (sales & employee KPI cards).
 *
 * Reference: requirements.md §3.12.1
 */

"use client";

import Link from "next/link";
import { Users, DollarSign, ShieldAlert } from "lucide-react";
import type { SystemOverview } from "@/modules/analytics/domain";
import { MetricCard } from "@/modules/analytics/presentation/components/MetricCard";
import { AuditActivityChart } from "@/modules/analytics/presentation/components/AuditActivityChart";
import { LevelDistributionChart } from "@/modules/analytics/presentation/components/LevelDistributionChart";
import {
  ACTION_LABELS,
  RESULT_BADGE,
  formatAuditDateShort,
  formatAuditTimeShort,
} from "@/modules/audit/presentation/audit-labels";

interface AdminSystemOverviewProps {
  overview: SystemOverview;
  headerTitle: string;
  headerSubtitle: string;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-AR")}`;
}

export function AdminSystemOverview({
  overview,
  headerTitle,
  headerSubtitle,
}: AdminSystemOverviewProps) {
  const { kpis } = overview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-on-surface mb-1">
          {headerTitle}
        </h1>
        <p className="text-on-surface-variant">
          {headerSubtitle}
        </p>
      </header>

      {/* ================================================================ */}
      {/* KPI Cards — System health + Business                              */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Link href="/sales">
          <MetricCard
            label="Ventas Totales"
            value={formatCurrency(kpis.totalSalesAmount)}
            icon={DollarSign}
            variant="secondary"
          />
        </Link>
        <Link href="/sales">
          <MetricCard
            label="Ventas Este Mes"
            value={formatCurrency(kpis.monthSalesAmount)}
            icon={DollarSign}
            variant="primary"
          />
        </Link>
        <Link href="/employees">
          <MetricCard
            label="Empleados Activos"
            value={String(kpis.activeEmployeeCount)}
            icon={Users}
            variant="tertiary"
          />
        </Link>
        <Link href="/audit">
          <MetricCard
            label="Alertas de Auditoría"
            value={String(kpis.dangerousAuditEventCount)}
            icon={ShieldAlert}
          />
        </Link>
      </div>

      {/* ================================================================ */}
      {/* System health — Audit charts                                       */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-surface border border-outline-variant rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-on-surface">
              Actividad de Auditoría
            </h2>
            <span className="text-xs text-on-surface-variant">
              Últimos 7 días
            </span>
          </div>
          <AuditActivityChart data={overview.auditActivity} />
        </div>
        <div className="lg:col-span-4 bg-surface border border-outline-variant rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-on-surface mb-4">
            Ventas por Nivel (mes)
          </h2>
          <LevelDistributionChart data={overview.levelDistribution} />
        </div>
      </div>

      {/* ================================================================ */}
      {/* Recent activity feed                                                */}
      {/* ================================================================ */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
          <h3 className="text-lg font-semibold text-on-surface">
            Actividad Reciente
          </h3>
          <Link
            href="/audit"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
          >
            Ver todo
          </Link>
        </div>

        {overview.recentEvents.length === 0 ? (
          <div className="p-10 text-center text-sm text-on-surface-variant">
            Sin eventos de auditoría registrados todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
<table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center w-[30%]">
                      Evento
                    </th>
                  <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center w-[20%]">
                      Resultado
                    </th>
                  <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center w-[20%]">
                      Fecha
                    </th>
                  <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center w-[30%]">
                      Hora
                    </th>
                </tr>
              </thead>
              <tbody className="text-on-surface-dim">
                {overview.recentEvents.map((event) => (
                  <tr key={event.id} className="table-row">
                    <td className="py-3 px-4 text-center">
                      {ACTION_LABELS[event.action] ?? event.action}
                      <span className="block text-xs text-on-surface-dim font-mono">
                        {event.actorEmail ?? "Sistema"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`shrink-0 badge ${RESULT_BADGE[event.result] ?? "badge-neutral"}`}>
                        {event.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {formatAuditDateShort(event.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {formatAuditTimeShort(event.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}