export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const MONTHS_SHORT = [
  "jan.",
  "feb.",
  "mar.",
  "apr.",
  "mai.",
  "jūn.",
  "jūl.",
  "aug.",
  "sep.",
  "okt.",
  "nov.",
  "dec.",
];

/** "YYYY-MM-DD" → vietējā datuma virkne bez laika joslas atkarības. */
export function formatDate(iso: string, currentYear?: string) {
  const date = iso.slice(0, 10);
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  const day = String(Number(d));
  const month = MONTHS_SHORT[Number(m) - 1] ?? m;
  return currentYear && y === currentYear
    ? `${day}. ${month}`
    : `${day}. ${month} ${y}`;
}

/** Šodienas datums "YYYY-MM-DD" lietotāja laika joslā. */
export function localToday() {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

export function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`;
}

export type DueState = "overdue" | "today" | "soon" | "later";

export function dueInfo(
  due: string,
  today: string | null,
): { label: string; state: DueState } {
  if (!today) return { label: formatDate(due), state: "later" };
  const year = today.slice(0, 4);
  if (due < today) {
    const daysAgo = daysBetween(due, today);
    return {
      label: daysAgo === 1 ? "Vakar" : formatDate(due, year),
      state: "overdue",
    };
  }
  if (due === today) return { label: "Šodien", state: "today" };
  if (due === addDays(today, 1)) return { label: "Rīt", state: "soon" };
  if (due <= addDays(today, 6))
    return { label: formatDate(due, year), state: "soon" };
  return { label: formatDate(due, year), state: "later" };
}

export function daysBetween(from: string, to: string) {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Arhīva ieraksta laiks — "Šodien", "Vakar" vai datums. */
export function archivedLabel(iso: string | null, today: string | null) {
  if (!iso) return "";
  const date = iso.slice(0, 10);
  if (!today) return formatDate(date);
  const year = today.slice(0, 4);
  if (date === today) return "Šodien";
  if (date === addDays(today, -1)) return "Vakar";
  return formatDate(date, year);
}

/** Vienskaitlis / daudzskaitlis latviešu valodā. */
export function plural(n: number, one: string, many: string, zero?: string) {
  const mod100 = Math.abs(n) % 100;
  const mod10 = Math.abs(n) % 10;
  if (n === 0) return zero ?? many;
  if (mod10 === 1 && mod100 !== 11) return one;
  return many;
}

export function taskCountLabel(n: number) {
  return `${n} ${plural(n, "uzdevums", "uzdevumi", "uzdevumu")}`;
}

/** Vienkāršs unikāls ID optimistiskajiem ierakstiem. */
export function tempId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tmp-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}
