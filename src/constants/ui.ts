import { cn } from "src/utils/cn";

export const HOVER_REVEAL =
  "hidden max-lg:active:flex max-lg:peer-focus:flex [@media(hover:hover)_and_(pointer:fine)]:group-hover:flex";

export const ROW_DIVIDER = "border-b border-black dark:border-white";

export const DRAWER_TOGGLE_DIVIDER = "border-t border-black dark:border-white";

export const DRAWER_HEADER_GRID =
  "grid min-h-12 grid-cols-[minmax(0,1fr)_5rem] items-stretch";

export const DRAWER_HEADER_ACTIVE = "bg-zinc-100 dark:bg-zinc-900";

export const SIDE_ACTION_BORDER = "border-l border-black dark:border-white";

export const DESKTOP_BREAKPOINT = 640;

export const DESKTOP_MEDIA_QUERY = `(min-width: ${DESKTOP_BREAKPOINT}px)`;

export const DRAWER_WIDTH = "w-[min(100vw-2rem,22rem)]";

export const TASK_PANEL_WIDTH = "w-[300px] tiny:w-80 xs:w-96";

export const TOAST_WIDTH = "w-[400px] max-w-[calc(100vw-2rem)]";

export const DRAWER_SURFACE = "bg-white dark:bg-zinc-950";

export const DRAWER_TEXT = "text-black dark:text-white";

export const DRAWER_MUTED_TEXT = "text-black/50 dark:text-white/50";

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
  "max-h-[min(40rem,100vh)] overflow-y-auto",
  DRAWER_SURFACE,
  DRAWER_TEXT
);

export const DRAWER_HEADER_HOVER =
  "sm:hover:bg-zinc-50 dark:sm:hover:bg-zinc-900";

export const KBD_CLASS = cn(
  "rounded border border-black bg-white px-2 py-1 font-sans",
  DRAWER_TEXT,
  "dark:border-white dark:bg-zinc-900"
);

export const DRAWER_COUNT_BADGE = cn(
  "inline-flex size-6 shrink-0 items-center justify-center rounded-full",
  "border border-black bg-emerald-400 text-xs tabular-nums text-black",
  "dark:border-white dark:bg-purple-700 dark:text-white"
);
