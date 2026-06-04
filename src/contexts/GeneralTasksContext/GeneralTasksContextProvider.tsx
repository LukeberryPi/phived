import type { PropsWithChildren } from "react";
import { useCallback } from "react";
import { toast } from "sonner";
import { incentives } from "src/content";
import { GeneralTasksContext } from "src/contexts/GeneralTasksContext/GeneralTasksContext";
import type { GeneralTask } from "src/contexts/GeneralTasksContext/GeneralTasksContext.types";
import { useLocalStorage } from "src/hooks";
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
  const [generalTasks, setGeneralTasks] = useLocalStorage(
    "storedGeneralTasks",
    createEmptyTasks()
  );
  const [taskHistory, setTaskHistory] = useLocalStorage<TaskHistory>(
    "taskHistory",
    []
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
      let completedText = "";

      setGeneralTasks((tasks) => {
        completedText = tasks[taskIndex]?.trim() ?? "";
        if (!completedText) {
          return tasks;
        }

        return [...tasks.filter((_, idx) => idx !== taskIndex), ""];
      });

      if (!completedText) {
        return;
      }

      setTaskHistory((history) => [
        {
          id: crypto.randomUUID(),
          text: completedText,
          completedAt: new Date().toISOString(),
        },
        ...history,
      ]);
      toast(getRandomElement(incentives));
    },
    [setGeneralTasks, setTaskHistory]
  );

  const restoreTaskFromHistory = useCallback(
    (entryId: string) => {
      const entry = taskHistory.find((item) => item.id === entryId);

      if (!entry) {
        return;
      }

      let restored = false;

      setGeneralTasks((tasks) => {
        if (!canAddAnotherTask(tasks)) {
          toast.error(TASK_LIST_FULL_MESSAGE);
          return tasks;
        }

        restored = true;
        const copy = [...tasks];
        copy[findFirstEmptyTaskIndex(tasks)] = entry.text;
        return copy;
      });

      if (!restored) {
        return;
      }

      setTaskHistory((history) =>
        history.filter((item) => item.id !== entryId)
      );
      toast("task restored!");
    },
    [setGeneralTasks, setTaskHistory, taskHistory]
  );

  const clearGeneralTasks = useCallback(() => {
    const isUserCertain = window.confirm(
      "Are you sure you want to DELETE all your tasks?"
    );

    if (!isUserCertain) {
      return;
    }

    setGeneralTasks(createEmptyTasks());
    toast("tasks cleared!");
  }, [setGeneralTasks]);

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
    </GeneralTasksContext.Provider>
  );
};
