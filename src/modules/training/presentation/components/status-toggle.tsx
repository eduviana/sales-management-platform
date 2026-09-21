"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  publishTrainingContentAction,
  archiveTrainingContentAction,
} from "../training-actions";
import type { ContentStatus } from "../../domain";

interface StatusToggleProps {
  contentType: "course" | "material";
  contentId: string;
  currentStatus: ContentStatus;
}

const STATUS_CONFIG: Record<ContentStatus, { label: string; className: string; nextAction: "publish" | "archive" | null; nextLabel: string }> = {
  DRAFT: {
    label: "Borrador",
    className: "bg-yellow-900/30 text-yellow-400",
    nextAction: "publish",
    nextLabel: "Publicar",
  },
  PUBLISHED: {
    label: "Publicado",
    className: "bg-green-900/30 text-green-400",
    nextAction: "archive",
    nextLabel: "Archivar",
  },
  ARCHIVED: {
    label: "Archivado",
    className: "bg-gray-900/30 text-gray-400",
    nextAction: "publish",
    nextLabel: "Reactivar",
  },
};

export function StatusToggle({ contentType, contentId, currentStatus }: StatusToggleProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const config = STATUS_CONFIG[currentStatus];

  function handleToggle() {
    startTransition(async () => {
      if (config.nextAction === "publish") {
        await publishTrainingContentAction(contentType, contentId);
      } else if (config.nextAction === "archive") {
        await archiveTrainingContentAction(contentType, contentId);
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`badge text-xs ${config.className}`}>
        {config.label}
      </span>
      {config.nextAction && (
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="text-label-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          {isPending ? "..." : config.nextLabel}
        </button>
      )}
    </div>
  );
}
