"use client";

import Sheet from "./Sheet";
import { btnDanger, btnSubtle } from "./ui";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Dzēst",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Sheet
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button type="button" className={btnSubtle} onClick={onCancel}>
            Atcelt
          </button>
          <button
            type="button"
            className={btnDanger}
            data-autofocus
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-[14px] leading-relaxed text-muted">{message}</p>
    </Sheet>
  );
}
