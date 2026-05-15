import { type ReactNode, useEffect } from "react";
import { Button } from "./Button";
import { cn } from "@/utils";

interface ModalProps {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Modal({
  open,
  title,
  body,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-surface/70 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      <div
        className={cn(
          "fixed bottom-0 left-1/2 -translate-x-1/2 z-50",
          "w-full max-w-sm",
          "bg-surface-high rounded-t-2xl px-6 pt-6 pb-10",
          "animate-slide-up shadow-float",
        )}
        style={{ animationFillMode: "forwards" }}
      >
        <div className="w-10 h-1 rounded-pill bg-surface-highest mx-auto mb-6" />

        <h3 className="text-h4 mb-2">{title}</h3>

        {body && <div className="text-body text-muted mb-6">{body}</div>}

        <div className="flex flex-col gap-3 mt-6">
          <Button
            variant={danger ? "danger" : "primary"}
            fullWidth
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="ghost" fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
