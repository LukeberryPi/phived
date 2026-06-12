import type { MouseEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { CanvasControls } from "src/components/CanvasControls";
import { TaskListCard } from "src/components/TaskListCard";
import { CANVAS_LAYER_Z } from "src/constants/ui";
import { useCanvasTasksContext } from "src/contexts";
import { useCanvasViewport } from "src/hooks";
import { cn } from "src/utils";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  LIST_WIDTH,
  orderListsForRender,
} from "src/utils/canvas";

/** Vertical offset so a spawned list's header lands under the pointer. */
const SPAWN_HEADER_OFFSET = 22;
/** Cascade step so repeated "new list" clicks don't perfectly overlap. */
const SPAWN_CASCADE_STEP = 28;

export function CanvasBoard() {
  const {
    lists,
    addList,
    requestDeleteList,
    bringListToFront,
    moveList,
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
  } = useCanvasTasksContext();
  const boardRef = useRef<HTMLDivElement>(null);
  const {
    viewport,
    isPanning,
    zoomRef,
    screenToCanvas,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useCanvasViewport(boardRef);
  const [spawnedListId, setSpawnedListId] = useState<string | null>(null);
  const taskListActions = useMemo(
    () => ({
      requestDeleteList,
      bringListToFront,
      moveList,
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

  const spawnListAt = (canvasX: number, canvasY: number) => {
    setSpawnedListId(
      addList(canvasX - LIST_WIDTH / 2, canvasY - SPAWN_HEADER_OFFSET)
    );
  };

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;

    if (
      target instanceof Element &&
      (target.closest("[data-canvas-item]") ||
        target.closest("[data-canvas-ui]"))
    ) {
      return;
    }

    const point = screenToCanvas({ x: event.clientX, y: event.clientY });
    spawnListAt(point.x, point.y);
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

  return (
    <>
      <div
        ref={boardRef}
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
                actions={taskListActions}
              />
            ))}
          </div>
        )}
      </div>

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
