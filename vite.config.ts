import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [
    {
      name: "render-image-metadata",
      enforce: "pre",
      transform(source, id) {
        if (!id.split("?")[0].endsWith("/src/data/images.json")) return;
        // Archival checksums stay in the immutable source index for QA. They
        // are never read by the UI and need not be transferred to the browser.
        const images = JSON.parse(source) as Record<string, Record<string, unknown>>;
        for (const [path, metadata] of Object.entries(images)) {
          if (metadata.small === path.replace(/\.webp$/, "-768.webp")) metadata.small = "-768.webp";
          delete metadata.sha256;
          delete metadata.bytes;
        }
        return { code: JSON.stringify(images), map: null };
      },
    },
    react(),
  ],
  build: {
    target: "es2022",
    cssCodeSplit: true,
    manifest: true,
    sourcemap: false,
    chunkSizeWarningLimit: 450,
  },
  server: { host: "0.0.0.0", port: 5173 },
  preview: { host: "0.0.0.0", port: 4173 },
});
