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

  return {
    base: command === "build" ? "./" : "/",
    plugins: [react()],
    server: {
      host: "localhost",
      port: 5173,
      cors,
      proxy: {
        // Target the specific path
        "/piwigo": {
          target: env.DEV_PIWIGO_PROXY_ORIGIN,
          changeOrigin: true,
          // This is the "Magic" part:
          // If this returns null/undefined, it continues through the proxy.
          // If it returns a string, it redirects to that file.
          bypass: (_req, res, _proxyOptions) => {
            // We tell Vite: "Do not use the SPA fallback for this request"
            res?.setHeader("x-vite-proxy-bypass", "true");
          },
          // Ensure the path is preserved exactly as sent
          rewrite: (path: string) =>
            path.replace(/^\/piwigo/, env.DEV_PIWIGO_PROXY_PATH ?? ""),
        },
      },
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
