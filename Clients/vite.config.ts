import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "@svgr/rollup";

console.log(" process.env", process.env);
console.log("import.meta", import.meta);


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.VITE_APP_PORT) || 5173,
  },
  define: { global: "globalThis" }
});
