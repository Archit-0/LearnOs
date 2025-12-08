import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000, // size in KB, e.g. 1000 KB = 1 MB
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    server: {
      historyApiFallback: true, // 🔥 IMPORTANT
    },
  },
});
