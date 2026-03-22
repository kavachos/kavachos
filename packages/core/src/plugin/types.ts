import type { ResolvedUser } from "../auth/types.js";
import type { Database } from "../db/database.js";
import type { Session } from "../session/session.js";
import type { KavachConfig } from "../types.js";

/** Context passed to plugin init */
export interface PluginContext {
	db: Database;
	config: KavachConfig;
	/** Register an API endpoint that adapters will mount */
	addEndpoint: (endpoint: PluginEndpoint) => void;
	/** Register a DB migration (CREATE TABLE statement) */
	addMigration: (sql: string) => void;
}

/** An API endpoint registered by a plugin */
export interface PluginEndpoint {
	/** HTTP method */
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	/** Path relative to basePath, e.g., "/auth/sign-in" */
	path: string;
	/** Handler receives Web API Request, returns Response */
	handler: (request: Request, context: EndpointContext) => Promise<Response>;
	/** Optional metadata */
	metadata?: {
		/** Rate limit for this endpoint */
		rateLimit?: { window: number; max: number };
		/** Whether this endpoint requires authentication */
		requireAuth?: boolean;
		/** Description for OpenAPI */
		description?: string;
	};
}

/** Context available inside endpoint handlers */
export interface EndpointContext {
	db: Database;
	/** Get the authenticated user from the request (if session exists) */
	getUser: (request: Request) => Promise<ResolvedUser | null>;
	/** Get a session by token */
	getSession: (token: string) => Promise<Session | null>;
}

/** Plugin definition */
export interface KavachPlugin {
	/** Unique plugin identifier */
	id: string;

	/** Plugin initialization - runs during createKavach() */
	init?: (ctx: PluginContext) => Promise<PluginInitResult | undefined>;

	/** Database schema (Drizzle table definitions for type safety) */
	schema?: Record<string, unknown>;

	/** Lifecycle hooks */
	hooks?: {
		/** Before any auth operation */
		onRequest?: (request: Request) => Promise<Request | Response | undefined>;
		/** After successful authentication */
		onAuthenticate?: (user: ResolvedUser, session: Session) => Promise<void>;
		/** Before session creation */
		onSessionCreate?: (userId: string) => Promise<Record<string, unknown> | undefined>;
		/** On session revocation */
		onSessionRevoke?: (sessionId: string) => Promise<void>;
	};
}

export interface PluginInitResult {
	/** Additional properties to merge into the kavach instance */
	context?: Record<string, unknown>;
}
