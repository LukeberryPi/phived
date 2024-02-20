import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { incentives } from "src/content";
import { DailyTasksContext } from "src/contexts/DailyTasksContext/DailyTasksContext";
import type {
  DailyTask,
  DailyTasksLastDoneAt,
} from "src/contexts/DailyTasksContext/DailyTasksContext.types";
import { useLocalStorage } from "src/hooks/useLocalStorage";

export const DailyTasksContextProvider = ({ children }: PropsWithChildren) => {
  const [storedDailyTasks, setStoredDailyTasks] = useLocalStorage(
    "storedDailyTasks",
    Array<string>(5).fill("")
  );
  const [dailyTasksLastDoneAt, setDailyTasksLastDoneAt] =
    useLocalStorage<DailyTasksLastDoneAt>("dailyTasksLastDoneAt", []);
  const [dailyTasks, setDailyTasks] = useState(storedDailyTasks);
  const [dailyMessage, setDailyMessage] = useState<string>("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(
    undefined
  );

  const memoizedTasks = useMemo(() => dailyTasks, [dailyTasks]);

  const getRandomIncentive = (arr: string[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const incentive = useMemo(() => getRandomIncentive(incentives), [dailyTasks]);

  const displayDailyMessage = useCallback(
    (dailyMessage: string) => {
      setDailyMessage(dailyMessage);
      clearTimeout(timeoutId);
      const newTimeoutId = setTimeout(() => {
        setDailyMessage("");
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
    (taskIndex: number) => {
      if (!dailyTasks[taskIndex]) return;

      const ongoingTasks = dailyTasks.filter((_, idx) => idx !== taskIndex);
      setDailyTasksLastDoneAt([
        ...dailyTasksLastDoneAt,
        {
          dailyTask: dailyTasks[taskIndex],
          dateCompleted: new Date(),
        },
      ]);
      setDailyTasks([...ongoingTasks]);
      displayDailyMessage(incentive);
    },
    [
      displayDailyMessage,
      incentive,
      dailyTasks,
      setDailyTasks,
      dailyTasksLastDoneAt,
      setDailyTasksLastDoneAt,
    ]
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
  }, [displayDailyMessage, setDailyTasks, setDailyTasksLastDoneAt]);

  useEffect(() => {
    setStoredDailyTasks(dailyTasks);
  }, [dailyTasks, setStoredDailyTasks]);

  return (
    <DailyTasksContext.Provider
      value={{
        changeDailyTask,
        clearDailyTasks,
        completeDailyTask,
        dailyTasks: memoizedTasks,
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
