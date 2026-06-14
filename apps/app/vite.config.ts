import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  // The app is mounted under /app on phived.com; the web app owns the root.
  base: "/app/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      src: path.resolve(projectRoot, "src"),
    },
  },
});
