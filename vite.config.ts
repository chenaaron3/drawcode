import path from "path";
import { defineConfig } from "vite";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// Custom plugin to watch markdown files
function markdownWatcher() {
  return {
    name: "markdown-watcher",
    configureServer(server: any) {
      // Watch for markdown file changes
      server.watcher.add("src/content/**/*.md");

      server.watcher.on("change", (file: string) => {
        if (file.endsWith(".md")) {
          console.log(`Markdown file changed: ${file}`);
          // Send full reload signal to all clients
          server.ws.send({
            type: "full-reload",
          });
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), markdownWatcher()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      // Watch markdown files and trigger full page reload
      usePolling: false,
      ignored: ["!**/*.md"], // Don't ignore markdown files
    },
  },
  // Include markdown files in the dependency optimization
  optimizeDeps: {
    exclude: [], // Don't exclude anything that might reference .md files
  },
});
