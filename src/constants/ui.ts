import { cn } from "src/utils/cn";

export const HOVER_REVEAL =
  "hidden max-lg:active:flex max-lg:peer-focus:flex [@media(hover:hover)_and_(pointer:fine)]:group-hover/row:flex";

export const NO_TASKS_TO_CLEAR_MESSAGE = "no tasks to clear.";

export const ROW_DIVIDER = "border-b border-line dark:border-hairline";

export const DRAWER_TOGGLE_DIVIDER =
  "border-t border-line dark:border-hairline";

export const DRAWER_HEADER_GRID =
  "grid min-h-12 grid-cols-[minmax(0,1fr)_5rem] items-stretch";

export const DRAWER_HEADER_GRID_REVERSED =
  "grid min-h-12 grid-cols-[5rem_minmax(0,1fr)] items-stretch";

export const DRAWER_ICON_HEADER_GRID =
  "grid min-h-12 grid-cols-[minmax(0,1fr)_3rem] items-stretch";

export const DRAWER_ICON_HEADER_GRID_REVERSED =
  "grid min-h-12 grid-cols-[3rem_minmax(0,1fr)] items-stretch";

export const DRAWER_HEADER_ACTIVE = "bg-zinc-100 dark:bg-surfaceActive";

export const SIDE_ACTION_BORDER = "border-l border-line dark:border-hairline";

export const DESKTOP_BREAKPOINT = 640;

export const DESKTOP_MEDIA_QUERY = `(min-width: ${DESKTOP_BREAKPOINT}px)`;

export const DRAWER_WIDTH = "w-[min(100vw-2rem,22rem)]";

/** Matches MobileActionBar `left-4 right-4` horizontal inset. */
export const MOBILE_PANEL_HORIZONTAL_INSET_PX = 32;

export const TASK_PANEL_WIDTH = "w-[min(400px,calc(100vw-2rem))]";

export const DRAWER_SURFACE = "bg-white dark:bg-surface";

export const DRAWER_TEXT = "text-black dark:text-ink";

export const DRAWER_MUTED_TEXT = "text-muted dark:text-inkMuted";

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
  "sm:hover:bg-zinc-100 dark:sm:hover:bg-surfaceHover";

export const DIALOG_HEADER =
  "relative border-b border-line px-5 py-4 pr-14 dark:border-hairline";

export const DIALOG_CLOSE_BUTTON = cn(
  "absolute top-1/2 right-4 flex size-8 shrink-0 -translate-y-1/2 items-center justify-center rounded-full",
  DRAWER_HEADER_HOVER
);

/** Shared native `<dialog>` shell — pairs with `.app-dialog::backdrop` in index.css. */
export const APP_DIALOG = "app-dialog";

export const KBD_CLASS = cn(
  "rounded border border-line bg-white px-2 py-1 font-sans",
  DRAWER_TEXT,
  "dark:border-hairline dark:bg-surfaceHover"
);

/** Done button, history restore, and history count badge. */
export const ACTION_ACCENT_SURFACE =
  "bg-sky-300 text-black dark:bg-cyan-800 dark:text-ink";

export const DRAWER_COUNT_BADGE = cn(
  "inline-flex size-6 shrink-0 items-center justify-center rounded-full",
  "border border-black text-xs tabular-nums",
  ACTION_ACCENT_SURFACE,
  "dark:border-edge"
);
