import type { PropsWithChildren } from "react";
import { useCallback, useState } from "react";
import type { DeletionConfirmTarget } from "src/components/DeletionConfirmDialog";
import { DeletionConfirmDialog } from "src/components/DeletionConfirmDialog";
import { toast } from "sonner";
import { incentives } from "src/content";
import { GeneralTasksContext } from "src/contexts/GeneralTasksContext/GeneralTasksContext";
import type { GeneralTask } from "src/contexts/GeneralTasksContext/GeneralTasksContext.types";
import { useLocalStorage, useMutateTaskStore } from "src/hooks";
import type { TaskHistory } from "src/types/taskHistory";
import { getRandomElement } from "src/utils";
import {
  canAddAnotherTask,
  createEmptyTasks,
  findFirstEmptyTaskIndex,
  MAX_ACTIVE_TASKS,
} from "src/utils/taskList";

const TASK_LIST_FULL_MESSAGE = `can't restore — you already have ${MAX_ACTIVE_TASKS} tasks! complete one first.`;

export const GeneralTasksContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [deletionConfirmTarget, setDeletionConfirmTarget] =
    useState<DeletionConfirmTarget | null>(null);
  const [generalTasks, setGeneralTasks] = useLocalStorage(
    "storedGeneralTasks",
    createEmptyTasks()
  );
  const [taskHistory, setTaskHistory] = useLocalStorage<TaskHistory>(
    "taskHistory",
    []
  );
  const mutateTaskStore = useMutateTaskStore(
    generalTasks,
    taskHistory,
    setGeneralTasks,
    setTaskHistory
  );

  const changeGeneralTask = useCallback(
    (taskIndex: number, newValue: GeneralTask) => {
      setGeneralTasks((tasks) => {
        const copy = [...tasks];
        copy[taskIndex] = newValue;
        return copy;
      });
    },
    [setGeneralTasks]
  );

  const completeGeneralTask = useCallback(
    (taskIndex: number) => {
      const result = mutateTaskStore(({ tasks, history }) => {
        const completedText = tasks[taskIndex]?.trim() ?? "";

        if (!completedText) {
          return { ok: false, reason: "unchanged" };
        }

        return {
          ok: true,
          tasks: [...tasks.filter((_, idx) => idx !== taskIndex), ""],
          history: [
            {
              id: crypto.randomUUID(),
              text: completedText,
              completedAt: new Date().toISOString(),
            },
            ...history,
          ],
        };
      });

      if (result.ok) {
        toast(getRandomElement(incentives));
      }
    },
    [mutateTaskStore]
  );

  const restoreTaskFromHistory = useCallback(
    (entryId: string) => {
      const result = mutateTaskStore(({ tasks, history }) => {
        const entry = history.find((item) => item.id === entryId);

        if (!entry) {
          return { ok: false, reason: "not_found" };
        }

        if (!canAddAnotherTask(tasks)) {
          return { ok: false, reason: "full" };
        }

        const copy = [...tasks];
        copy[findFirstEmptyTaskIndex(tasks)] = entry.text;

        return {
          ok: true,
          tasks: copy,
          history: history.filter((item) => item.id !== entryId),
        };
      });

      if (!result.ok && result.reason === "full") {
        toast.error(TASK_LIST_FULL_MESSAGE);
        return;
      }

      if (result.ok) {
        toast("task restored!");
      }
    },
    [mutateTaskStore]
  );

  const cancelDeletionConfirmation = useCallback(() => {
    setDeletionConfirmTarget(null);
  }, []);

  const confirmDeletion = useCallback(() => {
    if (deletionConfirmTarget === "tasks") {
      setGeneralTasks(createEmptyTasks());
      toast("tasks cleared!");
    }

    if (deletionConfirmTarget === "history") {
      setTaskHistory([]);
      toast("history cleared!");
    }

    setDeletionConfirmTarget(null);
  }, [deletionConfirmTarget, setGeneralTasks, setTaskHistory]);

  const clearGeneralTasks = useCallback(() => {
    setDeletionConfirmTarget("tasks");
  }, []);

  const clearTaskHistory = useCallback(() => {
    setDeletionConfirmTarget("history");
  }, []);

  const moveTaskUp = useCallback(
    (taskIndex: number) => {
      setGeneralTasks((tasks) => {
        const copy = [...tasks];
        const taskBefore = copy[taskIndex - 1];
        copy[taskIndex - 1] = copy[taskIndex];
        copy[taskIndex] = taskBefore;
        return copy;
      });
    },
    [setGeneralTasks]
  );

  const moveTaskDown = useCallback(
    (taskIndex: number) => {
      setGeneralTasks((tasks) => {
        const copy = [...tasks];
        const taskAfter = copy[taskIndex + 1];
        copy[taskIndex + 1] = copy[taskIndex];
        copy[taskIndex] = taskAfter;
        return copy;
      });
    },
    [setGeneralTasks]
  );

  return (
    <GeneralTasksContext.Provider
      value={{
        changeGeneralTask,
        clearGeneralTasks,
        clearTaskHistory,
        completeGeneralTask,
        moveTaskUp,
        moveTaskDown,
        restoreTaskFromHistory,
        generalTasks,
        taskHistory,
        setGeneralTasks,
      }}
    >
      {children}
      <DeletionConfirmDialog
        target={deletionConfirmTarget}
        onCancel={cancelDeletionConfirmation}
        onConfirm={confirmDeletion}
      />
    </GeneralTasksContext.Provider>
  );
};
