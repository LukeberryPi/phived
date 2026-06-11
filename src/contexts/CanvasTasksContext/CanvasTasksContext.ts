import { createContext, useContext } from "react";
import type { CanvasTasksContextType } from "src/contexts/CanvasTasksContext/CanvasTasksContext.types";

export const CanvasTasksContext = createContext({} as CanvasTasksContextType);

export const useCanvasTasksContext = () => useContext(CanvasTasksContext);
