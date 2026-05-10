import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/e2e/**", "**/playwright-report/**"],
    coverage: {
      reporter: ["text", "html", "lcov"],
      include: ["lib/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts", "**/__previews__/**", "**/*.stories.tsx"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/app": path.resolve(__dirname, "./app"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/server": path.resolve(__dirname, "./server"),
      "@/types": path.resolve(__dirname, "./types"),
      "@/styles": path.resolve(__dirname, "./styles"),
      "@/hooks": path.resolve(__dirname, "./lib/hooks"),
      "@/forms": path.resolve(__dirname, "./lib/forms"),
    },
  },
});
