import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "src/components/Button";
import { APP_DIALOG, DIALOG_HEADER, KBD_CLASS } from "src/constants/ui";
import { Close } from "src/icons";
import { cn } from "src/utils";

type Key = {
  display: string;
  label?: string;
};

type Combo = Key[];

type Shortcut = {
  label: string;
  combos: Combo[];
};

type ShortcutSection = {
  title: string;
  shortcuts: Shortcut[];
};

const ENTER: Key = { display: "enter" };
const SHIFT: Key = { display: "shift" };
const ESC: Key = { display: "esc", label: "escape" };
const ARROW_UP: Key = { display: "↑", label: "up arrow" };
const ARROW_DOWN: Key = { display: "↓", label: "down arrow" };

function detectIsMac(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ||
    navigator.userAgent ||
    "";

  return /mac/i.test(platform);
}

function buildSections(isMac: boolean): ShortcutSection[] {
  const completeModifier: Key = isMac
    ? { display: "⌘", label: "command" }
    : { display: "ctrl", label: "control" };
  const altModifier: Key = isMac
    ? { display: "⌥", label: "option" }
    : { display: "alt", label: "alt" };

  return [
    {
      title: "navigation",
      shortcuts: [
        { label: "next task", combos: [[ARROW_DOWN]] },
        { label: "previous task", combos: [[ARROW_UP]] },
        { label: "new task below", combos: [[ENTER]] },
        { label: "new task above", combos: [[SHIFT, ENTER]] },
        { label: "unfocus task", combos: [[ESC]] },
      ],
    },
    {
      title: "action",
      shortcuts: [
        { label: "complete task", combos: [[completeModifier, ENTER]] },
        { label: "move task up", combos: [[altModifier, ARROW_UP]] },
        { label: "move task down", combos: [[altModifier, ARROW_DOWN]] },
      ],
    },
    {
      title: "canvas",
      shortcuts: [
        {
          label: "pan canvas",
          combos: [
            [{ display: "scroll" }],
            [{ display: "drag", label: "drag the background" }],
          ],
        },
        {
          label: "zoom canvas",
          combos: [[completeModifier, { display: "scroll" }]],
        },
        {
          label: "new list",
          combos: [
            [{ display: "double-click", label: "double-click the background" }],
          ],
        },
        {
          label: "move list",
          combos: [[{ display: "drag header", label: "drag the list header" }]],
        },
      ],
    },
  ];
}

type HotkeysDialogProps = {
  open: boolean;
  onClose: () => void;
};

function Keys({ combos }: { combos: Combo[] }) {
  return (
    <span className="flex flex-wrap items-center justify-end gap-1.5">
      {combos.map((combo, comboIdx) => (
        <span key={comboIdx} className="flex items-center gap-1.5">
          {comboIdx > 0 && (
            <span className="text-muted-light dark:text-muted-dark text-sm">
              or
            </span>
          )}
          {combo.map((key, keyIdx) => (
            <span key={keyIdx} className="flex items-center gap-1.5">
              {keyIdx > 0 && (
                <span
                  aria-hidden="true"
                  className="text-muted-light dark:text-muted-dark text-sm"
                >
                  +
                </span>
              )}
              <kbd
                aria-label={key.label}
                className={cn(KBD_CLASS, "min-w-8 text-center text-sm")}
              >
                {key.display}
              </kbd>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

export function HotkeysDialog({ open, onClose }: HotkeysDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isMac] = useState(detectIsMac);
  const sections = useMemo(() => buildSections(isMac), [isMac]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Native <dialog> Escape also bubbles to the page-level keydown handler that
  // blurs the focused element. Stop it here so closing is the only side effect.
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
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="hotkeys-dialog-title"
      onClose={onClose}
      onCancel={onClose}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        APP_DIALOG,
        "task-panel dark:text-ink-dark m-auto w-full max-w-3xl p-0 text-black",
        "max-h-[85vh] overflow-hidden"
      )}
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className={DIALOG_HEADER}>
          <h2 id="hotkeys-dialog-title" className="text-xl font-medium">
            keyboard shortcuts
          </h2>
          <Button
            autoFocus
            aria-label="Close keyboard shortcuts"
            onClick={onClose}
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-4 shrink-0 -translate-y-1/2"
          >
            <Close size={18} className="dark:fill-ink-dark fill-black" />
          </Button>
        </header>

        <div className="custom-scrollbar grid gap-x-20 gap-y-8 overflow-y-auto px-5 py-5 sm:grid-cols-2">
          {sections.map((section, sectionIdx) => {
            const headingId = `hotkeys-section-${sectionIdx}`;

            return (
              <section key={section.title} aria-labelledby={headingId}>
                <h3 id={headingId} className="mb-3 text-lg font-medium">
                  {section.title}
                </h3>
                <dl className="space-y-3">
                  {section.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.label}
                      className="flex items-center justify-between gap-4"
                    >
                      <dt className="text-base whitespace-nowrap">
                        {shortcut.label}
                      </dt>
                      <dd className="m-0">
                        <Keys combos={shortcut.combos} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>
      </div>
    </dialog>
  );
}
