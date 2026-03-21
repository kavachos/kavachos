import { defineConfig } from "tsup";

export default defineConfig({
	entry: { bin: "src/bin.ts" },
	format: ["esm"],
	clean: true,
	target: "node22",
	banner: { js: "#!/usr/bin/env node" },
});
