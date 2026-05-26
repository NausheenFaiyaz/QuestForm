import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  // Bundle internal monorepo packages into the API artifact for deployment environments
  // where workspace links are not available at runtime.
  noExternal: [/^@repo\//],
  splitting: false,
  bundle: true,
  outDir: "./dist",
  clean: true,
  env: { IS_SERVER_BUILD: "true" },
  loader: { ".json": "copy" },
  minify: true,
  sourcemap: false,
});
