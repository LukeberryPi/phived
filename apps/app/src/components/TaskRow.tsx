import type { FormEvent, KeyboardEvent, PointerEvent } from "react";
import {
  ACTION_ACCENT_HOVER,
  ACTION_ACCENT_SURFACE,
  HOVER_REVEAL,
  ROW_DIVIDER,
} from "src/constants/ui";
import {
  dragLiftClassName,
  pressFeedbackGroupChildClassName,
  pressFeedbackGroupClassName,
} from "src/constants/motion";
import { Check, DragVertical } from "src/icons";
import { cn } from "src/utils";

type TaskRowProps = {
  index: number;
  task: string;
  autoFocus: boolean;
  placeholder: string;
  isLast: boolean;
  isDragging: boolean;
  anotherRowIsDragging: boolean;
  belowIsDragging: boolean;
  onChange: (event: FormEvent<HTMLInputElement>, index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>, index: number) => void;
  onDragPointerDown: (event: PointerEvent<HTMLElement>, index: number) => void;
  onComplete: (index: number) => void;
};

export function TaskRow({
  index,
  task,
  autoFocus,
  placeholder,
  isLast,
  isDragging,
  anotherRowIsDragging,
  belowIsDragging,
  onChange,
  onKeyDown,
  onDragPointerDown,
  onComplete,
}: TaskRowProps) {
  const isEmpty = task.trim() === "";
  const someRowIsDragging = isDragging || anotherRowIsDragging;
  // Drop the divider when the next row is lifting away to reorder, so the
  // detached card doesn't sit beneath a stray hairline.
  const showDivider = !isLast && !isDragging && !belowIsDragging;

  return (
    <li data-task-row className={cn("relative", isDragging && "z-10 px-1")}>
      <div
        className={cn(
          "group/row relative flex w-full origin-center",
          isDragging && dragLiftClassName
        )}
      >
        <input
          value={task}
          onChange={(event) => onChange(event, index)}
          autoCapitalize="false"
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck="false"
          placeholder={placeholder}
          aria-label={`Task ${index + 1}`}
          onKeyDown={(event) => onKeyDown(event, index)}
          className={cn(
            "peer w-full bg-white px-4 py-3 text-black focus:outline-none",
            "dark:bg-surface-dark dark:text-ink-dark",
            !isEmpty && "group-hover/row:pr-2",
            someRowIsDragging && "cursor-grabbing",
            showDivider && ROW_DIVIDER,
            isDragging && "rounded-2xl"
          )}
        />
        <span
          aria-label="Drag handle to reorder task"
          tabIndex={-1}
          onPointerDown={(event) => onDragPointerDown(event, index)}
          className={cn(
            "group/drag flex touch-none items-center justify-center bg-white",
            isDragging ? "pr-3" : "pr-2",
            "placeholder:select-none",
            "dark:bg-surface-dark",
            isDragging ? "cursor-grabbing" : "hover:cursor-grab",
            showDivider && ROW_DIVIDER,
            isEmpty || anotherRowIsDragging
              ? "hidden"
              : isDragging
                ? "flex"
                : HOVER_REVEAL
          )}
        >
          <DragVertical
            className={cn(
              "ease origin-center transition-[color,scale] duration-150 motion-reduce:scale-100",
              "text-muted-light dark:text-muted-dark",
              "pointer-fine:group-hover/drag:scale-110 pointer-fine:group-hover/drag:text-black",
              "dark:pointer-fine:group-hover/drag:text-ink-dark"
            )}
          />
        </span>
        <button
          aria-label="complete task"
          aria-keyshortcuts="control+enter"
          onClick={() => onComplete(index)}
          className={cn(
            pressFeedbackGroupClassName("done"),
            "items-center justify-center select-none",
            "border-line-light dark:border-edge-dark border-l px-4",
            !isLast && "border-b",
            ACTION_ACCENT_SURFACE,
            ACTION_ACCENT_HOVER,
            isEmpty || someRowIsDragging ? "hidden" : HOVER_REVEAL
          )}
        >
          <span className={pressFeedbackGroupChildClassName("done")}>
            <Check size={18} className="text-current" />
          </span>
        </button>
      </div>
    </li>
  );
}
