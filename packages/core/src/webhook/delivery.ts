/**
 * Webhook delivery engine with exponential backoff retry.
 *
 * Retry policy:
 *   - 5xx responses  → retry (transient server error)
 *   - 4xx responses  → no retry (permanent client error)
 *   - Network errors → retry
 *   - Timeout        → retry (next attempt gets its own timeout budget)
 *
 * Delivery status lifecycle:
 *   pending → success  (first attempt succeeded)
 *   pending → failed   (attempt failed, more retries remain)
 *   pending → exhausted (all attempts failed)
 */

import { buildWebhookHeaders, currentTimestamp, generateDeliveryId } from "./signing.js";
import type {
	DeliveryAttempt,
	DeliveryEngine,
	DeliveryRecord,
	RetryConfig,
	WebhookEndpointConfig,
} from "./types.js";

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 10_000;
// Delays between attempts (1s, 4s, 16s — 4× exponential)
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_EXPONENT = 4;

function backoffDelay(attempt: number): number {
	// attempt is 0-based: 0 → wait 1s, 1 → wait 4s, 2 → wait 16s, …
	return BACKOFF_BASE_MS * BACKOFF_EXPONENT ** attempt;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a delivery engine with the given retry configuration.
 *
 * @example
 * ```typescript
 * const engine = createDeliveryEngine({ maxAttempts: 3, timeout: 10_000 });
 * const record = await engine.deliver(endpoint, 'user.signIn', { userId: 'u1' });
 * ```
 */
export function createDeliveryEngine(retryConfig: RetryConfig = {}): DeliveryEngine {
	const maxAttempts = retryConfig.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
	const timeoutMs = retryConfig.timeout ?? DEFAULT_TIMEOUT_MS;

	async function deliver(
		endpoint: WebhookEndpointConfig,
		event: string,
		payload: Record<string, unknown>,
	): Promise<DeliveryRecord> {
		const deliveryId = generateDeliveryId();
		const rawBody = JSON.stringify(payload);
		const timestamp = currentTimestamp();
		const createdAt = Date.now();

		const record: DeliveryRecord = {
			deliveryId,
			url: endpoint.url,
			event,
			status: "pending",
			attempts: [],
			createdAt,
			updatedAt: createdAt,
		};

		for (let i = 0; i < maxAttempts; i++) {
			// Exponential backoff — wait before every attempt except the first
			if (i > 0) {
				await new Promise<void>((resolve) => setTimeout(resolve, backoffDelay(i - 1)));
			}

			const attemptedAt = Date.now();
			const attempt: DeliveryAttempt = {
				attempt: i + 1,
				attemptedAt,
				success: false,
			};

			try {
				const headers = await buildWebhookHeaders(
					endpoint.secret,
					rawBody,
					event,
					deliveryId,
					timestamp,
				);

				const response = await fetch(endpoint.url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...headers,
					},
					body: rawBody,
					signal: AbortSignal.timeout(timeoutMs),
				});

				attempt.statusCode = response.status;

				if (response.ok) {
					attempt.success = true;
					record.attempts.push(attempt);
					record.status = "success";
					record.updatedAt = Date.now();
					return record;
				}

				// 4xx — permanent failure, do not retry
				if (response.status >= 400 && response.status < 500) {
					record.attempts.push(attempt);
					record.status = "failed";
					record.updatedAt = Date.now();
					return record;
				}

				// 5xx — transient, continue loop
			} catch (err) {
				attempt.error = err instanceof Error ? err.message : "Unknown error";
				// Network/timeout errors — continue loop
			}

			record.attempts.push(attempt);
		}

		// All attempts exhausted
		record.status = "exhausted";
		record.updatedAt = Date.now();
		return record;
	}

	return { deliver };
}
