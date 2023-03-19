import { PropsWithChildren, useEffect, useState } from "react"
import { TasksContext, initialState } from "./TasksContext"
import { Tasks, TasksContextTypes } from "./TasksContext.types";
import { useLocalStorage } from "src/hooks";

export const TasksContextProvider = ({ children }: PropsWithChildren) => {
  const [ storedTasks, setStoredTasks ] = useLocalStorage("persistentTasks", initialState.tasks);
  const [tasks, setTasks] = useState(storedTasks);

  const changeTask: TasksContextTypes['changeTask'] = (taskIndex, newValue) => {
    const taskCopy = [...tasks];
    const newTasklist = taskCopy.map((task, index) =>
      (index === taskIndex) ? newValue : task
    );

    setTasks(newTasklist as Tasks);
  }

  const resetTasks: TasksContextTypes['resetTasks'] = (index) => {
    if(index !== undefined) {
      const ongoingTasks = tasks.filter((_, idx) => idx !== index);
      setTasks([...ongoingTasks, ""] as Tasks);
    } else {
      setTasks(initialState.tasks);
    }
  };

  useEffect(() => {
    setStoredTasks(tasks);
  }, [tasks]);

  return <TasksContext.Provider value={{ tasks, setTasks, resetTasks, changeTask }}>
    {children}
  </TasksContext.Provider>
}
