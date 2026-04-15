import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "http";
import {
  defineConfig,
  type IndexHtmlTransformContext,
  loadEnv,
  type Plugin,
  type ResolvedConfig,
} from "vite";

/**
 * Diagnostic plugin to catch API requests that are incorrectly routed
 */
function apiRouteDiagnosticPlugin(): Plugin {
  return {
    name: "api-route-diagnostic",
    apply: "serve",
    configResolved(_config: ResolvedConfig) {
      // After the config is resolved, log proxy info
    },
    transformIndexHtml: {
      order: "pre" as const,
      handler(html: string, ctx: IndexHtmlTransformContext) {
        const url = ctx.path;
        if (url.startsWith("/piwigo")) {
          console.warn(`
[API Route Warning] Index.html is being served for: ${url}
This indicates the request was not caught by the proxy middleware!
Check:
1. Is DEV_PIWIGO_PROXY_ORIGIN set?
2. Is the proxy rule /piwigo configured?
3. Check browser DevTools Network tab for actual response
          `);
        }
        return html;
      },
    },
  };
}

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
          rewrite: (path: string) => {
            const rewritten = path.replace(
              /^\/piwigo/,
              env.DEV_PIWIGO_PROXY_PATH ?? "",
            );
            console.log(`[Vite Proxy] ${path} -> ${rewritten}`);
            return rewritten;
          },
          // Log level for http-proxy-middleware
          logLevel: "debug",
          onError: (err: Error, req: IncomingMessage, res: ServerResponse) => {
            console.error(`[Vite Proxy Error] ${req.url}:`, err.message);
            res.writeHead(502);
            res.end("Bad Gateway - Proxy Error");
          },
          onProxyRes: (
            proxyRes: IncomingMessage,
            req: IncomingMessage,
            _res: ServerResponse,
          ) => {
            console.log(
              `[Vite Proxy Response] ${req.url} -> Status ${proxyRes.statusCode}`,
            );
          },
        },
      }
    : undefined;

  return {
    base: command === "build" ? "./" : "/",
    plugins: [
      react(),
      ...(env.DEV_PIWIGO_PROXY_ORIGIN ? [apiRouteDiagnosticPlugin()] : []),
    ],
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
