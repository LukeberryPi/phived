import type { ReactElement, Ref } from "react";
import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "src/utils";

type TooltipProps = {
  label: string;
  children: ReactElement;
};

type Coords = { x: number; y: number };

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as { current: T | null }).current = node;
      }
    }
  };
}

export function Tooltip({ label, children }: TooltipProps) {
  const triggerRef = useRef<HTMLElement>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const open = coords !== null;

  const measure = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCoords({ x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  const hide = useCallback(() => setCoords(null), []);

  useEffect(() => {
    if (!open) return;

    const update = () => measure();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, measure]);

  const childRef = (children as { ref?: Ref<HTMLElement> }).ref;

  const trigger = cloneElement(children, {
    ref: mergeRefs(triggerRef, childRef),
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      children.props.onPointerEnter?.(event);
      if (event.pointerType === "mouse") measure();
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      children.props.onPointerLeave?.(event);
      hide();
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      children.props.onFocus?.(event);
      if (event.target.matches(":focus-visible")) measure();
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      children.props.onBlur?.(event);
      hide();
    },
  } as Partial<typeof children.props> & { ref: Ref<HTMLElement> });

  return (
    <>
      {trigger}
      {open &&
        createPortal(
          <span
            role="tooltip"
            aria-hidden="true"
            className={cn(
              "tooltip-bubble pointer-events-none fixed z-[100] select-none",
              "rounded-lg px-2 py-1 text-xs font-medium whitespace-nowrap shadow-none",
              "dark:border-edge-dark dark:bg-surface-dark dark:text-ink-dark bg-black text-white dark:border"
            )}
            style={{ left: coords.x, top: coords.y }}
          >
            {label}
          </span>,
          document.body
        )}
    </>
  );
}
