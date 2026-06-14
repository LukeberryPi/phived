import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// The web app owns the origin root (phived.com). The Vite app is mounted at
// /app by the root build (see vercel.json + scripts/build-site.mjs).
export default defineConfig({
  site: "https://www.phived.com",
  vite: {
    plugins: [tailwindcss()],
  },
});
