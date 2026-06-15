/** Shared motion tokens — transform/scale-only, ease-out, under 300ms. */

import { cn } from "src/utils/cn";

// Tailwind v4 `scale-*` sets the standalone `scale` property (not `transform`),
// so the transition must list `scale` for the press to animate instead of
// snapping; reduced motion neutralizes with `scale-100` (not `transform-none`).
export const pressFeedbackClassName =
  "transition-[scale,background-color] duration-150 ease-out-strong motion-reduce:scale-100 active:scale-95";

const pressFeedbackGroupTransform =
  "transition-transform duration-150 ease-out-strong motion-reduce:transform-none";

const pressFeedbackGroupClassNames = {
  theme: "group/theme",
  "clear-tasks": "group/clear-tasks",
  hotkeys: "group/hotkeys",
  "bar-action": "group/bar-action",
  "clear-history": "group/clear-history",
  restore: "group/restore",
  "drawer-toggle": "group/drawer-toggle",
  done: "group/done",
  "add-row": "group/add-row",
} as const;

const pressFeedbackGroupActiveClassNames = {
  theme: "group-active/theme:scale-95",
  "clear-tasks": "group-active/clear-tasks:scale-95",
  hotkeys: "group-active/hotkeys:scale-95",
  "bar-action": "group-active/bar-action:scale-95",
  "clear-history": "group-active/clear-history:scale-95",
  restore: "group-active/restore:scale-95",
  "drawer-toggle": "group-active/drawer-toggle:scale-95",
  done: "group-active/done:scale-95",
  "add-row": "group-active/add-row:scale-95",
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
