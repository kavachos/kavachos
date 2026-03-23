import type { ClassNameOverride } from "./types.js";

/**
 * Merge a default class string with an optional override.
 *
 * - If override is undefined, returns defaults as-is.
 * - If override is a string, appends it to defaults.
 * - If override is a function, calls it with defaults and uses the return value.
 */
export function cx(defaults: string, override?: ClassNameOverride): string {
	if (override === undefined) return defaults;
	if (typeof override === "function") return override(defaults);
	return `${defaults} ${override}`;
}
