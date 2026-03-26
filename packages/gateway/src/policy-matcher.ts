import micromatch from "micromatch";
import type { GatewayPolicy } from "./types.js";

/**
 * Find the most-specific matching policy for a given path and method.
 *
 * Policies are tested in order. The first match wins.
 * A policy matches when both the path glob and the method (if specified) match.
 */
export function matchPolicy(
	policies: GatewayPolicy[],
	pathname: string,
	method: string,
): GatewayPolicy | undefined {
	for (const policy of policies) {
		if (!matchesPath(policy.path, pathname)) continue;
		if (!matchesMethod(policy.method, method)) continue;
		return policy;
	}
	return undefined;
}

function matchesPath(pattern: string, pathname: string): boolean {
	// Normalise: treat '' same as '/'
	const normalised = pathname === "" ? "/" : pathname;
	return micromatch.isMatch(normalised, pattern, { dot: true });
}

function matchesMethod(policyMethod: string | string[] | undefined, method: string): boolean {
	if (policyMethod === undefined) return true;
	const upper = method.toUpperCase();
	if (Array.isArray(policyMethod)) {
		return policyMethod.map((m) => m.toUpperCase()).includes(upper);
	}
	return policyMethod.toUpperCase() === upper;
}
