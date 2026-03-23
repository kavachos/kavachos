import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		"agent/index": "src/agent/index.ts",
		"auth/index": "src/auth/index.ts",
		"mcp/index": "src/mcp/index.ts",
		"permission/index": "src/permission/index.ts",
		"audit/index": "src/audit/index.ts",
		"a2a/index": "src/a2a/index.ts",
	},
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	splitting: true,
	treeshake: true,
	target: "node22",
});
