// Currency + misc formatting. Money is whole BDT (taka).

export const CURRENCY = "৳";

export function formatTaka(amount: number): string {
  const n = Math.round(amount || 0);
  return `${CURRENCY}${n.toLocaleString("en-BD")}`;
}

export function discountedPrice(price: number, discountPercent: number): number {
  const pct = Math.max(0, Math.min(100, discountPercent || 0));
  if (pct === 0) return price;
  return Math.round(price * (1 - pct / 100));
}

// ---- Dates (stored/handled as UTC yyyy-mm-dd to avoid timezone drift) ----

/** Format an ISO date string ("2026-06-21") as "21 Jun 2026". */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "2026-06" -> "Jun 2026" (for grouped/monthly reporting). */
export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Today as an ISO date string in UTC ("2026-06-21"). */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
