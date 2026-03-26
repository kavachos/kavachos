import { readFileSync } from "node:fs";
import { z } from "zod";

// ─── JSON Config Schema ───────────────────────────────────────────────────────

const RateLimitConfigSchema = z.object({
	windowMs: z.number().int().positive(),
	max: z.number().int().positive(),
});

const CorsConfigSchema = z.object({
	origins: z.union([z.string(), z.array(z.string())]).optional(),
	methods: z.array(z.string()).optional(),
	headers: z.array(z.string()).optional(),
	maxAge: z.number().int().positive().optional(),
	credentials: z.boolean().optional(),
});

const GatewayPolicySchema = z.object({
	path: z.string().min(1),
	method: z.union([z.string(), z.array(z.string())]).optional(),
	requireAuth: z.boolean().optional(),
	requiredPermissions: z
		.array(
			z.object({
				resource: z.string().min(1),
				actions: z.array(z.string().min(1)).min(1),
			}),
		)
		.optional(),
	rateLimit: RateLimitConfigSchema.optional(),
	public: z.boolean().optional(),
});

export const GatewayFileConfigSchema = z.object({
	upstream: z.string().url(),
	basePath: z.string().optional(),
	policies: z.array(GatewayPolicySchema).optional(),
	cors: CorsConfigSchema.optional(),
	rateLimit: RateLimitConfigSchema.optional(),
	audit: z.boolean().optional(),
	stripAuthHeader: z.boolean().optional(),
});

export type GatewayFileConfig = z.infer<typeof GatewayFileConfigSchema>;

/**
 * Load and validate a gateway JSON config file.
 * Throws a descriptive error if the file is missing or invalid.
 */
export function loadConfigFile(path: string): GatewayFileConfig {
	let raw: string;
	try {
		raw = readFileSync(path, "utf-8");
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(`Cannot read gateway config file "${path}": ${message}`);
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		throw new Error(`Gateway config file "${path}" is not valid JSON`);
	}

	const result = GatewayFileConfigSchema.safeParse(parsed);
	if (!result.success) {
		const issues = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
		throw new Error(`Gateway config file "${path}" is invalid:\n${issues}`);
	}

	return result.data;
}
