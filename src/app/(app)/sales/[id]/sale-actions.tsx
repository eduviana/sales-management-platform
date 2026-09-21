"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  submitSaleForReview,
  approveSale,
  rejectSaleWithReason,
  cancelSale,
} from "@/modules/sales/presentation/sale-actions";
import type { SaleStatus } from "@/modules/sales/domain";

interface SaleActionsProps {
  saleId: string;
  status: SaleStatus;
  isOwner: boolean;
  canReview: boolean;
}

export function SaleActions({
  saleId,
  status,
  isOwner,
  canReview,
}: SaleActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: () => Promise<{ error: string | null }>) => {
    setLoading(true);
    setError(null);
    const result = await action();
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Acciones</h2>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {/* Owner actions */}
        {isOwner && status === "DRAFT" && (
          <>
            <button
              onClick={() =>
                handleAction(() => submitSaleForReview(saleId))
              }
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm disabled:opacity-50"
            >
              Enviar a revisión
            </button>
            <button
              onClick={() => router.push(`/sales/${saleId}/edit`)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant transition-colors disabled:opacity-50"
            >
              Editar
            </button>
          </>
        )}

        {isOwner && status === "REJECTED" && (
          <button
            onClick={() => router.push(`/sales/${saleId}/edit`)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm disabled:opacity-50"
          >
            Corregir y reenviar
          </button>
        )}

        {/* Reviewer actions */}
        {canReview && status === "PENDING_REVIEW" && (
          <>
            <button
              onClick={() => handleAction(() => approveSale(saleId))}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm disabled:opacity-50"
            >
              Aprobar Venta
            </button>
            <RejectButton saleId={saleId} onAction={handleAction} loading={loading} />
          </>
        )}

        {/* Cancel action — owner or reviewer for APPROVED sales */}
        {status === "APPROVED" && (isOwner || canReview) && (
          <button
            onClick={() => {
              if (confirm("¿Estás seguro de que deseas cancelar esta venta?")) {
                handleAction(() => cancelSale(saleId));
              }
            }}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors ml-auto disabled:opacity-50"
          >
            Rechazar / Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

function RejectButton({
  saleId,
  onAction,
  loading,
}: {
  saleId: string;
  onAction: (action: () => Promise<{ error: string | null }>) => void;
  loading: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onAction(() => rejectSaleWithReason(saleId, reason));
    setShowForm(false);
    setReason("");
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
      >
        Rechazar
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo del rechazo (requerido)"
        rows={2}
        className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading || !reason.trim()}
          className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm disabled:opacity-50"
        >
          Confirmar rechazo
        </button>
        <button
          onClick={() => {
            setShowForm(false);
            setReason("");
          }}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
