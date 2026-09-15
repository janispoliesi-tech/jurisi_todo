"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import Sheet from "./Sheet";
import { btnDanger, btnPrimary, btnSubtle } from "./ui";
import { ICON_GROUPS, getIcon } from "@/lib/icons";
import { CATEGORY_COLORS, colorValue } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export type CategoryDraft = {
  name: string;
  icon: string;
  color: string;
};

type Props = {
  /** Ja padots — rediģēšanas režīms. */
  category?: Category | null;
  /** Ieteiktā krāsa jaunai kategorijai. */
  defaultColor?: string;
  existingNames: string[];
  onClose: () => void;
  onSave: (draft: CategoryDraft) => void;
  onDelete?: () => void;
};

/**
 * Komponente tiek montēta no jauna katrai kategorijai (skat. `key` vecākā),
 * tāpēc sākuma vērtības var ņemt tieši no props — bez sinhronizēšanas efekta.
 */
export default function CategorySheet({
  category,
  defaultColor = "blue",
  existingNames,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "list");
  const [color, setColor] = useState(category?.color ?? defaultColor);
  const [iconQuery, setIconQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const groups = useMemo(() => {
    const q = iconQuery.trim().toLowerCase();
    if (!q) return ICON_GROUPS;
    return ICON_GROUPS.map((g) => ({
      ...g,
      icons: g.icons.filter(
        (i) =>
          i.label.toLowerCase().includes(q) || i.key.toLowerCase().includes(q),
      ),
    })).filter((g) => g.icons.length > 0);
  }, [iconQuery]);

  const Preview = getIcon(icon);
  const previewColor = colorValue(color);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Ievadi kategorijas nosaukumu.");
      return;
    }
    if (trimmed.length > 40) {
      setError("Nosaukums nedrīkst būt garāks par 40 rakstzīmēm.");
      return;
    }
    const clash = existingNames.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase(),
    );
    if (clash) {
      setError("Tāda kategorija jau ir.");
      return;
    }
    onSave({ name: trimmed, icon, color });
  }

  return (
    <Sheet
      open
      onClose={onClose}
      wide
      title={category ? "Rediģēt kategoriju" : "Jauna kategorija"}
      description="Nosaukums, ikona un krāsa."
      footer={
        <>
          {onDelete ? (
            <button
              type="button"
              className={cn(btnDanger, "mr-auto")}
              onClick={onDelete}
            >
              Dzēst
            </button>
          ) : null}
          <button type="button" className={btnSubtle} onClick={onClose}>
            Atcelt
          </button>
          <button type="button" className={btnPrimary} onClick={submit}>
            {category ? "Saglabāt" : "Pievienot"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Priekšskatījums + nosaukums */}
        <div className="flex items-center gap-3">
          <div
            className="cat-tint grid size-12 shrink-0 place-items-center rounded-2xl"
            style={{ ["--cat" as string]: previewColor }}
          >
            <Preview
              size={22}
              className="cat-text"
              style={{ ["--cat" as string]: previewColor }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <label
              htmlFor="cat-name"
              className="mb-1 block text-[13px] font-medium text-muted"
            >
              Nosaukums
            </label>
            <input
              id="cat-name"
              data-autofocus
              className="field"
              value={name}
              maxLength={40}
              placeholder="piem. Dārzs"
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
            />
          </div>
        </div>

        {error ? (
          <p className="text-[13px] text-[var(--danger)]">{error}</p>
        ) : null}

        {/* Krāsa */}
        <div>
          <p className="mb-2 text-[13px] font-medium text-muted">Krāsa</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-label={c.label}
                aria-pressed={color === c.key}
                onClick={() => setColor(c.key)}
                className={cn(
                  "grid size-9 place-items-center rounded-full transition active:scale-95",
                  color === c.key
                    ? "ring-2 ring-offset-2 ring-offset-[var(--surface)]"
                    : "hover:scale-105",
                )}
                style={{
                  background: c.value,
                  ["--tw-ring-color" as string]: c.value,
                }}
              >
                {color === c.key ? (
                  <Check size={16} className="text-white" strokeWidth={3} />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Ikonas */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[13px] font-medium text-muted">Ikona</p>
            <div className="relative w-40">
              <Search
                size={15}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
              />
              <input
                className="field !py-1.5 !pl-8 text-[13px]"
                placeholder="Meklēt…"
                value={iconQuery}
                onChange={(e) => setIconQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="thin-scrollbar max-h-64 overflow-y-auto rounded-xl border border-line bg-surface-2 p-2">
            {groups.length === 0 ? (
              <p className="px-2 py-6 text-center text-[13px] text-muted">
                Nekas neatbilst meklējumam.
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="mb-3 last:mb-0">
                  <p className="px-1.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1">
                    {group.icons.map(({ key, label, Icon }) => {
                      const selected = icon === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          title={label}
                          aria-label={label}
                          aria-pressed={selected}
                          onClick={() => setIcon(key)}
                          className={cn(
                            "grid aspect-square place-items-center rounded-lg transition active:scale-95",
                            selected
                              ? "text-white shadow-[var(--shadow-sm)]"
                              : "text-muted hover:bg-surface hover:text-ink",
                          )}
                          style={
                            selected ? { background: previewColor } : undefined
                          }
                        >
                          <Icon size={19} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
