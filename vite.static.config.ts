import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { DEFAULT_API_URL } from "./scripts/api-url.mjs";

// Additional export target only. The Lovable preview keeps TanStack Start.
export default defineConfig({
  base: "./",
  // Static hosts have no /api endpoint: use this project's published Cloud API.
  define: { "import.meta.env.VITE_LOOTZY_API_URL": JSON.stringify(process.env.VITE_LOOTZY_API_URL || DEFAULT_API_URL) },
  plugins: [react(), tailwindcss(), {
    name: "static-index",
    enforce: "post",
    generateBundle(_options, bundle) {
      const page = bundle["hosting.html"];
      if (page?.type === "asset") page.fileName = "index.html";
    },
  }],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: { outDir: "dist", emptyOutDir: true, rollupOptions: { input: fileURLToPath(new URL("./hosting.html", import.meta.url)) } },
});