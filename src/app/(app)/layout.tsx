/**
 * Authenticated app layout.
 *
 * Wraps all authenticated routes with sidebar navigation and identity resolution.
 * Server Component — identity is resolved server-side.
 *
 * Visual reference: design/stitch/DESIGN.md, design/stitch/code.html
 *
 * Reference: system-architecture.md §10
 */

import type { Metadata } from "next";
import Link from "next/link";
import { createIdentityModule } from "@/modules/identity/composition-root";
import { redirect } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";

export const metadata: Metadata = {
  title: "Royal Prestige",
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Panel de Control", icon: "⊞" },
  { href: "/visits", label: "Mis Visitas", icon: "◎" },
  { href: "/sales", label: "Mis Ventas", icon: "◇" },
  { href: "/clients", label: "Clientes", icon: "◈", requiresTeam: true },
  { href: "/catalog", label: "Catálogo", icon: "◻" },
  { href: "/training", label: "Capacitación", icon: "◆" },
] as const;

const ADMIN_NAV_ITEMS = [
  { href: "/dashboard", label: "Panel de Control", icon: "⊞" },
  { href: "/employees", label: "Empleados", icon: "◈" },
  { href: "/sales", label: "Ventas", icon: "◇" },
  { href: "/catalog", label: "Catálogo", icon: "◻" },
  { href: "/training", label: "Capacitación", icon: "◆" },
] as const;

const TEAM_NAV_ITEMS = [
  { href: "/team", label: "Resumen del equipo", icon: "◇" },
  { href: "/team/sales", label: "Ventas del equipo", icon: "▱" },
  { href: "/team/visits", label: "Visitas del equipo", icon: "◎" },
] as const;

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  SELLER: "Vendedor",
};

const LEVEL_SHORT: Record<number, string> = {
  1: "Nivel 1",
  2: "Nivel 2",
  3: "Nivel 3",
  4: "Nivel 4",
  5: "Nivel 5",
  6: "Nivel 6",
  7: "Nivel 7",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolveIdentityUseCase } = await createIdentityModule();
  const identity = await resolveIdentityUseCase.execute();

  if (!identity) {
    redirect("/login");
  }

  const roleLabel = ROLE_LABELS[identity.employee.currentLevelId === null ? "ADMIN" : "SELLER"] ?? "";
  const levelShort =
    identity.employee.currentLevelId !== null
      ? (LEVEL_SHORT[identity.employee.currentLevelId] ?? "")
      : null;

  // N3+ have teams (levels 3-7)
  const hasTeam = identity.employee.currentLevelId !== null && identity.employee.currentLevelId >= 3;
  const isAdmin = identity.employee.currentLevelId === null;

  // Choose nav items based on role
  const activeNavItems = isAdmin ? ADMIN_NAV_ITEMS : NAV_ITEMS;

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-50 bg-surface border-b border-outline-variant px-6 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="font-semibold text-lg text-on-surface"
          >
            Royal Prestige
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-on-surface-variant">
            {identity.employee.firstName} {identity.employee.lastName}
          </span>
          <a
            href="/logout"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Salir
          </a>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-surface-container-low border-r border-outline-variant z-40">
          {/* User info */}
          <div className="px-6 py-6">
            <div className="font-semibold text-primary text-base">
              {identity.employee.firstName} {identity.employee.lastName}
            </div>
            <div className="text-on-surface-variant text-xs font-mono-data mt-1 tracking-wider uppercase">
              {levelShort
                ? `${levelShort} ${roleLabel}`
                : roleLabel}
            </div>
          </div>

          {/* Navigation */}
           <SidebarNav items={activeNavItems} teamItems={TEAM_NAV_ITEMS} hasTeam={hasTeam} isAdmin={isAdmin} />
        </aside>

        {/* Mobile navigation (simplified) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-low border-t border-outline-variant z-40 flex justify-around py-2">
          {[...activeNavItems, ...(hasTeam ? TEAM_NAV_ITEMS : [])].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-on-surface text-xs px-3 py-1"
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 md:ml-64 p-6 md:p-8 w-full pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
