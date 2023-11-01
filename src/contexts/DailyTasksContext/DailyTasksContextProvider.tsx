import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { incentives } from "src/content";
import { DailyTasksContext } from "src/contexts/DailyTasksContext/DailyTasksContext";
import type { DailyTask } from "src/contexts/DailyTasksContext/DailyTasksContext.types";
import { useLocalStorage } from "src/hooks/useLocalStorage";

export const DailyTasksContextProvider = ({ children }: PropsWithChildren) => {
  const [storedDailyTasks, setStoredDailyTasks] = useLocalStorage(
    "storedDailyTasks",
    Array<string>(5).fill("")
  );
  const [dailyTasks, setDailyTasks] = useState(storedDailyTasks);
  const [message, setMessage] = useState<string>("");
  const [timeoutId, setTimeoutId] = useState<undefined | NodeJS.Timeout>(undefined);

  const memoizedTasks = useMemo(() => dailyTasks, [dailyTasks]);

  const getRandomIncentive = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const incentive = useMemo(() => getRandomIncentive(incentives), [dailyTasks]);

  const displayMessage = useCallback(
    (message: string) => {
      setMessage(message);
      clearTimeout(timeoutId);
      const newTimeoutId = setTimeout(() => {
        setMessage("");
      }, 4000);

      setTimeoutId(newTimeoutId);
    },
    [timeoutId]
  );

  const changeDailyTask = useCallback(
    (taskIndex: number, newValue: DailyTask) => {
      const dailyTaskCopy = [...dailyTasks];
      dailyTaskCopy[taskIndex] = newValue;

      setDailyTasks(dailyTaskCopy);
    },
    [dailyTasks, setDailyTasks]
  );

  const completeDailyTask = useCallback(
    (index: number) => {
      if (!dailyTasks[index]) return;

      const ongoingTasks = dailyTasks.filter((_, idx) => idx !== index);
      setDailyTasks([...ongoingTasks, ""]);
      displayMessage(incentive);
    },
    [displayMessage, incentive, dailyTasks, setDailyTasks]
  );

  const clearDailyTasks = useCallback(() => {
    const isUserCertain = window.confirm("Are you sure you want to DELETE all your tasks?");

    if (!isUserCertain) {
      return;
    }

    setDailyTasks(Array(5).fill(""));
    displayMessage("tasks cleared!");
  }, [displayMessage, setDailyTasks]);

  useEffect(() => {
    setStoredDailyTasks(dailyTasks);
  }, [dailyTasks, setStoredDailyTasks]);

  return (
    <DailyTasksContext.Provider
      value={{
        dailyTasks: memoizedTasks,
        setDailyTasks,
        completeDailyTask,
        changeDailyTask,
        clearDailyTasks,
        displayMessage,
        message,
        setMessage,
      }}
    >
      {children}
    </DailyTasksContext.Provider>
  );
};
