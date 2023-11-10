import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { incentives } from "src/content";
import { GeneralTasksContext } from "src/contexts/GeneralTasksContext/GeneralTasksContext";
import type { GeneralTask } from "src/contexts/GeneralTasksContext/GeneralTasksContext.types";
import { useLocalStorage } from "src/hooks/useLocalStorage";

export const GeneralTasksContextProvider = ({ children }: PropsWithChildren) => {
  const [storedGeneralTasks, setStoredGeneralTasks] = useLocalStorage(
    "storedGeneralTasks",
    Array<string>(5).fill("")
  );
  const [generalTasks, setGeneralTasks] = useState(storedGeneralTasks);
  const [message, setMessage] = useState<string>("");
  const [timeoutId, setTimeoutId] = useState<undefined | NodeJS.Timeout>(undefined);

  const memoizedTasks = useMemo(() => generalTasks, [generalTasks]);

  const getRandomIncentive = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const incentive = useMemo(() => getRandomIncentive(incentives), [generalTasks]);

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

  const changeGeneralTask = useCallback(
    (taskIndex: number, newValue: GeneralTask) => {
      const generalTaskCopy = [...generalTasks];
      generalTaskCopy[taskIndex] = newValue;

      setGeneralTasks(generalTaskCopy);
    },
    [generalTasks, setGeneralTasks]
  );

  const completeGeneralTask = useCallback(
    (taskIndex: number) => {
      if (!generalTasks[taskIndex]) return;

      const ongoingTasks = generalTasks.filter((_, idx) => idx !== taskIndex);
      setGeneralTasks([...ongoingTasks, ""]);
      displayMessage(incentive);
    },
    [displayMessage, incentive, generalTasks, setGeneralTasks]
  );

  const clearGeneralTasks = useCallback(() => {
    const isUserCertain = window.confirm("Are you sure you want to DELETE all your tasks?");

    if (!isUserCertain) {
      return;
    }

    setGeneralTasks(Array(5).fill(""));
    displayMessage("tasks cleared!");
  }, [displayMessage, setGeneralTasks]);

  useEffect(() => {
    setStoredGeneralTasks(generalTasks);
  }, [generalTasks, setStoredGeneralTasks]);

  return (
    <GeneralTasksContext.Provider
      value={{
        changeGeneralTask,
        clearGeneralTasks,
        completeGeneralTask,
        displayMessage,
        generalTasks: memoizedTasks,
        message,
        setGeneralTasks,
        setMessage,
      }}
    >
      {children}
    </GeneralTasksContext.Provider>
  );
};
