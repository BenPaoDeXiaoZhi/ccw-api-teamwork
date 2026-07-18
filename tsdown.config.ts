import { defineConfig } from "tsdown";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm", "iife"],
  dts: true,
  clean: true,
  minify: true,
  target: "esnext",
  platform: "browser",
  treeshake: true,
  globalName: "Teamwork",
});
