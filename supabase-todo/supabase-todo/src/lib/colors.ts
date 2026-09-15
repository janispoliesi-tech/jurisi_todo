export type CategoryColor = {
  key: string;
  label: string;
  value: string;
};

/** Atslēgas glabājas datubāzē — nemainīt. */
export const CATEGORY_COLORS: CategoryColor[] = [
  { key: "slate", label: "Pelēka", value: "#64748b" },
  { key: "rose", label: "Sarkana", value: "#f43f5e" },
  { key: "orange", label: "Oranža", value: "#f97316" },
  { key: "amber", label: "Dzintara", value: "#f59e0b" },
  { key: "lime", label: "Laima", value: "#84cc16" },
  { key: "emerald", label: "Zaļa", value: "#10b981" },
  { key: "teal", label: "Tirkīza", value: "#14b8a6" },
  { key: "cyan", label: "Ciāna", value: "#06b6d4" },
  { key: "blue", label: "Zila", value: "#3b82f6" },
  { key: "indigo", label: "Indigo", value: "#6366f1" },
  { key: "violet", label: "Violeta", value: "#8b5cf6" },
  { key: "fuchsia", label: "Fuksija", value: "#d946ef" },
  { key: "pink", label: "Rozā", value: "#ec4899" },
  { key: "brown", label: "Brūna", value: "#a16207" },
];

const COLOR_MAP: Record<string, string> = Object.fromEntries(
  CATEGORY_COLORS.map((c) => [c.key, c.value]),
);

export const DEFAULT_COLOR = "slate";

export function colorValue(key: string | null | undefined): string {
  return (key && COLOR_MAP[key]) || COLOR_MAP[DEFAULT_COLOR];
}

/** Nākamā krāsa pēc kārtas, lai jaunas kategorijas neizskatās vienādas. */
export function suggestColor(usedCount: number): string {
  const palette = CATEGORY_COLORS.filter((c) => c.key !== "slate");
  return palette[usedCount % palette.length].key;
}
