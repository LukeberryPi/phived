import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent } from "react";
import { useEffect, useRef } from "react";
import { Button } from "src/components/Button";
import {
  APP_DIALOG,
  DIALOG_HEADER,
  DRAWER_MUTED_TEXT,
  DRAWER_TEXT,
} from "src/constants/ui";
import { Close } from "src/icons";
import { cn } from "src/utils";

export type DeletionConfirmTarget =
  | { kind: "canvas" }
  | { kind: "history" }
  | { kind: "list"; listId: string; tag?: string; taskCount: number };

type DialogCopy = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
};

const staticDialogCopy: Record<"canvas" | "history", DialogCopy> = {
  canvas: {
    title: "clear the whole canvas?",
    description:
      "This deletes every list and every task immediately. They will not move to history.",
    confirmLabel: "clear canvas",
    cancelLabel: "keep everything",
  },
  history: {
    title: "clear task history?",
    description:
      "This removes every completed task from history. There is no undo for this action.",
    confirmLabel: "clear history",
    cancelLabel: "keep history",
  },
};

function getDialogCopy(target: DeletionConfirmTarget): DialogCopy {
  if (target.kind === "list") {
    const tag = target.tag?.trim();
    const { taskCount } = target;
    // Only mention tasks when there are some (tag-only lists have none).
    const description =
      taskCount === 0
        ? "This deletes the list immediately."
        : `This deletes the list and ${
            taskCount === 1 ? "its task" : "its tasks"
          } immediately. They will not move to history.`;

    return {
      // Lead with the list's own tag so it's obvious which list is at risk.
      title: tag ? `delete "${tag}"?` : "delete this list?",
      description,
      confirmLabel: "delete list",
      cancelLabel: "keep list",
    };
  }

  return staticDialogCopy[target.kind];
}

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
  const copy = target ? getDialogCopy(target) : null;

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
            <Button
              autoFocus
              aria-label="Close"
              onClick={onCancel}
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-4 shrink-0 -translate-y-1/2"
            >
              <Close size={18} className="dark:fill-ink-dark fill-black" />
            </Button>
          </header>

          <div className="px-5 py-5">
            <p
              id="deletion-confirm-description"
              className={cn("text-base leading-6", DRAWER_MUTED_TEXT)}
            >
              {copy.description}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 pb-5">
            <Button onClick={onCancel} variant="ghost" size="sm">
              {copy.cancelLabel}
            </Button>
            <Button onClick={onConfirm} variant="destructive" size="sm">
              {copy.confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
