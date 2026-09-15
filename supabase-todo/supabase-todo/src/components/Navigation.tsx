"use client";

import { useEffect, useRef } from "react";
import { Pencil, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/lib/types";

export type NavItem = {
  id: ViewId;
  label: string;
  Icon: LucideIcon;
  color: string;
  count: number;
  /** Īsta kategorija (var rediģēt), nevis "Visi" / "Arhīvs". */
  editable: boolean;
};

/* ------------------------------------------------------------------ */
/* Mobilā sloksne — ritināma uz sāniem                                 */
/* ------------------------------------------------------------------ */

export function CategoryRail({
  items,
  active,
  onSelect,
  onAdd,
}: {
  items: NavItem[];
  active: ViewId;
  onSelect: (id: ViewId) => void;
  onAdd: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const el = refs.current[active];
    const box = scroller.current;
    if (!el || !box) return;
    const target = el.offsetLeft - (box.clientWidth - el.clientWidth) / 2;
    box.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [active]);

  return (
    <div className="flex items-stretch border-b border-line bg-surface/85 backdrop-blur-md md:hidden">
      <div
        ref={scroller}
        role="tablist"
        aria-label="Kategorijas"
        className="no-scrollbar edge-fade flex snap-x snap-proximity gap-1.5 overflow-x-auto px-3 py-2.5"
      >
        {items.map((item) => {
          const selected = item.id === active;
          const { Icon } = item;
          return (
            <button
              key={item.id}
              ref={(node) => {
                refs.current[item.id] = node;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelect(item.id)}
              style={{ ["--cat" as string]: item.color }}
              className={cn(
                "flex min-h-10 snap-start items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition active:scale-[0.97]",
                selected
                  ? "cat-solid shadow-[var(--shadow-sm)]"
                  : "cat-tint cat-text",
              )}
            >
              <Icon size={17} className="shrink-0" />
              <span>{item.label}</span>
              {item.count > 0 ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums",
                    selected ? "bg-white/25 text-white" : "chip-count",
                  )}
                >
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center border-l border-line px-2">
        <button
          type="button"
          onClick={onAdd}
          aria-label="Pievienot kategoriju"
          title="Pievienot kategoriju"
          className="grid size-10 place-items-center rounded-full bg-surface-2 text-muted transition hover:text-ink active:scale-95"
        >
          <Plus size={19} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sānjosla — planšetēm un datoriem                                    */
/* ------------------------------------------------------------------ */

export function CategorySidebar({
  items,
  active,
  onSelect,
  onAdd,
  onEdit,
  footer,
}: {
  items: NavItem[];
  active: ViewId;
  onSelect: (id: ViewId) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  footer: React.ReactNode;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface md:flex lg:w-72">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="grid size-8 place-items-center rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)]">
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path
              d="M4 7.5l2 2 3.5-3.5M4 16.5l2 2 3.5-3.5M13.5 8h6.5M13.5 16h6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-[15px] font-semibold tracking-tight">Saraksts</span>
      </div>

      <nav
        aria-label="Kategorijas"
        className="thin-scrollbar flex-1 overflow-y-auto px-2 pb-2"
      >
        {items.map((item) => {
          const selected = item.id === active;
          const { Icon } = item;
          return (
            <div key={item.id} className="group relative">
              <button
                type="button"
                aria-current={selected ? "page" : undefined}
                onClick={() => onSelect(item.id)}
                style={{ ["--cat" as string]: item.color }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[14px] transition",
                  selected
                    ? "cat-tint font-medium"
                    : "text-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-lg",
                    selected ? "cat-solid" : "cat-tint cat-text",
                  )}
                >
                  <Icon size={15} />
                </span>
                <span
                  className={cn("min-w-0 flex-1 truncate", selected && "cat-text")}
                >
                  {item.label}
                </span>
                {item.count > 0 ? (
                  <span
                    className={cn(
                      "shrink-0 text-[12px] tabular-nums",
                      selected ? "cat-text" : "text-faint",
                      item.editable && "group-hover:opacity-0",
                    )}
                  >
                    {item.count}
                  </span>
                ) : null}
              </button>

              {item.editable ? (
                <button
                  type="button"
                  aria-label={`Rediģēt kategoriju ${item.label}`}
                  onClick={() => onEdit(item.id)}
                  className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 place-items-center rounded-lg p-1.5 text-muted opacity-0 transition hover:bg-surface hover:text-ink group-hover:grid group-hover:opacity-100 focus-visible:grid focus-visible:opacity-100"
                >
                  <Pencil size={14} />
                </button>
              ) : null}
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAdd}
          className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[14px] text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-dashed border-line-strong">
            <Plus size={15} />
          </span>
          Jauna kategorija
        </button>
      </nav>

      <div className="border-t border-line p-3">{footer}</div>
    </aside>
  );
}
