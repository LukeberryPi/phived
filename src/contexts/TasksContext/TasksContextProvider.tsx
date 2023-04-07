import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { incentives } from "src/content";
import { TasksContext } from "src/contexts/TasksContext/TasksContext";
import type { Task } from "src/contexts/TasksContext/TasksContext.types";
import { useLocalStorage } from "src/hooks/useLocalStorage";

export const TasksContextProvider = ({ children }: PropsWithChildren) => {
  const [storedTasks, setStoredTasks] = useLocalStorage(
    "persistentTasks",
    Array<string>(5).fill("")
  );
  const [tasks, setTasks] = useState(storedTasks);
  const [incentiveMessage, setIncentiveMessage] = useState<string>("phived");
  const [timeoutId, setTimeoutId] = useState<undefined | NodeJS.Timeout>(undefined);

  const memoizedTasks = useMemo(() => tasks, [tasks]);

  const getRandomIncentive = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const incentive = useMemo(() => getRandomIncentive(incentives), [tasks]);

  const displayIncentiveMessage = useCallback(
    (incentive: string) => {
      setIncentiveMessage(incentive);
      clearTimeout(timeoutId);
      const newTimeoutId = setTimeout(() => {
        setIncentiveMessage("phived");
      }, 2000);

      setTimeoutId(newTimeoutId);
    },
    [timeoutId]
  );

  const changeTask = useCallback(
    (taskIndex: number, newValue: Task) => {
      const taskCopy = [...tasks];
      taskCopy[taskIndex] = newValue;

      setTasks(taskCopy);
    },
    [tasks, setTasks]
  );

  const completeTask = useCallback(
    (index: number) => {
      const ongoingTasks = tasks.filter((_, idx) => idx !== index);
      setTasks([...ongoingTasks, ""]);
      displayIncentiveMessage(incentive);
    },
    [tasks, setTasks]
  );

  const clearTasks = useCallback(() => {
    setTasks(Array(5).fill(""));
  }, [setTasks]);

  useEffect(() => {
    setStoredTasks(tasks);
  }, [tasks, setStoredTasks]);

  return (
    <TasksContext.Provider
      value={{
        tasks: memoizedTasks,
        setTasks,
        completeTask,
        changeTask,
        clearTasks,
        displayIncentiveMessage,
        incentiveMessage,
        setIncentiveMessage,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};
