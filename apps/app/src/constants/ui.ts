import { cn } from "src/utils/cn";

export const HOVER_REVEAL =
  "hidden max-lg:active:flex max-lg:peer-focus:flex [@media(hover:hover)_and_(pointer:fine)]:group-hover/row:flex";

export const NO_TASKS_TO_CLEAR_MESSAGE = "nothing to clear.";

export const STORAGE_WRITE_ERROR_MESSAGE =
  "Changes may not persist — storage is full or unavailable.";

export const ROW_DIVIDER =
  "border-b border-line-light dark:border-hairline-dark";

export const DRAWER_TOGGLE_DIVIDER =
  "border-t border-line-light dark:border-hairline-dark";

export const DRAWER_HEADER_GRID =
  "grid min-h-12 grid-cols-[minmax(0,1fr)_5rem] items-stretch";

export const DRAWER_HEADER_GRID_REVERSED =
  "grid min-h-12 grid-cols-[5rem_minmax(0,1fr)] items-stretch";

export const DRAWER_ICON_HEADER_GRID =
  "grid min-h-12 grid-cols-[minmax(0,1fr)_3rem] items-stretch";

export const DRAWER_ICON_HEADER_GRID_REVERSED =
  "grid min-h-12 grid-cols-[3rem_minmax(0,1fr)] items-stretch";

export const DRAWER_HEADER_ACTIVE =
  "bg-surface-hover-light dark:bg-surface-active-dark";

export const SIDE_ACTION_BORDER =
  "border-l border-line-light dark:border-hairline-dark";

export const DRAWER_WIDTH = "w-[min(100vw-2rem,22rem)]";

/** Shared z-index for header, drawers, canvas controls, and mobile bar. */
export const FLOATING_CHROME_Z = "z-50";

/** Canvas pan/zoom surface sits below floating chrome. */
export const CANVAS_LAYER_Z = "z-0";

/** Above drawers so center-bottom controls stay clickable. */
export const CANVAS_CONTROLS_Z = "z-[60]";

export const DRAWER_SURFACE = "bg-white dark:bg-surface-dark";

export const DRAWER_TEXT = "text-black dark:text-ink-dark";

export const DRAWER_MUTED_TEXT = "text-muted-light dark:text-muted-dark";

export const DRAWER_COLLAPSED_BUTTON = cn(
  "flex items-center gap-2 px-4 py-3 text-sm font-medium",
  DRAWER_TEXT
);

export const DRAWER_HEADER_BUTTON = cn(
  "flex min-h-12 items-center gap-2 px-4 text-sm font-medium",
  DRAWER_SURFACE,
  DRAWER_TEXT
);

export const DRAWER_BODY = cn(
  "custom-scrollbar max-h-[min(40rem,100vh)] overflow-y-auto",
  DRAWER_SURFACE,
  DRAWER_TEXT
);

export const DRAWER_HEADER_HOVER = cn(
  "transition-colors duration-150 ease-out-strong",
  "hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark"
);

/** Floating chrome surface (drawer toggle, zoom controls, new list): the same
 * frosted canvas tint as the header actions (translucent + backdrop blur),
 * with a muted hairline border so it reads as quiet control chrome rather
 * than a solid black-bordered panel. */
export const FLOATING_CONTROL_SURFACE = cn(
  "rounded-2xl border border-line-light bg-canvas-light/80 backdrop-blur-md",
  "dark:border-hairline-dark dark:bg-canvas-dark/80"
);

export const DIALOG_HEADER =
  "relative border-b border-line-light px-5 py-4 pr-14 dark:border-hairline-dark";

/** Shared native `<dialog>` shell — pairs with `.app-dialog::backdrop` in index.css. */
export const APP_DIALOG = "app-dialog";

export const KBD_CLASS = cn(
  "rounded border border-line-light bg-white px-2 py-1 font-sans",
  DRAWER_TEXT,
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
  "hover:brightness-95 dark:hover:brightness-125"
);

export const DRAWER_COUNT_BADGE = cn(
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
