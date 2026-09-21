/**
 * Logout handler — Client Component.
 *
 * Calls the logout Server Action on mount.
 */

"use client";

import { useEffect } from "react";
import { logoutAction } from "@/modules/identity/presentation/logout-action";

export function LogoutHandler() {
  useEffect(() => {
    logoutAction();
  }, []);

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      Cerrando sesión...
    </p>
  );
}
