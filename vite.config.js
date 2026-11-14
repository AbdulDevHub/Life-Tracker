import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// public/ (manifest.json, background.js, icons) is copied into build/ as-is.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "build", emptyOutDir: true },
  test: { environment: "node" },
})
