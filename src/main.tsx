import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "src/App";
import "src/index.css";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
