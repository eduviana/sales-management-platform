"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: string;
  readonly requiresTeam?: boolean;
}

export function SidebarNav({
  items,
  teamItems,
  hasTeam,
  isAdmin: _isAdmin, // eslint-disable-line @typescript-eslint/no-unused-vars
}: {
  items: readonly NavItem[];
  teamItems: readonly NavItem[];
  hasTeam: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const isTeamRoute = teamItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const [teamOpen, setTeamOpen] = useState(isTeamRoute);

  const renderItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-2 px-4 py-2 transition-all rounded-lg text-sm ${
          isActive
            ? "bg-[#00d084] text-[#0a1b12] font-semibold"
            : "text-on-surface-variant hover:text-on-surface hover:bg-[#1e1e22]"
        }`}
      >
        <span className="text-base">{item.icon}</span>
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="flex-1 space-y-1 px-2">
      {items.filter((item) => !item.requiresTeam || hasTeam).map(renderItem)}
      {hasTeam && (
        <div className="pt-2">
          <button
            type="button"
            aria-expanded={teamOpen}
            onClick={() => setTeamOpen((open) => !open)}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2 transition-all rounded-lg text-sm ${
              isTeamRoute
                ? "text-on-surface font-semibold"
                : "text-on-surface-variant hover:text-on-surface hover:bg-[#1e1e22]"
            }`}
          >
            <span className="flex items-center gap-2"><span className="text-base">◇</span>Mi Equipo</span>
            <span className="text-xs">{teamOpen ? "▾" : "▸"}</span>
          </button>
          {teamOpen && <div className="ml-3 space-y-1 border-l border-outline-variant pl-2">{teamItems.map(renderItem)}</div>}
        </div>
      )}
    </nav>
  );
}
