"use client";

import { LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Sheet from "./Sheet";
import { btnSubtle } from "./ui";
import { cn } from "@/lib/utils";

export function AccountPanel({
  email,
  onSignOut,
  signingOut,
}: {
  email: string;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const initial = email.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[13px] font-semibold text-[var(--accent-contrast)]">
          {initial}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-muted" title={email}>
          {email}
        </span>
      </div>

      <ThemeToggle />

      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        className={cn(btnSubtle, "w-full")}
      >
        <LogOut size={16} />
        {signingOut ? "Izrakstās…" : "Izrakstīties"}
      </button>
    </div>
  );
}

export function AccountSheet({
  open,
  email,
  onClose,
  onSignOut,
  signingOut,
}: {
  open: boolean;
  email: string;
  onClose: () => void;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Konts un izskats">
      <AccountPanel
        email={email}
        onSignOut={onSignOut}
        signingOut={signingOut}
      />
    </Sheet>
  );
}
