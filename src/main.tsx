import React from "react";
import ReactDOM from "react-dom/client";

import { TasksContextProvider } from "src/contexts";

import App from "src/App";

import "src/index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TasksContextProvider>
      <App />
    </TasksContextProvider>
  </React.StrictMode>
);
