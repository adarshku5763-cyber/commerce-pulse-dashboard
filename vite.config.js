import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/powerbi-client")) return "powerbi";
          if (id.includes("/node_modules/d3-")) return "d3";
          if (id.includes("/node_modules/recharts") || id.includes("/node_modules/victory-vendor")) return "charts";
        },
      },
    },
  },
});
