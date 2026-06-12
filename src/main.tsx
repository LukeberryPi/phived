import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "src/App";
import "src/index.css";

// Belt-and-braces eviction of the v1 PWA service worker and its caches.
// The primary fix is the kill-switch at public/sw.js; this covers clients
// that load v2 HTML directly (e.g. after a hard refresh) so a normal
// reload can never regress to the cached v1 again.
if ("serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => void registration.unregister());
  });
}
if ("caches" in window) {
  void caches.keys().then((keys) => {
    keys.forEach((key) => void caches.delete(key));
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
