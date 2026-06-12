import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent } from "react";
import { useEffect, useRef } from "react";
import { pressFeedbackClassName } from "src/constants/motion";
import {
  APP_DIALOG,
  DIALOG_CLOSE_BUTTON,
  DIALOG_HEADER,
  DRAWER_MUTED_TEXT,
  DRAWER_TEXT,
} from "src/constants/ui";
import { Close } from "src/icons";
import { cn } from "src/utils";

export type DeletionConfirmTarget =
  | { kind: "canvas" }
  | { kind: "history" }
  | { kind: "list"; listId: string };

type DialogCopy = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
};

const dialogCopyByKind: Record<DeletionConfirmTarget["kind"], DialogCopy> = {
  canvas: {
    title: "clear the whole canvas?",
    description:
      "This deletes every list and every task immediately. They will not move to history.",
    confirmLabel: "clear canvas",
    cancelLabel: "keep everything",
  },
  list: {
    title: "delete this list?",
    description:
      "This deletes the list and its tasks immediately. They will not move to history.",
    confirmLabel: "delete list",
    cancelLabel: "keep list",
  },
  history: {
    title: "clear task history?",
    description:
      "This removes every completed task from history. There is no undo for this action.",
    confirmLabel: "clear history",
    cancelLabel: "keep history",
  },
};

type DeletionConfirmDialogProps = {
  target: DeletionConfirmTarget | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeletionConfirmDialog({
  target,
  onCancel,
  onConfirm,
}: DeletionConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const copy = target ? dialogCopyByKind[target.kind] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (target && !dialog.open) {
      dialog.showModal();
    } else if (!target && dialog.open) {
      dialog.close();
    }
  }, [target]);

  useEffect(() => {
    if (!target) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [target]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
    }
  };

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target !== dialogRef.current) {
      return;
    }

    const { top, right, bottom, left } =
      dialogRef.current.getBoundingClientRect();
    const isOutside =
      event.clientX < left ||
      event.clientX > right ||
      event.clientY < top ||
      event.clientY > bottom;

    if (isOutside) {
      onCancel();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="deletion-confirm-title"
      aria-describedby="deletion-confirm-description"
      onCancel={onCancel}
      onClick={handleClick}
      onClose={onCancel}
      onKeyDown={handleKeyDown}
      className={cn(
        APP_DIALOG,
        "task-panel m-auto w-[min(calc(100vw-2rem),28rem)] p-0",
        "dark:text-ink-dark text-black"
      )}
    >
      {copy && (
        <div className="overflow-hidden rounded-2xl">
          <header className={DIALOG_HEADER}>
            <h2
              id="deletion-confirm-title"
              className={cn("text-xl leading-tight font-medium", DRAWER_TEXT)}
            >
              {copy.title}
            </h2>
            <button
              autoFocus
              type="button"
              aria-label="Close"
              onClick={onCancel}
              className={cn(DIALOG_CLOSE_BUTTON, pressFeedbackClassName)}
            >
              <Close size={18} className="dark:fill-ink-dark fill-black" />
            </button>
          </header>

          <div className="px-5 py-5">
            <p
              id="deletion-confirm-description"
              className={cn("text-base leading-6", DRAWER_MUTED_TEXT)}
            >
              {copy.description}
            </p>
          </div>

          <div className="border-line-light dark:border-hairline-dark grid grid-cols-2 border-t">
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                "border-line-light dark:border-hairline-dark border-r px-4 py-4 text-sm font-medium",
                "dark:sm:hover:bg-surface-hover-dark sm:hover:bg-surface-hover-light",
                pressFeedbackClassName
              )}
            >
              {copy.cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={cn(
                "px-4 py-4 text-sm font-medium text-red-600 dark:text-red-400",
                "sm:hover:bg-red-100 dark:sm:hover:bg-red-950",
                pressFeedbackClassName
              )}
            >
              {copy.confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
