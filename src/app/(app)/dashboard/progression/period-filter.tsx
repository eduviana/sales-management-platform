"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatMonthKey } from "@/shared/presentation/format";
import type { ProgressionFilter } from "./progression-display";

interface PeriodFilterProps {
  filter: ProgressionFilter;
  selectedMonth: string;
  availableMonths: string[];
  onFilterChange: (filter: ProgressionFilter) => void;
  onMonthSelect: (month: string) => void;
}

/** Period selector pills (current / all / specific month) with month dropdown. */
export function PeriodFilter({
  filter,
  selectedMonth,
  availableMonths,
  onFilterChange,
  onMonthSelect,
}: PeriodFilterProps) {
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMonthDropdown(false);
      }
    }
    if (showMonthDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMonthDropdown]);

  return (
    <div className="inline-flex p-1 bg-surface-container border border-outline-variant rounded-xl self-start sm:self-auto">
      <button
        onClick={() => onFilterChange("current")}
        className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
          filter === "current"
            ? "bg-primary/20 text-primary shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        Mes actual
      </button>
      <button
        onClick={() => onFilterChange("all")}
        className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
          filter === "all"
            ? "bg-primary/20 text-primary shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        Histórico
      </button>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => {
            onFilterChange("specific");
            setShowMonthDropdown(!showMonthDropdown);
          }}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all inline-flex items-center gap-1.5 ${
            filter === "specific"
              ? "bg-primary/20 text-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          {filter === "specific" && selectedMonth
            ? formatMonthKey(selectedMonth)
            : "Mes específico"}
          <ChevronDown size={12} />
        </button>

        {showMonthDropdown && (
          <div className="absolute right-0 top-full mt-1 z-50 bg-surface-container border border-outline-variant rounded-xl shadow-lg py-1 min-w-[200px] max-h-[280px] overflow-y-auto">
            {availableMonths.map((m) => (
              <button
                key={m}
                onClick={() => {
                  onMonthSelect(m);
                  onFilterChange("specific");
                  setShowMonthDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                  selectedMonth === m
                    ? "bg-surface-container-high text-on-surface font-medium"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                {formatMonthKey(m)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
