import React from "react";
import ReactDOM from "react-dom/client";
import App from "src/App";
import "src/index.css";
import { TasksContextProvider } from "src/contexts";

// you must remove Strict Mode for react-beautiful-dnd to work locally
// https://github.com/atlassian/react-beautiful-dnd/issues/2350
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TasksContextProvider>
      <App />
    </TasksContextProvider>
  </React.StrictMode>
);
