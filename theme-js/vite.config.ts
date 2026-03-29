import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Allow CORS from the proxy
  const cors = env.DEV_PIWIGO_PROXY_ORIGIN
    ? {
        origin: env.DEV_PIWIGO_PROXY_ORIGIN,
        methods: "GET,OPTIONS",
        credentials: true,
      }
    : undefined;

  // If a proxy is defined, use it.
  // This should point to the root of your piwigo instance
  const proxy = env.DEV_PIWIGO_PROXY_ORIGIN
    ? {
        "/piwigo": {
          target: env.DEV_PIWIGO_PROXY_ORIGIN,
          changeOrigin: true,
          rewrite: (path: string) =>
            path.replace(/^\/piwigo/, env.DEV_PIWIGO_PROXY_PATH ?? ""),
        },
      }
    : undefined;

  return {
    base: command === "build" ? "./" : "/",
    plugins: [react()],
    server: {
      host: "localhost",
      port: 5173,
      cors,
      proxy,
    },
    build: {
      // We want a manifest for smarty to work more smoothly
      manifest: true,
      outDir: "dist",
      rollupOptions: {
        input: "src/main.tsx",
      },
    },
  };
});
