import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "src/App";
import "src/index.css";
import { registerSW } from "virtual:pwa-register";

// you must remove Strict Mode for react-beautiful-dnd to work locally
// https://github.com/atlassian/react-beautiful-dnd/issues/2350

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
