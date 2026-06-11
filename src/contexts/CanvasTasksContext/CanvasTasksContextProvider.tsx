import type { PropsWithChildren } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { DeletionConfirmTarget } from "src/components/DeletionConfirmDialog";
import { DeletionConfirmDialog } from "src/components/DeletionConfirmDialog";
import { incentives } from "src/content";
import { CanvasTasksContext } from "src/contexts/CanvasTasksContext/CanvasTasksContext";
import { useLocalStorage } from "src/hooks";
import type { TaskList, TaskLists } from "src/types/canvas";
import type { TaskHistory } from "src/types/taskHistory";
import { countFilledTasks, getRandomElement } from "src/utils";
import {
  buildInitialLists,
  clampListPosition,
  createCanvasCenterList,
  createTaskList,
} from "src/utils/canvas";
import {
  findFirstEmptyTaskIndex,
  removeTaskRow,
  withTrailingEmptyRow,
} from "src/utils/taskList";

export const CanvasTasksContextProvider = ({ children }: PropsWithChildren) => {
  const initialLists = useMemo(buildInitialLists, []);
  const [lists, setLists] = useLocalStorage<TaskLists>(
    "canvasLists",
    initialLists
  );
  const [taskHistory, setTaskHistory] = useLocalStorage<TaskHistory>(
    "taskHistory",
    []
  );
  const [deletionConfirmTarget, setDeletionConfirmTarget] =
    useState<DeletionConfirmTarget | null>(null);

  const listsRef = useRef(lists);
  listsRef.current = lists;
  const historyRef = useRef(taskHistory);
  historyRef.current = taskHistory;

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
      const list = listsRef.current.find((item) => item.id === listId);

      if (!list) {
        return;
      }

      if (countFilledTasks(list.tasks) === 0) {
        setLists((prev) => prev.filter((item) => item.id !== listId));
        return;
      }

      setDeletionConfirmTarget({ kind: "list", listId });
    },
    [setLists]
  );

  const moveList = useCallback(
    (listId: string, x: number, y: number) => {
      updateList(listId, (list) => ({
        ...list,
        ...clampListPosition(x, y),
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
      updateList(listId, (list) => {
        const tasks = [...list.tasks];
        tasks[taskIndex] = newValue;
        return { ...list, tasks: withTrailingEmptyRow(tasks) };
      });
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
      updateList(listId, (list) => {
        const lastIndex = list.tasks.length - 1;

        if (
          fromIndex === toIndex ||
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex > lastIndex ||
          toIndex > lastIndex
        ) {
          return list;
        }

        const tasks = [...list.tasks];
        const [moved] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, moved);
        return { ...list, tasks };
      });
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
        updateList(targetList.id, (list) => {
          const tasks = [...list.tasks];
          const emptyIndex = findFirstEmptyTaskIndex(tasks);

          if (emptyIndex === -1) {
            tasks.push(entry.text);
          } else {
            tasks[emptyIndex] = entry.text;
          }

          return { ...list, tasks: withTrailingEmptyRow(tasks) };
        });
      } else {
        setLists([createCanvasCenterList(withTrailingEmptyRow([entry.text]))]);
      }

      setTaskHistory((prev) => prev.filter((item) => item.id !== entryId));
      toast("task restored!");
    },
    [updateList, setLists, setTaskHistory]
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
      setLists((prev) => prev.filter((list) => list.id !== listId));
      toast("list deleted!");
    }

    setDeletionConfirmTarget(null);
  }, [deletionConfirmTarget, setLists, setTaskHistory]);

  const value = useMemo(
    () => ({
      lists,
      taskHistory,
      addList,
      requestDeleteList,
      moveList,
      setListTag,
      changeTask,
      completeTask,
      reorderTask,
      moveTaskUp,
      moveTaskDown,
      restoreTaskFromHistory,
      clearCanvas,
      clearTaskHistory,
    }),
    [
      lists,
      taskHistory,
      addList,
      requestDeleteList,
      moveList,
      setListTag,
      changeTask,
      completeTask,
      reorderTask,
      moveTaskUp,
      moveTaskDown,
      restoreTaskFromHistory,
      clearCanvas,
      clearTaskHistory,
    ]
  );

  return (
    <CanvasTasksContext.Provider value={value}>
      {children}
      <DeletionConfirmDialog
        target={deletionConfirmTarget}
        onCancel={cancelDeletionConfirmation}
        onConfirm={confirmDeletion}
      />
    </CanvasTasksContext.Provider>
  );
};
