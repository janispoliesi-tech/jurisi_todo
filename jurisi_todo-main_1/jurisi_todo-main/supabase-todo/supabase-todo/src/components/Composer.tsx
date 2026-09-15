"use client";

import { useRef, useState } from "react";
import { ArrowUp, CalendarDays, X } from "lucide-react";
import { colorValue } from "@/lib/colors";
import { addDays, cn, localToday } from "@/lib/utils";
import type { Category } from "@/lib/types";

type Props = {
  /** Kategorija, kurā nonāks jaunais uzdevums (null = bez kategorijas). */
  category: Category | null;
  onAdd: (title: string, dueDate: string | null) => void;
};

export default function Composer({ category, onAdd }: Props) {
  const [value, setValue] = useState("");
  const [due, setDue] = useState("");
  const [showDate, setShowDate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accent = category ? colorValue(category.color) : "var(--accent)";

  function submit() {
    const title = value.trim();
    if (!title) return;
    onAdd(title, due || null);
    setValue("");
    setDue("");
    setShowDate(false);
    inputRef.current?.focus();
  }

  const placeholder = category
    ? `Jauns uzdevums — ${category.name}`
    : "Jauns uzdevums";

  return (
    <div className="safe-bottom sticky bottom-0 z-30 border-t border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto w-full max-w-3xl px-3 py-2.5 md:px-5 md:py-3">
        {showDate ? (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <input
              type="date"
              aria-label="Termiņš"
              className="field !w-auto !py-1.5 text-[13px]"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setDue(localToday())}
              className="min-h-8 rounded-full border border-line px-2.5 text-[12.5px] text-muted transition hover:text-ink"
            >
              Šodien
            </button>
            <button
              type="button"
              onClick={() => setDue(addDays(localToday(), 1))}
              className="min-h-8 rounded-full border border-line px-2.5 text-[12.5px] text-muted transition hover:text-ink"
            >
              Rīt
            </button>
            <button
              type="button"
              aria-label="Aizvērt termiņa izvēli"
              onClick={() => {
                setShowDate(false);
                setDue("");
              }}
              className="grid size-8 place-items-center rounded-full text-muted transition hover:text-ink"
            >
              <X size={15} />
            </button>
          </div>
        ) : null}

        <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-surface px-1.5 py-1.5 shadow-[var(--shadow-sm)] focus-within:border-[var(--accent)]">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            maxLength={500}
            enterKeyHint="done"
            aria-label={placeholder}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-[15px] outline-none placeholder:text-faint"
          />

          <button
            type="button"
            aria-label="Pievienot termiņu"
            aria-pressed={showDate}
            onClick={() => setShowDate((s) => !s)}
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl transition active:scale-95",
              showDate || due
                ? "bg-surface-2 text-ink"
                : "text-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            <CalendarDays size={17} />
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={!value.trim()}
            aria-label="Pievienot uzdevumu"
            className="grid size-9 shrink-0 place-items-center rounded-xl text-white transition active:scale-95 disabled:opacity-30"
            style={{ background: accent }}
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
