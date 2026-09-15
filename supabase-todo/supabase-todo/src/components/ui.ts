/** Kopīgas pogu klases, lai stils būtu vienāds visā aplikācijā. */

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 min-h-10 text-[14px] font-medium " +
  "transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none";

export const btnPrimary =
  `${base} bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[var(--shadow-sm)] hover:brightness-110`;

export const btnSubtle =
  `${base} border border-line bg-surface text-ink hover:bg-surface-2`;

export const btnGhost = `${base} text-muted hover:bg-surface-2 hover:text-ink`;

export const btnDanger =
  `${base} border border-transparent bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] text-[var(--danger)] hover:bg-[color-mix(in_oklab,var(--danger)_22%,transparent)]`;

export const iconBtn =
  "grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink active:scale-95";

export const card =
  "rounded-2xl border border-line bg-surface shadow-[var(--shadow-sm)]";
