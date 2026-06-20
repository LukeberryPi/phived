import { cn } from "src/utils/cn";

export const HOVER_REVEAL =
  "hidden max-lg:active:flex max-lg:peer-focus:flex pointer-fine:group-hover/row:flex";

export const NO_TASKS_TO_CLEAR_MESSAGE = "nothing to clear.";

export const STORAGE_WRITE_ERROR_MESSAGE =
  "Changes may not persist — storage is full or unavailable.";

export const ROW_DIVIDER =
  "border-b border-line-light dark:border-hairline-dark";

export const TOP_DIVIDER =
  "border-t border-line-light dark:border-hairline-dark";

export const ACTIVE_SURFACE =
  "bg-surface-hover-light dark:bg-surface-active-dark";

export const SIDE_ACTION_BORDER =
  "border-l border-line-light dark:border-hairline-dark";

/** Shared z-index for header, history drawer, canvas controls, and mobile bar. */
export const FLOATING_CHROME_Z = "z-50";

/** Canvas pan/zoom surface sits below floating chrome. */
export const CANVAS_LAYER_Z = "z-0";

/** Above the history drawer so center-bottom controls stay clickable. */
export const CANVAS_CONTROLS_Z = "z-[60]";

export const SURFACE = "bg-white dark:bg-surface-dark";

export const PRIMARY_TEXT = "text-black dark:text-ink-dark";

export const MUTED_TEXT = "text-muted-light dark:text-muted-dark";

export const PANEL_BODY = cn(
  "custom-scrollbar max-h-[min(40rem,100vh)] overflow-y-auto",
  SURFACE,
  PRIMARY_TEXT
);

export const HOVER_SURFACE = cn(
  "transition-colors duration-150 ease-out-strong",
  "hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark"
);

/** App-local floating chrome surface (header actions, history toggle, zoom
 * controls, new list): frosted canvas tint plus a muted hairline border. This
 * is intentionally separate from @phived/ui's shared CTA/dialog variants. */
export const FLOATING_CONTROL_SURFACE = cn(
  "rounded-2xl border border-line-light bg-canvas-light/80 backdrop-blur-md",
  "dark:border-hairline-dark dark:bg-canvas-dark/80"
);

/** Visible keyboard focus indicator. Uses `outline` (not a box-shadow `ring`)
 * with `outline-offset` so the page behind shows through the gap, and so it
 * stays crisp on any surface. Outset by default; control segments that fill an
 * `overflow-hidden` cluster override to an inset offset so it isn't clipped. */
export const FOCUS_RING = cn(
  "focus-visible:outline-2 focus-visible:outline-offset-2",
  "focus-visible:outline-black dark:focus-visible:outline-ink-dark"
);

/** The single app chrome button: header actions, "new list", and the collapsed
 * "show history" toggle all share it. `h-11` owns the outer border-box height,
 * so borders cannot make one chrome control taller than another. */
export const CONTROL_BUTTON = cn(
  "inline-flex h-11 box-border select-none items-center justify-center gap-2 px-4 text-sm font-medium",
  PRIMARY_TEXT,
  FLOATING_CONTROL_SURFACE,
  "transition-[scale,filter] duration-150 ease-out-strong motion-reduce:scale-100",
  "hover:brightness-95 dark:hover:brightness-125",
  "active:scale-95 active:brightness-90 dark:active:brightness-125",
  FOCUS_RING
);

/** Segment inside a sized chrome surface (the zoom cluster). It fills the
 * parent's explicit 44px outer height instead of owning height itself; that
 * keeps the parent's border from stacking on top of a 44px child. */
export const CONTROL_SEGMENT = cn(
  "flex h-full min-h-0 select-none items-center justify-center px-3 text-sm font-medium",
  PRIMARY_TEXT,
  "transition-[scale,background-color] duration-150 ease-out-strong motion-reduce:scale-100",
  "hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark",
  "active:scale-95",
  FOCUS_RING,
  "focus-visible:outline-offset-[-2px]"
);

export const DIALOG_HEADER = "relative px-5 py-5 pr-14";

/** Shared native `<dialog>` shell — pairs with `.app-dialog::backdrop` in index.css. */
export const APP_DIALOG = "app-dialog";

export const KBD_CLASS = cn(
  "rounded border border-line-light bg-white px-2 py-1 font-mono font-normal",
  PRIMARY_TEXT,
  "dark:border-hairline-dark dark:bg-surface-hover-dark"
);

/** Done button, history restore, and history count badge. */
export const ACTION_ACCENT_SURFACE =
  "bg-sky-300 text-black dark:bg-cyan-800 dark:text-ink-dark";

/** Hover feedback shared with the accent Button variant — no color/text swap.
 * Light dims the bright accent; dark lifts it (a dim would just sink the
 * already-dark surface into the canvas), tuned to read as clearly as light. */
export const ACTION_ACCENT_HOVER = cn(
  "transition-[filter] duration-150 ease-out-strong motion-reduce:transition-none",
  "hover:brightness-95 dark:hover:brightness-125",
  // Press continues each theme's hover direction (light dims, dark lifts) so
  // the accent doesn't flash by reversing brightness on press.
  "active:brightness-90 dark:active:brightness-150"
);

export const COUNT_BADGE = cn(
  "inline-flex size-6 shrink-0 items-center justify-center rounded-full",
  "border border-black text-xs tabular-nums",
  ACTION_ACCENT_SURFACE,
  "dark:border-edge-dark"
);

/** Clear/delete actions read red at rest (light and dark); hover only tints
 * the background — no text/icon color change on hover. */
export const DESTRUCTIVE_ACTION = cn(
  // `scale` (Tailwind v4's standalone property) kept alongside bg so the press
  // scale survives where this is composed with pressFeedbackClassName (twMerge
  // keeps the last transition).
  "transition-[scale,background-color] duration-150 ease-out-strong",
  "text-red-600 dark:text-red-400",
  "hover:bg-red-100 dark:hover:bg-red-950"
);

/** Pair with DESTRUCTIVE_ACTION so the trash icon inherits the red text. */
export const DESTRUCTIVE_TRASH_ICON = "text-current";
