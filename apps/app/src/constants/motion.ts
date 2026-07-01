/** Shared motion tokens — transform/scale-only, ease-out, under 300ms. */

import { cn } from "src/utils/cn";

// Tailwind v4 `scale-*` sets the standalone `scale` property (not `transform`),
// so the transition must list `scale` for the press to animate instead of
// snapping; reduced motion neutralizes with `scale-100` (not `transform-none`).
export const pressFeedbackClassName =
  "transition-[scale,background-color,filter] duration-150 ease-out-strong motion-reduce:scale-100 active:scale-95 active:brightness-90 dark:active:brightness-125";

const pressFeedbackGroupTransform =
  "transition-[transform,filter] duration-150 ease-out-strong motion-reduce:transform-none";

// Edge-to-edge buttons that can't scale their own box (it would distort a
// shared border or nudge neighbors) instead scale their inner content via these
// groups. Standalone buttons use pressFeedbackClassName / active:scale directly.
const pressFeedbackGroupClassNames = {
  "bar-action": "group/bar-action",
  done: "group/done",
  "add-row": "group/add-row",
  "menu-item": "group/menu-item",
} as const;

const pressFeedbackGroupActiveClassNames = {
  "bar-action":
    "group-active/bar-action:scale-95 group-active/bar-action:brightness-90",
  done: "group-active/done:scale-95 group-active/done:brightness-90",
  "add-row":
    "group-active/add-row:scale-95 group-active/add-row:brightness-90 dark:group-active/add-row:brightness-125",
  "menu-item":
    "group-active/menu-item:scale-95 group-active/menu-item:brightness-90",
} as const;

type PressFeedbackGroupName = keyof typeof pressFeedbackGroupClassNames;

/** Apply to the pressable element; pair with pressFeedbackGroupChildClassName. */
export function pressFeedbackGroupClassName(name: PressFeedbackGroupName) {
  return pressFeedbackGroupClassNames[name];
}

/** Scale inner content when the named group button is pressed. */
export function pressFeedbackGroupChildClassName(name: PressFeedbackGroupName) {
  return cn(
    pressFeedbackGroupTransform,
    pressFeedbackGroupActiveClassNames[name]
  );
}

/** Dragged row reads as a detached rounded card. The row's <li> insets
 * horizontally while dragging so this rounded border stays clear of the
 * panel edges at any list width (no width-proportional scale to overflow). */
export const dragLiftClassName =
  "overflow-hidden rounded-2xl border border-black/30 shadow-md dark:border-edge-dark";

export const drawerWidthTransitionClassName =
  "transition-[width] duration-150 ease-out-strong motion-reduce:transition-none";
