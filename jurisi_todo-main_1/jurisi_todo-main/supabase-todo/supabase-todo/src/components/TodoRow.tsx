"use client";

import { Check, CalendarDays, RotateCcw, StickyNote } from "lucide-react";
import { cn, doneLabel, dueInfo } from "@/lib/utils";
import { colorValue } from "@/lib/colors";
import type { Category, Todo } from "@/lib/types";

type Props = {
  todo: Todo;
  category: Category | null;
  today: string | null;
  onToggle: () => void;
  onOpen: () => void;
};

export default function TodoRow({
  todo,
  category,
  today,
  onToggle,
  onOpen,
}: Props) {
  const done = todo.done;
  const catColor = colorValue(category?.color);
  const due = todo.due_date ? dueInfo(todo.due_date, today) : null;

  return (
    <li className="group relative flex items-start gap-2 rounded-xl transition hover:bg-surface-2">
      {/* Atzīmēšana / atjaunošana. Rimbuļa krāsa = kategorija. */}
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        title={category?.name}
        aria-label={
          done
            ? `Atcelt izdarīto${category ? ` — ${category.name}` : ""}`
            : `Atzīmēt kā izdarītu${category ? ` — ${category.name}` : ""}`
        }
        className="grid size-11 shrink-0 place-items-center rounded-xl active:scale-90"
      >
        {done ? (
          <span
            className="relative grid size-[22px] place-items-center rounded-full transition"
            style={{
              background: category
                ? `color-mix(in oklab, ${catColor} 30%, transparent)`
                : "var(--surface-2)",
              color: category ? catColor : "var(--text-faint)",
              boxShadow: category
                ? undefined
                : "inset 0 0 0 2px var(--border-strong)",
            }}
          >
            <Check
              size={13}
              strokeWidth={3}
              className="transition group-hover:opacity-0"
            />
            <RotateCcw
              size={13}
              strokeWidth={2.6}
              className="absolute opacity-0 transition group-hover:opacity-100"
            />
          </span>
        ) : (
          <span
            className="grid size-[22px] place-items-center rounded-full border-2 transition"
            style={{
              borderColor: category
                ? `color-mix(in oklab, ${catColor} 55%, transparent)`
                : "var(--border-strong)",
            }}
          >
            <Check
              size={13}
              strokeWidth={3}
              className="opacity-0 transition group-hover:opacity-35"
            />
          </span>
        )}
      </button>

      {/* Saturs */}
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 py-2.5 pr-2 text-left"
      >
        <span
          className={cn(
            "block break-words text-[15px] leading-snug",
            done && "text-muted line-through decoration-[1.5px]",
          )}
        >
          {todo.title}
        </span>

        {due || todo.note || (done && todo.done_at) ? (
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {due && !done ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11.5px] font-medium",
                  due.state === "overdue" && "text-[var(--danger)]",
                  due.state === "today" && "text-[var(--accent)]",
                  due.state === "soon" && "text-muted",
                  due.state === "later" && "text-faint",
                )}
              >
                <CalendarDays size={11.5} />
                {due.label}
              </span>
            ) : null}

            {todo.note ? (
              <span className="inline-flex items-center gap-1 text-[11.5px] text-faint">
                <StickyNote size={11.5} />
                Piezīme
              </span>
            ) : null}

            {done && todo.done_at ? (
              <span className="text-[11.5px] text-faint">
                Pabeigts {doneLabel(todo.done_at, today).toLowerCase()}
              </span>
            ) : null}
          </span>
        ) : null}
      </button>
    </li>
  );
}
