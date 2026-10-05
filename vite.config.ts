import path from "path";
import { copyFileSync } from "fs";
import { defineConfig, type Plugin } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

function copySpaFallback(): Plugin {
  return {
    name: "copy-spa-fallback",
    closeBundle() {
      copyFileSync(path.resolve(__dirname, "dist/index.html"), path.resolve(__dirname, "dist/404.html"));
    },
  };
}

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [solid(), tailwindcss(), copySpaFallback()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
