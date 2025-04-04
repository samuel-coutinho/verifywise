import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "@svgr/rollup";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.VITE_APP_PORT) || 5173,
  },
  define: { global: "globalThis",
    "process.env": {
      VITE_API_URL: process.env.VITE_API_URL,   
    },
    "import.meta.env": {
      VITE_API_URL: process.env.VITE_API_URL,
      VITE_APP_PORT: process.env.VITE_APP_PORT,
    }
  }
});
