import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { incentives } from "src/content";
import { GeneralTasksContext } from "src/contexts/GeneralTasksContext/GeneralTasksContext";
import type { GeneralTask } from "src/contexts/GeneralTasksContext/GeneralTasksContext.types";
import { useLocalStorage, useTransientMessage } from "src/hooks";
import { getRandomElement } from "src/utils";

const EMPTY_TASKS = Array<string>(5).fill("");

export const GeneralTasksContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [storedGeneralTasks, setStoredGeneralTasks] = useLocalStorage(
    "storedGeneralTasks",
    EMPTY_TASKS
  );
  const [generalTasks, setGeneralTasks] = useState(storedGeneralTasks);
  const {
    message: generalMessage,
    setMessage: setGeneralMessage,
    displayMessage: displayGeneralMessage,
  } = useTransientMessage();

  const generalIncentive = useMemo(
    () => getRandomElement(incentives),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- new incentive when tasks change
    [generalTasks]
  );

  const changeGeneralTask = useCallback(
    (taskIndex: number, newValue: GeneralTask) => {
      setGeneralTasks((tasks) => {
        const copy = [...tasks];
        copy[taskIndex] = newValue;
        return copy;
      });
    },
    []
  );

  const completeGeneralTask = useCallback(
    (taskIndex: number) => {
      if (!generalTasks[taskIndex]) {
        return;
      }

      const ongoingTasks = generalTasks.filter((_, idx) => idx !== taskIndex);
      setGeneralTasks([...ongoingTasks, ""]);
      displayGeneralMessage(generalIncentive);
    },
    [displayGeneralMessage, generalIncentive, generalTasks]
  );

  const clearGeneralTasks = useCallback(() => {
    const isUserCertain = window.confirm(
      "Are you sure you want to DELETE all your tasks?"
    );

    if (!isUserCertain) {
      return;
    }

    setGeneralTasks(Array(5).fill(""));
    displayGeneralMessage("tasks cleared!");
  }, [displayGeneralMessage]);

  const moveTaskUp = useCallback((taskIndex: number) => {
    setGeneralTasks((tasks) => {
      const copy = [...tasks];
      const taskBefore = copy[taskIndex - 1];
      copy[taskIndex - 1] = copy[taskIndex];
      copy[taskIndex] = taskBefore;
      return copy;
    });
  }, []);

  const moveTaskDown = useCallback((taskIndex: number) => {
    setGeneralTasks((tasks) => {
      const copy = [...tasks];
      const taskAfter = copy[taskIndex + 1];
      copy[taskIndex + 1] = copy[taskIndex];
      copy[taskIndex] = taskAfter;
      return copy;
    });
  }, []);

  useEffect(() => {
    setStoredGeneralTasks(generalTasks);
  }, [generalTasks, setStoredGeneralTasks]);

  return (
    <GeneralTasksContext.Provider
      value={{
        changeGeneralTask,
        clearGeneralTasks,
        completeGeneralTask,
        moveTaskUp,
        moveTaskDown,
        displayGeneralMessage,
        generalTasks,
        generalMessage,
        setGeneralTasks,
        setGeneralMessage,
      }}
    >
      {children}
    </GeneralTasksContext.Provider>
  );
};
