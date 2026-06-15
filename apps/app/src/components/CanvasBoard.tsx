import type { MouseEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CanvasControls } from "src/components/CanvasControls";
import { CanvasContextMenu } from "src/components/CanvasContextMenu";
import type { FocusListOption } from "src/components/CanvasContextMenu";
import { TaskListCard } from "src/components/TaskListCard";
import { CANVAS_LAYER_Z } from "src/constants/ui";
import { useCanvasTasksContext } from "src/contexts";
import { useCanvasViewport, useClearCanvasAction } from "src/hooks";
import { cn, exportCanvas } from "src/utils";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  LIST_MIN_VISIBLE_HEIGHT,
  LIST_WIDTH,
  canvasHasContent,
  isCanvasBackgroundTarget,
  orderListsForRender,
} from "src/utils/canvas";

/** Vertical offset so a spawned list's header lands under the pointer. */
const SPAWN_HEADER_OFFSET = 22;
/** Cascade step so repeated "new list" clicks don't perfectly overlap. */
const SPAWN_CASCADE_STEP = 28;

function isCanvasContextMenuTarget(
  target: EventTarget | null,
  hasFocusedList: boolean
) {
  if (isCanvasBackgroundTarget(target)) {
    return true;
  }

  if (!hasFocusedList || !(target instanceof Element)) {
    return false;
  }

  const canvasItem = target.closest("[data-canvas-item]");
  return canvasItem !== null && !canvasItem.hasAttribute("data-canvas-focused");
}

