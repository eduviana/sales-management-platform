/**
 * Logout page.
 *
 * Triggers the logout action on mount.
 * Phase 2 — deliberately simple.
 */

import { LogoutHandler } from "./logout-handler";

export default function LogoutPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <LogoutHandler />
    </div>
  );
}
