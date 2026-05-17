import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import { manifest } from "./src/manifest";

function writeManifest() {
  return {
    name: "write-manifest",
    closeBundle() {
      mkdirSync("dist", { recursive: true });
      writeFileSync("dist/manifest.json", JSON.stringify(manifest, null, 2));
    }
  };
}

export default defineConfig({
  plugins: [writeManifest()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"),
        content: resolve(__dirname, "src/content/main.ts"),
        background: resolve(__dirname, "src/background/main.ts")
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
});
