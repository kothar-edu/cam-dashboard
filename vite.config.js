import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      src: "/src",
      components: "/src/components",
      hooks: "/src/hooks",
      layouts: "src/layouts",
      pages: "/src/pages",
      lib: "/src/lib",
    },
  },
  plugins: [react()],
  server: {
    port: 8000,
  },
  define: {
    "process.env": {},
  },
});
