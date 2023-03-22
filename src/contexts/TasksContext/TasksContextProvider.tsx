import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TasksContext } from "src/contexts/TasksContext/TasksContext";
import type { Task } from "src/contexts/TasksContext/TasksContext.types";
import { useLocalStorage } from "src/hooks/useLocalStorage";

export const TasksContextProvider = ({ children }: PropsWithChildren) => {
  const [storedTasks, setStoredTasks] = useLocalStorage(
    "persistentTasks",
    Array<string>(5).fill("")
  );
  const [tasks, setTasks] = useState(storedTasks);

  const memoizedTasks = useMemo(() => tasks, [tasks]);

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
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};
