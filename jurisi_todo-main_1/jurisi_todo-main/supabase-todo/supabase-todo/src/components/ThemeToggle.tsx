"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "saraksts-theme";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Gaišs", Icon: Sun },
  { value: "dark", label: "Tumšs", Icon: Moon },
  { value: "system", label: "Sistēmas", Icon: Monitor },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  // Izvēle glabājas pārlūkā, tāpēc to var nolasīt tikai pēc montēšanas.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored === "light" || stored === "dark") setTheme(stored);
    } catch {
      /* privātais režīms — paliek "system" */
    }
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    const root = document.documentElement;
    if (next === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", next);
    }
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignorējam */
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Noformējums"
      className="flex gap-0.5 rounded-xl border border-line bg-surface-2 p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          title={label}
          onClick={() => apply(value)}
          className={cn(
            "flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-[10px] px-2 text-[12.5px] font-medium transition",
            theme === value
              ? "bg-surface text-ink shadow-[var(--shadow-sm)]"
              : "text-muted hover:text-ink",
          )}
        >
          <Icon size={14} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
