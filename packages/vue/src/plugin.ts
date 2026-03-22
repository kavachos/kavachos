import type { App, InjectionKey, Ref } from "vue";
import { inject, ref } from "vue";
import type { ActionResult, KavachContextValue, KavachSession, KavachUser } from "./types.js";

// ─── Injection key ────────────────────────────────────────────────────────────

export const KAVACH_KEY: InjectionKey<KavachContextValue> = Symbol("kavach");

// ─── useRequiredContext ───────────────────────────────────────────────────────

export function useRequiredContext(composableName: string): KavachContextValue {
	const ctx = inject(KAVACH_KEY);
	if (!ctx) {
		throw new Error(
			`${composableName} must be used inside a component wrapped by createKavachPlugin`,
		);
	}
	return ctx;
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export interface KavachPluginOptions {
	/** Base path where KavachOS is mounted. Defaults to "/api/kavach". */
	basePath?: string;
}

export function createKavachPlugin(options: KavachPluginOptions = {}) {
	return {
		install(app: App) {
			const base = (options.basePath ?? "/api/kavach").replace(/\/$/, "");

			const session: Ref<KavachSession | null> = ref(null);
			const isLoading: Ref<boolean> = ref(true);

			async function fetchSession(): Promise<void> {
				if (typeof window === "undefined") {
					isLoading.value = false;
					return;
				}
				try {
					const res = await fetch(`${base}/session`, {
						credentials: "include",
					});
					if (res.ok) {
						const json = (await res.json()) as { data?: KavachSession };
						session.value = json.data ?? null;
					} else {
						session.value = null;
					}
				} catch {
					session.value = null;
				}
			}

			async function refresh(): Promise<void> {
				await fetchSession();
			}

			async function signIn(email: string, password: string): Promise<ActionResult> {
				try {
					const res = await fetch(`${base}/sign-in/email`, {
						method: "POST",
						credentials: "include",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ email, password }),
					});
					const json = (await res.json()) as
						| { data: KavachSession }
						| { error: { code: string; message: string } };

					if (!res.ok) {
						const errBody = json as { error: { code: string; message: string } };
						return {
							success: false,
							error: errBody.error?.message ?? `Sign-in failed (${res.status})`,
						};
					}

					const okBody = json as { data: KavachSession };
					session.value = okBody.data;
					return { success: true, data: undefined };
				} catch (err) {
					return {
						success: false,
						error: err instanceof Error ? err.message : "Network error",
					};
				}
			}

			async function signUp(email: string, password: string, name?: string): Promise<ActionResult> {
				try {
					const res = await fetch(`${base}/sign-up/email`, {
						method: "POST",
						credentials: "include",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ email, password, name }),
					});
					const json = (await res.json()) as
						| { data: KavachSession }
						| { error: { code: string; message: string } };

					if (!res.ok) {
						const errBody = json as { error: { code: string; message: string } };
						return {
							success: false,
							error: errBody.error?.message ?? `Sign-up failed (${res.status})`,
						};
					}

					const okBody = json as { data: KavachSession };
					session.value = okBody.data;
					return { success: true, data: undefined };
				} catch (err) {
					return {
						success: false,
						error: err instanceof Error ? err.message : "Network error",
					};
				}
			}

			async function signOut(): Promise<void> {
				try {
					await fetch(`${base}/sign-out`, {
						method: "POST",
						credentials: "include",
					});
				} finally {
					session.value = null;
				}
			}

			// Kick off the initial session fetch
			isLoading.value = true;
			void fetchSession().finally(() => {
				isLoading.value = false;
			});

			const context: KavachContextValue = {
				get session() {
					return session.value;
				},
				get user(): KavachUser | null {
					return session.value?.user ?? null;
				},
				get isLoading() {
					return isLoading.value;
				},
				get isAuthenticated() {
					return session.value !== null;
				},
				basePath: base,
				signIn,
				signUp,
				signOut,
				refresh,
			};

			app.provide(KAVACH_KEY, context);
		},
	};
}
