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

	const STORAGE_KEY = "kavach_session";

	const fetchSession = useCallback(async (): Promise<void> => {
		if (typeof window === "undefined") return;
		try {
			const raw = window.localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const stored = JSON.parse(raw) as KavachSession;
				setSession(stored);
			} else {
				setSession(null);
			}
		} catch {
			setSession(null);
		}
	}, []);

	// Restore session from localStorage on mount (only in browser)
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
				const res = await fetch(`${base}/auth/sign-in`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				});
				const json = (await res.json()) as
					| { user: KavachUser; session: { token: string; expiresAt: string } }
					| { error: { code: string; message: string } };

				if (!res.ok) {
					const errBody = json as { error: { code: string; message: string } };
					return {
						success: false,
						error: errBody.error?.message ?? `Sign-in failed (${res.status})`,
					};
				}

				const okBody = json as { user: KavachUser; session: { token: string; expiresAt: string } };
				const sessionData: KavachSession = {
					token: okBody.session.token,
					user: okBody.user,
					expiresAt: okBody.session.expiresAt,
				};
				setSession(sessionData);
				if (typeof window !== "undefined") {
					window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
				}
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
				const res = await fetch(`${base}/auth/sign-up`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password, name }),
				});
				const json = (await res.json()) as
					| { user: KavachUser; token: string }
					| { error: { code: string; message: string } };

				if (!res.ok) {
					const errBody = json as { error: { code: string; message: string } };
					return {
						success: false,
						error: errBody.error?.message ?? `Sign-up failed (${res.status})`,
					};
				}

				const okBody = json as { user: KavachUser; token: string };
				const sessionData: KavachSession = {
					token: okBody.token,
					user: okBody.user,
				};
				setSession(sessionData);
				if (typeof window !== "undefined") {
					window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
				}
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
		setSession(null);
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(STORAGE_KEY);
		}
	}, []);

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
