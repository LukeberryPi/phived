import { useCallback, useRef } from "react";
import type { GeneralTasks } from "src/contexts/GeneralTasksContext/GeneralTasksContext.types";
import type { TaskHistory } from "src/types/taskHistory";

type TaskStore = {
  tasks: GeneralTasks;
  history: TaskHistory;
};

type TaskStoreMutationResult =
  | { ok: true; tasks: GeneralTasks; history: TaskHistory }
  | { ok: false; reason: "unchanged" | "not_found" | "full" };

export function useMutateTaskStore(
  tasks: GeneralTasks,
  history: TaskHistory,
  setTasks: (
    value: GeneralTasks | ((prev: GeneralTasks) => GeneralTasks)
  ) => void,
  setHistory: (
    value: TaskHistory | ((prev: TaskHistory) => TaskHistory)
  ) => void
) {
  const storeRef = useRef<TaskStore>({ tasks, history });
  storeRef.current = { tasks, history };

  const mutateTaskStore = useCallback(
    (mutator: (store: TaskStore) => TaskStoreMutationResult) => {
      const result = mutator(storeRef.current);

      if (!result.ok) {
        return result;
      }

      setTasks(result.tasks);
      setHistory(result.history);
      return result;
    },
    [setTasks, setHistory]
  );

  return mutateTaskStore;
}
