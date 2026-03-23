import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	external: ["react", "@kavachos/react", "vitest"],
	target: "es2022",
});
