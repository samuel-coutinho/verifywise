import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "@svgr/rollup";
import dotenv from 'dotenv';

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react(), svgr()],
//   server: {
//     host: "0.0.0.0",
//   },
//   define: { global: "globalThis", 'import.meta.env.VITE_APP_API_BASE_URL': JSON.stringify(process.env.VITE_APP_API_BASE_URL) }
// });
dotenv.config(); // Load .env file

console.log("process.env:", process.env);
console.log("VITE_APP_API_BASE_URL:", process.env.VITE_APP_API_BASE_URL);

export default defineConfig(({ mode }) => {
  // Load environment variables manually
  dotenv.config();

  return {
    plugins: [react(), svgr()],
    server: {
      host: "0.0.0.0",
    },
    define: {
      'import.meta.env.VITE_APP_API_BASE_URL': JSON.stringify(process.env.VITE_APP_API_BASE_URL),
    },
  };
});
