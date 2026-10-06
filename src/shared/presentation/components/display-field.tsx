/**
 * DisplayField — read-only label/value pair for detail pages.
 *
 * Renders a small uppercase label above a value, optionally in monospace for
 * identifiers and numeric data. Contains no business logic.
 *
 * Reference: ADR-019
 */

interface DisplayFieldProps {
  label: string;
  value: string;
  mono?: boolean;
}

export function DisplayField({ label, value, mono = false }: DisplayFieldProps) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-on-surface text-base ${mono ? "font-mono" : "font-medium"}`}
      >
        {value}
      </p>
    </div>
  );
}
