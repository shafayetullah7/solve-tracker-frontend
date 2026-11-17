/** Stored work period: `YYYY-MM/` (ongoing) or `YYYY-MM/YYYY-MM`. Legacy free text is preserved when unparsed. */

export const PROFILE_YEAR_MIN = 1950;

export function profileYearMax(): number {
  return new Date().getFullYear() + 10;
}

const MONTH_TOKEN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isValidMonthToken(value: string): boolean {
  return MONTH_TOKEN.test(value);
}

export function parseWorkPeriod(period?: string): {
  start: string;
  end: string;
  legacy?: string;
} {
  if (!period?.trim()) return { start: "", end: "" };
  const trimmed = period.trim();
  const canonical = /^(\d{4}-\d{2})\/(\d{4}-\d{2})?$/.exec(trimmed);
  if (canonical) {
    const start = canonical[1] ?? "";
    const end = canonical[2] ?? "";
    if (isValidMonthToken(start) && (end === "" || isValidMonthToken(end))) {
      return { start, end };
    }
  }
  return { start: "", end: "", legacy: trimmed };
}

export function formatWorkPeriod(start: string, end: string): string | undefined {
  const startTrim = start.trim();
  const endTrim = end.trim();
  if (!startTrim && !endTrim) return undefined;
  if (!startTrim) return undefined;
  if (!isValidMonthToken(startTrim)) return undefined;
  if (endTrim && !isValidMonthToken(endTrim)) return undefined;
  if (endTrim) return `${startTrim}/${endTrim}`;
  return `${startTrim}/`;
}

export function validateWorkPeriodMonths(
  start: string,
  end: string,
): string | undefined {
  const startTrim = start.trim();
  const endTrim = end.trim();
  if (!startTrim && !endTrim) return undefined;
  if (endTrim && !startTrim) {
    return "Choose a start month when you add an end month.";
  }
  if (startTrim && !isValidMonthToken(startTrim)) {
    return "Start month is invalid.";
  }
  if (endTrim && !isValidMonthToken(endTrim)) {
    return "End month is invalid.";
  }
  if (startTrim && endTrim && endTrim < startTrim) {
    return "End month must be the same as or after the start month.";
  }
  return undefined;
}

const monthYearFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function labelMonth(token: string): string {
  const [year, month] = token.split("-").map(Number);
  return monthYearFormatter.format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatWorkPeriodLabel(period?: string): string | undefined {
  if (!period?.trim()) return undefined;
  const parsed = parseWorkPeriod(period);
  if (parsed.legacy) return parsed.legacy;
  if (!parsed.start) return undefined;
  const startLabel = labelMonth(parsed.start);
  if (!parsed.end) return `${startLabel} – Present`;
  return `${startLabel} – ${labelMonth(parsed.end)}`;
}

export function validateEducationEndYear(raw: string): { value?: string; error?: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { value: undefined };
  if (!/^\d{4}$/.test(trimmed)) {
    return { error: "Enter a four-digit end year." };
  }
  const year = Number(trimmed);
  const max = profileYearMax();
  if (year < PROFILE_YEAR_MIN || year > max) {
    return { error: `Year must be between ${PROFILE_YEAR_MIN} and ${max}.` };
  }
  return { value: trimmed };
}

export function normalizeEducationEndYearInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits;
}