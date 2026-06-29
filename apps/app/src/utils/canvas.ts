import type { Task, TaskList, TaskLists, Viewport } from "src/types/canvas";
import {
  createEmptyTasks,
  createTask,
  taskListHasTasks,
  withTrailingEmptyRow,
} from "src/utils/taskList";

/**
 * Finite canvas in a 16:9 widescreen ratio (1920x1080 scaled 2.5x), sized so
 * several lists of 10 tasks each sit comfortably (a list is ~340px wide and
 * ~620px tall at zoom 1).
 */
export const CANVAS_WIDTH = 4800;
export const CANVAS_HEIGHT = 2700;

export const LIST_WIDTH = 340;
export const MIN_LIST_WIDTH = 260;
export const MAX_LIST_WIDTH = 960;

export function clampListWidth(width: number) {
  return clamp(width, MIN_LIST_WIDTH, MAX_LIST_WIDTH);
}

type Point = { x: number; y: number };

export function isCanvasBackgroundTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !target.closest("[data-canvas-item]") &&
    !target.closest("[data-canvas-ui]")
  );
}

/**
 * New list position for a move drag. Pointer deltas are in screen px and
 * must be divided by zoom to land in canvas coordinates.
 */
export function movedListPosition(
  startPosition: Point,
  startClient: Point,
  currentClient: Point,
  zoom: number
): Point {
  const safeZoom = zoom || 1;

  return {
    x: startPosition.x + (currentClient.x - startClient.x) / safeZoom,
    y: startPosition.y + (currentClient.y - startClient.y) / safeZoom,
  };
}

/** New list width for a right-edge resize drag, in canvas px (unclamped). */
export function resizedListWidth(
  startWidth: number,
  startClientX: number,
  currentClientX: number,
  zoom: number
): number {
  return startWidth + (currentClientX - startClientX) / (zoom || 1);
}
export const LIST_EDGE_MARGIN = 16;
/** Nominal height reserved when clamping a list near the bottom edge. */
export const LIST_MIN_VISIBLE_HEIGHT = 360;

export const MIN_ZOOM = 0.15;
export const MAX_ZOOM = 2;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function clampZoom(zoom: number) {
  return clamp(zoom, MIN_ZOOM, MAX_ZOOM);
}

export function clampListPosition(x: number, y: number, width = LIST_WIDTH) {
  const clampedWidth = clampListWidth(width);

  return {
    x: clamp(
      x,
      LIST_EDGE_MARGIN,
      CANVAS_WIDTH - clampedWidth - LIST_EDGE_MARGIN
    ),
    y: clamp(
      y,
      LIST_EDGE_MARGIN,
      CANVAS_HEIGHT - LIST_MIN_VISIBLE_HEIGHT - LIST_EDGE_MARGIN
    ),
  };
}

/**
 * Keeps the canvas covering the screen when zoomed in, and centers the
 * canvas on the axis where it is smaller than the screen.
 */
export function clampViewport(
  viewport: Viewport,
  viewWidth: number,
  viewHeight: number
): Viewport {
  const zoom = clampZoom(viewport.zoom);
  const scaledWidth = CANVAS_WIDTH * zoom;
  const scaledHeight = CANVAS_HEIGHT * zoom;

  return {
    zoom,
    x:
      scaledWidth <= viewWidth
        ? (viewWidth - scaledWidth) / 2
        : clamp(viewport.x, viewWidth - scaledWidth, 0),
    y:
      scaledHeight <= viewHeight
        ? (viewHeight - scaledHeight) / 2
        : clamp(viewport.y, viewHeight - scaledHeight, 0),
  };
}

export function createCenteredViewport(
  viewWidth: number,
  viewHeight: number
): Viewport {
  return clampViewport(
    {
      x: viewWidth / 2 - CANVAS_WIDTH / 2,
      y: viewHeight / 2 - CANVAS_HEIGHT / 2,
      zoom: 1,
    },
    viewWidth,
    viewHeight
  );
}

export function createTaskList(
  x: number,
  y: number,
  tag = "",
  tasks: Task[] = createEmptyTasks()
): TaskList {
  return {
    id: crypto.randomUUID(),
    tag,
    ...clampListPosition(x, y),
    tasks,
  };
}

export function listHasContent(list: TaskList): boolean {
  return list.tag.trim() !== "" || taskListHasTasks(list.tasks);
}

export function canvasHasContent(lists: TaskLists): boolean {
  return lists.some(listHasContent);
}

export function createCanvasCenterList(tasks?: Task[]): TaskList {
  return createTaskList(
    CANVAS_WIDTH / 2 - LIST_WIDTH / 2,
    CANVAS_HEIGHT / 2 - 280,
    "",
    tasks
  );
}

/**
 * Maps lists to render order plus stacking order for the canvas.
 *
 * Render order MUST stay stable while a list is being interacted with:
 * `bringListToFront` fires on pointerdown, and if it reordered DOM nodes
 * the browser would cancel the in-flight click, swallowing the first
 * press of any button inside the card. Stacking is therefore expressed
 * via `stackIndex` (z-index) while render order is keyed to list id.
 */
export function orderListsForRender(lists: TaskLists) {
  return lists
    .map((list, stackIndex) => ({ list, stackIndex }))
    .sort((a, b) => a.list.id.localeCompare(b.list.id));
}

const LEGACY_GENERAL_TASKS_STORAGE_KEY = "storedGeneralTasks";
const LEGACY_DAILY_TASKS_STORAGE_KEY = "storedDailyTasks";
/** Gap between the migrated general list and the migrated daily list. */
const LEGACY_DAILY_LIST_GAP = 24;

function readLegacyTasks(key: string): string[] | null {
  try {
    const item = window.localStorage.getItem(key);
    const legacyTasks: unknown = item ? JSON.parse(item) : null;

    if (
      Array.isArray(legacyTasks) &&
      legacyTasks.every((task) => typeof task === "string") &&
      legacyTasks.some((task) => task.trim() !== "")
    ) {
      return legacyTasks;
    }
  } catch (error) {
    console.warn(error);
  }

  return null;
}

export function buildListsFromLegacyTasks(
  generalTasks: string[] | null,
  dailyTasks: string[] | null
): TaskLists {
  const lists = [
    createCanvasCenterList(
      generalTasks
        ? withTrailingEmptyRow(generalTasks.map(createTask))
        : undefined
    ),
  ];

  if (dailyTasks) {
    lists.push(
      createTaskList(
        lists[0].x + LIST_WIDTH + LEGACY_DAILY_LIST_GAP,
        lists[0].y,
        "daily",
        withTrailingEmptyRow(dailyTasks.map(createTask))
      )
    );
  }

  return lists;
}

/**
 * First-run lists: migrates the pre-canvas v1 task lists when present,
 * otherwise starts with one empty list at the canvas center.
 */
export function buildInitialLists(): TaskLists {
  return buildListsFromLegacyTasks(
    readLegacyTasks(LEGACY_GENERAL_TASKS_STORAGE_KEY),
    readLegacyTasks(LEGACY_DAILY_TASKS_STORAGE_KEY)
  );
}
