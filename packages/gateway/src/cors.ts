import type { CorsConfig } from "./types.js";

const DEFAULT_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];
const DEFAULT_HEADERS = ["Content-Type", "Authorization"];

/**
 * Build CORS headers from a CorsConfig.
 * Returns an empty object if no config is provided.
 */
export function buildCorsHeaders(
	cors: CorsConfig | undefined,
	requestOrigin: string | null,
): Record<string, string> {
	if (!cors) return {};

	const origins = cors.origins ?? "*";
	let allowOrigin: string;

	if (origins === "*") {
		allowOrigin = "*";
	} else if (Array.isArray(origins)) {
		allowOrigin =
			requestOrigin && origins.includes(requestOrigin) ? requestOrigin : (origins[0] ?? "*");
	} else {
		allowOrigin = origins;
	}

	const methods = (cors.methods ?? DEFAULT_METHODS).join(", ");
	const headers = (cors.headers ?? DEFAULT_HEADERS).join(", ");
	const maxAge = String(cors.maxAge ?? 86400);

	const result: Record<string, string> = {
		"Access-Control-Allow-Origin": allowOrigin,
		"Access-Control-Allow-Methods": methods,
		"Access-Control-Allow-Headers": headers,
		"Access-Control-Max-Age": maxAge,
	};

	if (cors.credentials) {
		result["Access-Control-Allow-Credentials"] = "true";
	}

	return result;
}

/**
 * Whether the request is a CORS preflight.
 */
export function isPreflight(request: Request): boolean {
	return request.method === "OPTIONS";
}
