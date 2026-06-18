import type { PropsWithChildren } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "src/auth/AuthContext";
import { Button } from "src/components/Button";
import type { DeletionConfirmTarget } from "src/components/DeletionConfirmDialog";
import { DeletionConfirmDialog } from "src/components/DeletionConfirmDialog";
import { incentives } from "src/content";
import { CanvasTasksContext } from "src/contexts/CanvasTasksContext/CanvasTasksContext";
import { useLocalStorage } from "src/hooks";
import { useTaskSync } from "src/sync/useTaskSync";
import type { TaskList, TaskLists } from "src/types/canvas";
import type { TaskHistory } from "src/types/taskHistory";
import { countFilledTasks, getRandomElement } from "src/utils";
import { parseTaskHistory, parseTaskLists } from "src/utils/persistence";
import {
  buildInitialLists,
  clampListPosition,
  clampListWidth,
  createCanvasCenterList,
  createTaskList,
  listHasContent,
} from "src/utils/canvas";
import {
  addEmptyTaskRow,
  changeTaskAt,
  insertEmptyTaskRowAbove,
  insertEmptyTaskRowBelow,
  removeEmptyExtraRow,
  removeTaskRow,
  reorderTaskRows,
  restoreTaskText,
} from "src/utils/taskList";

export const CanvasTasksContextProvider = ({ children }: PropsWithChildren) => {
  const { mode } = useAuth();
  const initialLists = useMemo(buildInitialLists, []);
  const [lists, setLists] = useLocalStorage<TaskLists>(
    "canvasLists",
    initialLists,
    parseTaskLists
  );
  const [taskHistory, setTaskHistory] = useLocalStorage<TaskHistory>(
    "taskHistory",
    [],
    parseTaskHistory
  );
  const [deletionConfirmTarget, setDeletionConfirmTarget] =
    useState<DeletionConfirmTarget | null>(null);

  const listsRef = useRef(lists);
  listsRef.current = lists;
  const historyRef = useRef(taskHistory);
  historyRef.current = taskHistory;

  useTaskSync({
    mode,
    lists,
    taskHistory,
    setLists,
    setTaskHistory,
  });

  const updateList = useCallback(
    (listId: string, updater: (list: TaskList) => TaskList) => {
      setLists((prev) =>
        prev.map((list) => (list.id === listId ? updater(list) : list))
      );
    },
    [setLists]
  );

  const addList = useCallback(
    (x: number, y: number) => {
      const list = createTaskList(x, y);
      setLists((prev) => [...prev, list]);
      return list.id;
    },
    [setLists]
  );

  const requestDeleteList = useCallback(
    (listId: string) => {
      const currentLists = listsRef.current;

      if (currentLists.length <= 1) {
        return;
      }

      const list = currentLists.find((item) => item.id === listId);

      if (!list) {
        return;
      }

      const taskCount = countFilledTasks(list.tasks);

      if (!listHasContent(list)) {
        setLists((prev) =>
          prev.length <= 1 ? prev : prev.filter((item) => item.id !== listId)
        );
        return;
      }

      setDeletionConfirmTarget({
        kind: "list",
        listId,
        tag: list.tag.trim() || undefined,
        taskCount,
      });
    },
    [setLists]
  );

  const bringListToFront = useCallback(
    (listId: string) => {
      setLists((prev) => {
        const index = prev.findIndex((list) => list.id === listId);

        if (index === -1 || index === prev.length - 1) {
          return prev;
        }

        const next = [...prev];
        const [list] = next.splice(index, 1);
        next.push(list);
        return next;
      });
    },
    [setLists]
  );

  const moveList = useCallback(
    (listId: string, x: number, y: number) => {
      updateList(listId, (list) => ({
        ...list,
        ...clampListPosition(x, y, list.width),
      }));
    },
    [updateList]
  );

  const resizeList = useCallback(
    (listId: string, width: number) => {
      updateList(listId, (list) => ({
        ...list,
        width: clampListWidth(width),
      }));
    },
    [updateList]
  );

  const setListTag = useCallback(
    (listId: string, tag: string) => {
      updateList(listId, (list) => ({ ...list, tag }));
    },
    [updateList]
  );

  const changeTask = useCallback(
    (listId: string, taskIndex: number, newValue: string) => {
      updateList(listId, (list) => ({
        ...list,
        tasks: changeTaskAt(list.tasks, taskIndex, newValue),
      }));
    },
    [updateList]
  );

  const addTaskRow = useCallback(
    (listId: string) => {
      updateList(listId, (list) => ({
        ...list,
        tasks: addEmptyTaskRow(list.tasks),
      }));
    },
    [updateList]
  );

  const insertTaskRowBelow = useCallback(
    (listId: string, taskIndex: number) => {
      updateList(listId, (list) => ({
        ...list,
        tasks: insertEmptyTaskRowBelow(list.tasks, taskIndex),
      }));
    },
    [updateList]
  );

  const insertTaskRowAbove = useCallback(
    (listId: string, taskIndex: number) => {
      updateList(listId, (list) => ({
        ...list,
        tasks: insertEmptyTaskRowAbove(list.tasks, taskIndex),
      }));
    },
    [updateList]
  );

  const removeEmptyTaskRow = useCallback(
    (listId: string, taskIndex: number) => {
      updateList(listId, (list) => ({
        ...list,
        tasks: removeEmptyExtraRow(list.tasks, taskIndex),
      }));
    },
    [updateList]
  );

  const completeTask = useCallback(
    (listId: string, taskIndex: number) => {
      const list = listsRef.current.find((item) => item.id === listId);
      const completedText = list?.tasks[taskIndex]?.trim() ?? "";

      if (!list || !completedText) {
        return;
      }

      updateList(listId, (item) => ({
        ...item,
        tasks: removeTaskRow(item.tasks, taskIndex),
      }));
      setTaskHistory((prev) => [
        {
          id: crypto.randomUUID(),
          text: completedText,
          completedAt: new Date().toISOString(),
          listId,
          listTag: list.tag.trim() || undefined,
        },
        ...prev,
      ]);
      toast(getRandomElement(incentives));
    },
    [updateList, setTaskHistory]
  );

  const reorderTask = useCallback(
    (listId: string, fromIndex: number, toIndex: number) => {
      updateList(listId, (list) => ({
        ...list,
        tasks: reorderTaskRows(list.tasks, fromIndex, toIndex),
      }));
    },
    [updateList]
  );

  const moveTaskUp = useCallback(
    (listId: string, taskIndex: number) => {
      reorderTask(listId, taskIndex, taskIndex - 1);
    },
    [reorderTask]
  );

  const moveTaskDown = useCallback(
    (listId: string, taskIndex: number) => {
      reorderTask(listId, taskIndex, taskIndex + 1);
    },
    [reorderTask]
  );

  const restoreTaskFromHistory = useCallback(
    (entryId: string) => {
      const entry = historyRef.current.find((item) => item.id === entryId);

      if (!entry) {
        return;
      }

      const currentLists = listsRef.current;
      const targetList =
        currentLists.find((list) => list.id === entry.listId) ??
        currentLists[0];

      if (targetList) {
        updateList(targetList.id, (list) => ({
          ...list,
          tasks: restoreTaskText(list.tasks, entry.text),
        }));
      } else {
        setLists([createCanvasCenterList(restoreTaskText([], entry.text))]);
      }

      setTaskHistory((prev) => prev.filter((item) => item.id !== entryId));
      toast("task restored!");
    },
    [updateList, setLists, setTaskHistory]
  );

  const deleteTaskFromHistory = useCallback(
    (entryId: string) => {
      setTaskHistory((prev) => prev.filter((item) => item.id !== entryId));
      toast("history entry deleted!");
    },
    [setTaskHistory]
  );

  const clearCanvas = useCallback(() => {
    setDeletionConfirmTarget({ kind: "canvas" });
  }, []);

  const clearTaskHistory = useCallback(() => {
    setDeletionConfirmTarget({ kind: "history" });
  }, []);

  const cancelDeletionConfirmation = useCallback(() => {
    setDeletionConfirmTarget(null);
  }, []);

  const confirmDeletion = useCallback(() => {
    if (!deletionConfirmTarget) {
      return;
    }

    if (deletionConfirmTarget.kind === "canvas") {
      setLists([createCanvasCenterList()]);
      toast("canvas cleared!");
    }

    if (deletionConfirmTarget.kind === "history") {
      setTaskHistory([]);
      toast("history cleared!");
    }

    if (deletionConfirmTarget.kind === "list") {
      const { listId } = deletionConfirmTarget;

      if (listsRef.current.length > 1) {
        setLists((prev) => prev.filter((list) => list.id !== listId));
        toast("list deleted!");
      }
    }

    setDeletionConfirmTarget(null);
  }, [deletionConfirmTarget, setLists, setTaskHistory]);

  const value = useMemo(
    () => ({
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
      restoreTaskFromHistory,
      deleteTaskFromHistory,
      clearCanvas,
      clearTaskHistory,
    }),
    [
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
      restoreTaskFromHistory,
      deleteTaskFromHistory,
      clearCanvas,
      clearTaskHistory,
    ]
  );

  return (
    <CanvasTasksContext.Provider value={value}>
      <SyncModeBanner />
      {children}
      <DeletionConfirmDialog
        target={deletionConfirmTarget}
        onCancel={cancelDeletionConfirmation}
        onConfirm={confirmDeletion}
      />
    </CanvasTasksContext.Provider>
  );
};

function SyncModeBanner() {
  const { mode, signIn, checkout } = useAuth();

  if (mode === "free" || mode === "pro") {
    return null;
  }

  const isReauth = mode === "reauth";

  return (
    <div className="dark:border-edge-dark dark:bg-surface-dark pointer-events-auto fixed top-20 left-1/2 z-50 w-[min(92vw,34rem)] -translate-x-1/2 border border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_var(--color-edge-dark)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="normal-case">
          {isReauth
            ? "session expired - saving locally only until you sign in again."
            : "saving locally only - resume pro to sync this browser."}
        </span>
        <Button
          variant="ghost"
          className="h-8 bg-sky-300 px-3 text-sm font-normal dark:bg-cyan-800"
          onClick={() => (isReauth ? void signIn() : void checkout("monthly"))}
        >
          {isReauth ? "sign in" : "resume pro"}
        </Button>
      </div>
    </div>
  );
}
