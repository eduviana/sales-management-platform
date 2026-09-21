"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  label: string;
  action: (formData: FormData) => Promise<void>;
  id: string;
}

export function DeleteButton({ label, action, id }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", id);
      await action(formData);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-label-sm text-error hover:text-error/80 transition-colors disabled:opacity-50"
    >
      {isPending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
