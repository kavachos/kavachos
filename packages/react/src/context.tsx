import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ActionResult, KavachContextValue, KavachSession, KavachUser } from "./types.js";

// ─── Context ──────────────────────────────────────────────────────────────────

export const KavachContext = createContext<KavachContextValue | null>(null);

export function useKavachContext(): KavachContextValue {
	const ctx = useContext(KavachContext);
	if (!ctx) {
		throw new Error("useKavachContext must be used inside <KavachProvider>");
	}
	return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface KavachProviderProps {
	children: ReactNode;
	/** Base path where KavachOS is mounted. Defaults to "/api/kavach". */
	basePath?: string;
}

export function KavachProvider({
	children,
	basePath = "/api/kavach",
}: KavachProviderProps): ReactNode {
	const [session, setSession] = useState<KavachSession | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Strip trailing slash from basePath once
	const base = basePath.replace(/\/$/, "");

	const fetchSession = useCallback(async (): Promise<void> => {
		try {
			const res = await fetch(`${base}/session`, {
				credentials: "include",
			});
			if (res.ok) {
				const json = (await res.json()) as { data?: KavachSession };
				setSession(json.data ?? null);
			} else {
				setSession(null);
			}
		} catch {
			setSession(null);
		}
	}, [base]);

	// Fetch session on mount (only in browser)
	useEffect(() => {
		if (typeof window === "undefined") {
			setIsLoading(false);
			return;
		}
		setIsLoading(true);
		void fetchSession().finally(() => {
			setIsLoading(false);
		});
	}, [fetchSession]);

	const refresh = useCallback(async (): Promise<void> => {
		await fetchSession();
	}, [fetchSession]);

	const signIn = useCallback(
		async (email: string, password: string): Promise<ActionResult> => {
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
				setSession(okBody.data);
				return { success: true, data: undefined };
			} catch (err) {
				return {
					success: false,
					error: err instanceof Error ? err.message : "Network error",
				};
			}
		},
		[base],
	);

	const signUp = useCallback(
		async (email: string, password: string, name?: string): Promise<ActionResult> => {
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
				setSession(okBody.data);
				return { success: true, data: undefined };
			} catch (err) {
				return {
					success: false,
					error: err instanceof Error ? err.message : "Network error",
				};
			}
		},
		[base],
	);

	const signOut = useCallback(async (): Promise<void> => {
		try {
			await fetch(`${base}/sign-out`, {
				method: "POST",
				credentials: "include",
			});
		} finally {
			setSession(null);
		}
	}, [base]);

	const user: KavachUser | null = session?.user ?? null;

	const value: KavachContextValue = {
		session,
		user,
		isLoading,
		isAuthenticated: session !== null,
		signIn,
		signUp,
		signOut,
		refresh,
	};

	return <KavachContext.Provider value={value}>{children}</KavachContext.Provider>;
}
