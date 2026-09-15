"use client";

import { useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";
import Sheet from "./Sheet";
import { btnDanger, btnPrimary, btnSubtle } from "./ui";
import { colorValue } from "@/lib/colors";
import { getIcon } from "@/lib/icons";
import { addDays, cn, localToday } from "@/lib/utils";
import type { Category, Todo } from "@/lib/types";

export type TodoPatch = {
  title: string;
  note: string | null;
  category_id: string | null;
  due_date: string | null;
};

type Props = {
  todo: Todo;
  categories: Category[];
  onClose: () => void;
  onSave: (patch: TodoPatch) => void;
  onDelete: () => void;
  onToggleDone: () => void;
};

/**
 * Tiek montēta no jauna katram uzdevumam (skat. `key` vecākā), tāpēc sākuma
 * vērtības nāk tieši no props.
 */
export default function TodoSheet({
  todo,
  categories,
  onClose,
  onSave,
  onDelete,
  onToggleDone,
}: Props) {
  const [title, setTitle] = useState(todo.title);
  const [note, setNote] = useState(todo.note ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(todo.category_id);
  const [due, setDue] = useState(todo.due_date ?? "");

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave({
      title: trimmed,
      note: note.trim() ? note.trim() : null,
      category_id: categoryId,
      due_date: due || null,
    });
  }

  const quickDates = (() => {
    const today = localToday();
    return [
      { label: "Šodien", value: today },
      { label: "Rīt", value: addDays(today, 1) },
      { label: "Pēc nedēļas", value: addDays(today, 7) },
    ];
  })();

  return (
    <Sheet
      open
      onClose={onClose}
      title="Uzdevums"
      footer={
        <>
          <button
            type="button"
            className={cn(btnDanger, "mr-auto")}
            onClick={onDelete}
          >
            <Trash2 size={16} />
            Dzēst
          </button>
          <button type="button" className={btnSubtle} onClick={onClose}>
            Atcelt
          </button>
          <button type="button" className={btnPrimary} onClick={submit}>
            Saglabāt
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label
            htmlFor="todo-title"
            className="mb-1 block text-[13px] font-medium text-muted"
          >
            Nosaukums
          </label>
          <textarea
            id="todo-title"
            data-autofocus
            className="field resize-none"
            rows={2}
            maxLength={500}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
        </div>

        <div>
          <label
            htmlFor="todo-note"
            className="mb-1 block text-[13px] font-medium text-muted"
          >
            Piezīme <span className="text-faint">(nav obligāta)</span>
          </label>
          <textarea
            id="todo-note"
            className="field resize-y"
            rows={3}
            value={note}
            placeholder="Detaļas, saites, atgādinājumi…"
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium text-muted">Kategorija</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCategoryId(null)}
              aria-pressed={categoryId === null}
              className={cn(
                "min-h-9 rounded-full border px-3 text-[13px] transition active:scale-[0.97]",
                categoryId === null
                  ? "border-transparent bg-[var(--accent)] text-[var(--accent-contrast)]"
                  : "border-line text-muted hover:bg-surface-2",
              )}
            >
              Bez kategorijas
            </button>
            {categories.map((c) => {
              const Icon = getIcon(c.icon);
              const value = colorValue(c.color);
              const selected = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  aria-pressed={selected}
                  style={{ ["--cat" as string]: value }}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] transition active:scale-[0.97]",
                    selected
                      ? "cat-solid border-transparent"
                      : "cat-border cat-text cat-tint-hover",
                  )}
                >
                  <Icon size={14} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="todo-due"
            className="mb-2 block text-[13px] font-medium text-muted"
          >
            Termiņš
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="relative">
              <CalendarDays
                size={15}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
              />
              <input
                id="todo-due"
                type="date"
                className="field !w-auto !pl-8 text-[13px]"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
            {quickDates.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => setDue(q.value)}
                className={cn(
                  "min-h-9 rounded-full border border-line px-3 text-[13px] text-muted transition hover:bg-surface-2 hover:text-ink active:scale-[0.97]",
                  due === q.value && "border-transparent cat-tint text-ink",
                )}
                style={{ ["--cat" as string]: "var(--accent)" }}
              >
                {q.label}
              </button>
            ))}
            {due ? (
              <button
                type="button"
                onClick={() => setDue("")}
                className="min-h-9 rounded-full px-3 text-[13px] text-muted transition hover:text-ink"
              >
                Noņemt
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium">
                {todo.done ? "Uzdevums ir arhīvā" : "Uzdevums ir aktīvs"}
              </p>
              <p className="text-[12.5px] text-muted">
                {todo.done
                  ? "Atjauno, lai tas atkal parādītos sarakstā."
                  : "Atzīmējot kā izdarītu, tas pāriet uz arhīvu."}
              </p>
            </div>
            <button
              type="button"
              className={cn(btnSubtle, "shrink-0")}
              onClick={onToggleDone}
            >
              {todo.done ? "Atjaunot" : "Izdarīts"}
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
