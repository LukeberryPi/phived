import { createContext, useContext } from "react";
import type { CanvasTasksContextType } from "src/contexts/CanvasTasksContext/CanvasTasksContext.types";

export const CanvasTasksContext = createContext<CanvasTasksContextType | null>(
  null
);

export function useCanvasTasksContext() {
  const context = useContext(CanvasTasksContext);

  if (!context) {
    throw new Error(
      "useCanvasTasksContext must be used within CanvasTasksContextProvider"
    );
  }

  return context;
}
