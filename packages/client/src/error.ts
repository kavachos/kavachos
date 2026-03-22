import type { KavachError } from "./types.js";

export class KavachApiError extends Error {
	readonly code: string;
	readonly status: number;
	readonly details?: Record<string, unknown>;

	constructor(error: KavachError, status: number) {
		super(error.message);
		this.name = "KavachApiError";
		this.code = error.code;
		this.status = status;
		this.details = error.details;
	}

	toKavachError(): KavachError {
		return {
			code: this.code,
			message: this.message,
			details: this.details,
		};
	}
}
