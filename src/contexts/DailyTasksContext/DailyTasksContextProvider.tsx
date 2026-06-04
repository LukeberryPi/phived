import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { incentives } from "src/content";
import { DailyTasksContext } from "src/contexts/DailyTasksContext/DailyTasksContext";
import type {
  DailyTask,
  DailyTasksLastDoneAt,
} from "src/contexts/DailyTasksContext/DailyTasksContext.types";
import { useLocalStorage, useTransientMessage } from "src/hooks";
import { getRandomElement } from "src/utils";

const EMPTY_TASKS = Array<string>(5).fill("");

export const DailyTasksContextProvider = ({ children }: PropsWithChildren) => {
  const [storedDailyTasks, setStoredDailyTasks] = useLocalStorage(
    "storedDailyTasks",
    EMPTY_TASKS
  );
  const [dailyTasksLastDoneAt, setDailyTasksLastDoneAt] =
    useLocalStorage<DailyTasksLastDoneAt>("dailyTasksLastDoneAt", []);
  const [dailyTasks, setDailyTasks] = useState(storedDailyTasks);
  const {
    message: dailyMessage,
    setMessage: setDailyMessage,
    displayMessage: displayDailyMessage,
  } = useTransientMessage();

  const incentive = useMemo(
    () => getRandomElement(incentives),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- new incentive when tasks change
    [dailyTasks]
  );

  const changeDailyTask = useCallback(
    (taskIndex: number, newValue: DailyTask) => {
      setDailyTasks((tasks) => {
        const copy = [...tasks];
        copy[taskIndex] = newValue;
        return copy;
      });
    },
    []
  );

  const completeDailyTask = useCallback(
    (taskIndex: number) => {
      if (!dailyTasks[taskIndex]) {
        return;
      }

      setDailyTasksLastDoneAt((completed) => [
        ...completed,
        {
          dailyTask: dailyTasks[taskIndex],
          dateCompleted: new Date(),
        },
      ]);
      setDailyTasks(dailyTasks.filter((_, idx) => idx !== taskIndex));
      displayDailyMessage(incentive);
    },
    [dailyTasks, displayDailyMessage, incentive, setDailyTasksLastDoneAt]
  );

  const clearDailyTasks = useCallback(() => {
    const isUserCertain = window.confirm(
      "Are you sure you want to DELETE all your daily tasks? You will be unable to restore your previous completed daily tasks."
    );

    if (!isUserCertain) {
      return;
    }

    setDailyTasks(Array(5).fill(""));
    setDailyTasksLastDoneAt([]);
    displayDailyMessage("daily tasks cleared!");
  }, [displayDailyMessage, setDailyTasksLastDoneAt]);

  useEffect(() => {
    setStoredDailyTasks(dailyTasks);
  }, [dailyTasks, setStoredDailyTasks]);

  const moveTaskUp = useCallback((taskIndex: number) => {
    setDailyTasks((tasks) => {
      const copy = [...tasks];
      const taskBefore = copy[taskIndex - 1];
      copy[taskIndex - 1] = copy[taskIndex];
      copy[taskIndex] = taskBefore;
      return copy;
    });
  }, []);

  const moveTaskDown = useCallback((taskIndex: number) => {
    setDailyTasks((tasks) => {
      const copy = [...tasks];
      const taskAfter = copy[taskIndex + 1];
      copy[taskIndex + 1] = copy[taskIndex];
      copy[taskIndex] = taskAfter;
      return copy;
    });
  }, []);

  return (
    <DailyTasksContext.Provider
      value={{
        changeDailyTask,
        clearDailyTasks,
        completeDailyTask,
        moveTaskUp,
        moveTaskDown,
        dailyTasks,
        dailyTasksLastDoneAt,
        displayDailyMessage,
        dailyMessage,
        setDailyTasks,
        setDailyTasksLastDoneAt,
        setDailyMessage,
      }}
    >
      {children}
    </DailyTasksContext.Provider>
  );
};
