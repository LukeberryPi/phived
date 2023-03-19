import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { TasksContextProvider } from "./contexts/TasksContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TasksContextProvider>
      <App />
    </TasksContextProvider>
  </React.StrictMode>
);
