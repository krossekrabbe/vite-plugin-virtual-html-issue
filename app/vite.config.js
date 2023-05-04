import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import loadingIndicator from "vite-plugin-loading-indicator";
import virtualHtml from "vite-plugin-virtual-html";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export,@typescript-eslint/explicit-module-boundary-types
export default defineConfig((env) => {
  const plugins = [
    tsconfigPaths(),
    react({
      babel: {
        configFile: true,
      },
    }),
    virtualHtml({
      pages: {
        index: "/public/vite.index.html",
      },
      indexPage: "index",
    }),
  ];

  if (env.mode === "development") {
    plugins.push(loadingIndicator.default({ name: "rotating-plane", color: "#e50040", mountId: "#root" }));
  }

  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
    },
    plugins,
    define: {
      "process.env": process.env,
    },
    build: {
      target: "es2015",
      sourcemap: env.mode === "development",
    },
  };
});
