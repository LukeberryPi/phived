import type { DraggableStateSnapshot } from "@hello-pangea/dnd";
import type { CSSProperties } from "react";
import { DROP_SNAP_DELAY_MS } from "src/constants/motion";

/** Hold drop position during scale-down, then snap into place instantly. */
export function getDraggableDropStyle(
  style: CSSProperties | undefined,
  snapshot: DraggableStateSnapshot
): CSSProperties {
  if (!style) {
    return {};
  }

  if (!snapshot.isDropAnimating || !snapshot.dropAnimation) {
    return style;
  }

  const rest = { ...style };
  delete rest.transition;
  const { moveTo } = snapshot.dropAnimation;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return {
      ...rest,
      transform: `translate(${moveTo.x}px, ${moveTo.y}px)`,
      transitionDuration: "0.001s",
    };
  }

  return {
    ...rest,
    transform: `translate(${moveTo.x}px, ${moveTo.y}px)`,
    transitionProperty: "transform",
    transitionDuration: "0.001s",
    transitionDelay: `${DROP_SNAP_DELAY_MS}ms`,
    transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
  };
}
