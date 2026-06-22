import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "src/components/Button";
import { HelpContent } from "src/components/Help";
import {
  APP_DIALOG,
  DIALOG_HEADER,
  KBD_CLASS,
  MUTED_TEXT,
} from "src/constants/ui";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CloseIcon,
  CommandIcon,
  ControlIcon,
  DragIcon,
  OptionIcon,
} from "src/icons";
import { cn } from "src/utils";
import type { DefaultSvgProps } from "src/utils";

type Key = {
  display: string;
  label?: string;
  icon?: (props: DefaultSvgProps) => React.JSX.Element;
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
const ARROW_UP: Key = { display: "", icon: ArrowUpIcon, label: "up arrow" };
const ARROW_DOWN: Key = {
  display: "",
  icon: ArrowDownIcon,
  label: "down arrow",
};

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
    ? { display: "", icon: CommandIcon, label: "command" }
    : { display: "", icon: ControlIcon, label: "control" };
  const altModifier: Key = isMac
    ? { display: "", icon: OptionIcon, label: "option" }
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
          combos: [
            [
              {
                display: "drag",
                icon: DragIcon,
                label: "drag the move list control",
              },
            ],
          ],
        },
      ],
    },
  ];
}

type HelpDialogProps = {
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
                className={cn(
                  KBD_CLASS,
                  "inline-flex min-h-8 min-w-8 items-center justify-center gap-1 text-sm",
                  key.icon && !key.display && "px-1.5"
                )}
              >
                {key.display}
                {key.icon ? (
                  <key.icon size={14} className="text-current" />
                ) : null}
              </kbd>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

export function HelpDialog({ open, onClose }: HelpDialogProps) {
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
      aria-labelledby="help-dialog-title"
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
          <h2 id="help-dialog-title" className="text-xl font-medium">
            help
          </h2>
          <Button
            autoFocus
            aria-label="Close help"
            onClick={onClose}
            variant="ghost"
            size="icon-sm"
            className="absolute top-4 right-4 shrink-0"
          >
            <CloseIcon size={18} className="dark:text-ink-dark text-black" />
          </Button>
        </header>

        <div className="custom-scrollbar space-y-8 overflow-y-auto px-5 py-5">
          <HelpContent />

          <div className="grid gap-x-20 gap-y-8 sm:grid-cols-2">
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
                        <dt
                          className={cn(
                            "text-base whitespace-nowrap",
                            MUTED_TEXT
                          )}
                        >
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
      </div>
    </dialog>
  );
}
