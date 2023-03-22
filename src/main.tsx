import React from "react";
import ReactDOM from "react-dom/client";
import App from "src/App";
import "src/index.css";
import { TasksContextProvider } from "src/contexts";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TasksContextProvider>
      <App />
    </TasksContextProvider>
  </React.StrictMode>
);
