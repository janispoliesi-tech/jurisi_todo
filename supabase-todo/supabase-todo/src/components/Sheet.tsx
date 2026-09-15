"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Platāks panelis, piem. ikonu izvēlei. */
  wide?: boolean;
};

export default function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTarget = panelRef.current?.querySelector<HTMLElement>(
      "[data-autofocus], input, textarea, button",
    );
    focusTarget?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Aizvērt"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/45 backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        className={cn(
          "safe-bottom relative flex max-h-[92dvh] w-full flex-col overflow-hidden",
          "animate-sheet-up rounded-t-2xl border border-line bg-surface shadow-[var(--shadow-lg)]",
          "sm:max-h-[86dvh] sm:rounded-2xl",
          wide ? "sm:max-w-xl" : "sm:max-w-md",
        )}
      >
        <div className="flex items-start gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[17px] font-semibold tracking-tight">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-[13px] text-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Aizvērt"
            className="-mr-1 -mt-0.5 grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="thin-scrollbar flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {children}
        </div>

        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-line bg-surface-2 px-4 py-3 sm:px-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
