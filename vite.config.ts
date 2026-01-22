/// <reference types="vitest/config" />
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const isTest = mode === "test" || process.env.VITEST;
  return {
    plugins: [
      tailwindcss(),
      ...(isTest ? [] : [reactRouter()]),
      tsconfigPaths(),
    ],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./app/test/setup.ts"],
      include: ["app/**/*.test.{ts,tsx}"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
      },
    },
  };
});
