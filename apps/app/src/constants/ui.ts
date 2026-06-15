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

export const DRAWER_HEADER_HOVER =
  "sm:hover:bg-surface-hover-light dark:sm:hover:bg-surface-hover-dark";

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

/** Brightness-dim hover shared with the accent Button variant — no color/text
 * swap, just a subtle dim (light) / lift (dark) that matches @phived/ui. */
export const ACTION_ACCENT_HOVER = cn(
  "transition-[filter] duration-150 ease-out-strong motion-reduce:transition-none",
  "sm:hover:brightness-95 dark:sm:hover:brightness-110"
);

export const DRAWER_COUNT_BADGE = cn(
  "inline-flex size-6 shrink-0 items-center justify-center rounded-full",
  "border border-black text-xs tabular-nums",
  ACTION_ACCENT_SURFACE,
  "dark:border-edge-dark"
);

/** Clear/delete trash buttons — red tint on hover in light and dark mode. */
export const DESTRUCTIVE_ACTION_HOVER = cn(
  "sm:hover:bg-red-100 sm:hover:text-red-600",
  "dark:sm:hover:bg-red-950 dark:sm:hover:text-red-500"
);

/** Pair with DESTRUCTIVE_ACTION_HOVER so the icon inherits hover color. */
export const DESTRUCTIVE_TRASH_ICON = "text-current";
