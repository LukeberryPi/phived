/** Shared motion tokens — transform-only, ease-out, under 300ms. */

export const DROP_SNAP_DELAY_MS = 150;

export const pressFeedbackClassName =
  "transition-transform duration-150 ease-out-strong motion-reduce:transform-none active:scale-95";

/** Scale inner content when any part of a parent `group` button is pressed. */
export const pressFeedbackGroupChildClassName =
  "transition-transform duration-150 ease-out-strong motion-reduce:transform-none group-active:scale-95";

export const dragLiftClassName =
  "overflow-hidden rounded-2xl border border-black/30 shadow-brutalist-dark dark:border-edge motion-reduce:scale-100";

export const dragScaleUpClassName = "scale-105";

export const dragScaleDownClassName =
  "scale-100 transition-transform duration-150 ease-out-strong motion-reduce:transition-none";

export const drawerWidthTransitionClassName =
  "transition-[width] duration-150 ease-out-strong motion-reduce:transition-none";