export function CanvasBoard() {
  const {
    lists,
    taskHistory,
    addList,
    requestDeleteList,
    bringListToFront,
    moveList,
    resizeList,
    setListTag,
    changeTask,
    addTaskRow,
    insertTaskRowBelow,
    insertTaskRowAbove,
    removeEmptyTaskRow,
    completeTask,
    reorderTask,
    moveTaskUp,
    moveTaskDown,
    clearTaskHistory,
  } = useCanvasTasksContext();
  const { clear: clearCanvas } = useClearCanvasAction();
  const boardRef = useRef<HTMLDivElement>(null);
  const contextMenuPointRef = useRef<{ x: number; y: number } | null>(null);
  const {
    viewport,
    isPanning,
    zoomRef,
    screenToCanvas,
    zoomIn,
    zoomOut,
    resetZoom,
    centerCanvasPoint,
  } = useCanvasViewport(boardRef);
  const [spawnedListId, setSpawnedListId] = useState<string | null>(null);
  const [focusedListId, setFocusedListId] = useState<string | null>(null);
  // Ignore stale focus if the focused list was deleted.
  const activeFocusId = lists.some((list) => list.id === focusedListId)
    ? focusedListId
    : null;
  const taskListActions = useMemo(
    () => ({
      requestDeleteList,
      bringListToFront,
      moveList,
      resizeList,
      setListTag,
      changeTask,
      addTaskRow,
      insertTaskRowBelow,
      insertTaskRowAbove,
      removeEmptyTaskRow,
      completeTask,
      reorderTask,
      moveTaskUp,
      moveTaskDown,
    }),
    [
      requestDeleteList,
      bringListToFront,
      moveList,
      resizeList,
      setListTag,
      changeTask,
      addTaskRow,
      insertTaskRowBelow,
      insertTaskRowAbove,
      removeEmptyTaskRow,
      completeTask,
      reorderTask,
      moveTaskUp,
      moveTaskDown,
    ]
  );
  const focusListOptions = useMemo<FocusListOption[]>(
    () =>
      lists
        .map((list, index) => ({
          id: list.id,
          label: list.tag.trim() || `untagged list ${index + 1}`,
          tagged: list.tag.trim() !== "",
          index,
        }))
        .sort((a, b) => {
          if (a.tagged !== b.tagged) {
            return a.tagged ? -1 : 1;
          }

          if (!a.tagged) {
            return a.index - b.index;
          }

          return a.label.localeCompare(b.label);
        })
        .map(({ id, label }) => ({ id, label })),
    [lists]
  );

  const spawnListAt = (canvasX: number, canvasY: number) => {
    setSpawnedListId(
      addList(canvasX - LIST_WIDTH / 2, canvasY - SPAWN_HEADER_OFFSET)
    );
  };

  const handleNewList = () => {
    const board = boardRef.current;

    if (!board) {
      return;
    }

    const rect = board.getBoundingClientRect();
    const center = screenToCanvas({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    const cascade = (lists.length % 5) * SPAWN_CASCADE_STEP;
    spawnListAt(center.x + cascade, center.y + cascade);
  };

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!isCanvasBackgroundTarget(event.target)) {
      return;
    }

    const point = screenToCanvas({ x: event.clientX, y: event.clientY });
    spawnListAt(point.x, point.y);
  };

  const handleNewListHere = () => {
    const point = contextMenuPointRef.current;

    if (!point) {
      handleNewList();
      return;
    }

    spawnListAt(point.x, point.y);
  };

  const handleExport = (format: "md" | "json") => {
    exportCanvas(format, lists, taskHistory);
    toast(`exported canvas as .${format}`);
  };

  const handleFocusList = (listId: string) => {
    const list = lists.find((candidate) => candidate.id === listId);

    if (!list) {
      return;
    }

    setFocusedListId(list.id);
    centerCanvasPoint({
      x: list.x + (list.width ?? LIST_WIDTH) / 2,
      y: list.y + LIST_MIN_VISIBLE_HEIGHT / 2,
    });
  };

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    if (!isCanvasContextMenuTarget(event.target, activeFocusId !== null)) {
      contextMenuPointRef.current = null;
      return;
    }

    contextMenuPointRef.current = screenToCanvas({
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <>
      <CanvasContextMenu
        focusListOptions={focusListOptions}
        focusedListId={activeFocusId}
        onNewListHere={handleNewListHere}
        onFocusList={handleFocusList}
        onRemoveFocus={() => setFocusedListId(null)}
        onExport={handleExport}
        onClearHistory={clearTaskHistory}
        onClearCanvas={clearCanvas}
        clearHistoryDisabled={taskHistory.length === 0}
        clearCanvasDisabled={!canvasHasContent(lists)}
      >
        <div
          ref={boardRef}
          onContextMenu={handleContextMenu}
          onDoubleClick={handleDoubleClick}
          aria-label="task canvas"
          className={cn(
            CANVAS_LAYER_Z,
            "fixed inset-0 touch-none overflow-hidden",
            "bg-zinc-200 dark:bg-black",
            isPanning ? "cursor-grabbing select-none" : "cursor-grab"
          )}
        >
          {viewport && (
            <div
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                transformOrigin: "0 0",
              }}
              className={cn(
                "border-line-light bg-canvas-light absolute top-0 left-0 border-2",
                "dark:border-edge-dark dark:bg-canvas-dark",
                "bg-[radial-gradient(circle,rgb(0_0_0/0.12)_1.5px,transparent_1.5px)]",
                "dark:bg-[radial-gradient(circle,rgb(226_229_234/0.07)_1.5px,transparent_1.5px)]",
                "[background-size:32px_32px]"
              )}
            >
              {orderListsForRender(lists).map(({ list, stackIndex }) => (
                <TaskListCard
                  key={list.id}
                  list={list}
                  stackIndex={stackIndex}
                  zoomRef={zoomRef}
                  autoFocusFirstRow={list.id === spawnedListId}
                  focused={list.id === activeFocusId}
                  dimmed={activeFocusId !== null && list.id !== activeFocusId}
                  onToggleFocus={() =>
                    setFocusedListId((current) =>
                      current === list.id ? null : list.id
                    )
                  }
                  actions={taskListActions}
                />
              ))}
            </div>
          )}
        </div>
      </CanvasContextMenu>

      <CanvasControls
        zoom={viewport?.zoom ?? 1}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onNewList={handleNewList}
      />
    </>
  );
}
