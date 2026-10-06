/**
 * Date and time formatting helpers for the presentation layer.
 *
 * Every value is formatted for the `es-AR` locale. Functions accept `Date` or
 * ISO-compatible strings so they can be used from Server and Client Components
 * alike. This module must not depend on `modules/` or infrastructure.
 *
 * Reference: ADR-019
 */

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  ...DATE_OPTIONS,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

const DATE_TIME_SECONDS_OPTIONS: Intl.DateTimeFormatOptions = {
  ...DATE_TIME_OPTIONS,
  second: "2-digit",
};

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Formats a date as `dd/mm/aaaa` (es-AR). */
export function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", DATE_OPTIONS).format(toDate(value));
}

/**
 * Formats a calendar-day value as `dd/mm/aaaa` (es-AR) pinning the UTC
 * timezone, so the day is never shifted by the browser's local timezone.
 * Use it for date-only records (scheduled dates, completed dates).
 */
export function formatDateOnly(value: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", {
    ...DATE_OPTIONS,
    timeZone: "UTC",
  }).format(toDate(value));
}

/** Formats a date and time as `dd/mm/aaaa HH:mm` in 24-hour format (es-AR). */
export function formatDateTime(value: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", DATE_TIME_OPTIONS).format(
    toDate(value),
  );
}

/**
 * Formats a date and time including seconds as `dd/mm/aaaa HH:mm:ss` (es-AR).
 * Used for audit trails where the exact instant matters.
 */
export function formatDateTimeWithSeconds(value: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", DATE_TIME_SECONDS_OPTIONS).format(
    toDate(value),
  );
}

/** Formats a time as `HH:mm` in 24-hour format (es-AR). */
export function formatTime(value: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", TIME_OPTIONS).format(toDate(value));
}

/** Formats a month and year as `septiembre de 2026` (es-AR). */
export function formatMonthYear(value: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(toDate(value));
}

/**
 * Formats a `YYYY-MM` month key as `septiembre de 2026` (es-AR).
 * Returns the original key when it does not match the expected shape.
 */
export function formatMonthKey(key: string): string {
  const [year, month] = key.split("-");
  const yearNumber = Number.parseInt(year, 10);
  const monthNumber = Number.parseInt(month, 10);

  if (
    !Number.isInteger(yearNumber) ||
    !Number.isInteger(monthNumber) ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    return key;
  }

  return formatMonthYear(new Date(yearNumber, monthNumber - 1));
}
