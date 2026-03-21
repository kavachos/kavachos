import type { AgentConfig } from "./agent/types.js";
import type { McpConfig } from "./mcp/types.js";

/**
 * Main configuration for KavachOS
 */
export interface KavachConfig {
	/** Database connection - Drizzle instance or connection config */
	database: DatabaseConfig;

	/** Agent identity configuration */
	agents?: AgentConfig;

	/** MCP authorization server configuration */
	mcp?: McpConfig;

	/** Base URL for the auth server */
	baseUrl?: string;

	/** Secret key for signing tokens */
	secret?: string;
}

export interface DatabaseConfig {
	/** Database provider */
	provider: "sqlite" | "postgres" | "mysql";
	/** Connection URL (sqlite: file path, postgres/mysql: connection string) */
	url: string;
	/**
	 * Skip automatic `CREATE TABLE IF NOT EXISTS` on init.
	 * Useful when you manage migrations externally (e.g. Flyway, Liquibase,
	 * drizzle-kit push). Defaults to `false`.
	 */
	skipMigrations?: boolean;
}

/**
 * The main KavachOS instance returned by createKavach()
 */
export interface KavachInstance {
	/** Agent identity management */
	agent: AgentModule;
	/** Authorization engine */
	authorize: AuthorizeFn;
	/** Delegation chain management */
	delegate: DelegateFn;
	/** Audit log queries */
	audit: AuditModule;
	/** MCP authorization server */
	mcp: McpModule;
}

export interface AgentModule {
	create: (input: CreateAgentInput) => Promise<AgentIdentity>;
	get: (agentId: string) => Promise<AgentIdentity | null>;
	list: (filter?: AgentFilter) => Promise<AgentIdentity[]>;
	update: (agentId: string, input: UpdateAgentInput) => Promise<AgentIdentity>;
	revoke: (agentId: string) => Promise<void>;
	rotate: (agentId: string) => Promise<AgentIdentity>;
}

export interface AuditModule {
	query: (filter: AuditFilter) => Promise<AuditEntry[]>;
	export: (options: AuditExportOptions) => Promise<string>;
}

export interface McpModule {
	register: (input: McpServerInput) => Promise<McpServer>;
	validate: (token: string) => Promise<TokenValidationResult>;
	middleware: () => McpMiddleware;
}

// Placeholder types - will be fully defined in their respective modules
export interface AgentIdentity {
	id: string;
	ownerId: string;
	name: string;
	type: "autonomous" | "delegated" | "service";
	token: string;
	permissions: Permission[];
	status: "active" | "revoked" | "expired";
	expiresAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Permission {
	resource: string;
	actions: string[];
	constraints?: PermissionConstraints;
}

export interface PermissionConstraints {
	maxCallsPerHour?: number;
	allowedArgPatterns?: string[];
	requireApproval?: boolean;
	timeWindow?: { start: string; end: string };
	ipAllowlist?: string[];
}

export interface CreateAgentInput {
	ownerId: string;
	name: string;
	type: "autonomous" | "delegated" | "service";
	permissions: Permission[];
	expiresAt?: Date;
	metadata?: Record<string, unknown>;
}

export interface UpdateAgentInput {
	name?: string;
	permissions?: Permission[];
	expiresAt?: Date;
	metadata?: Record<string, unknown>;
}

export interface AgentFilter {
	userId?: string;
	status?: "active" | "revoked" | "expired";
	type?: "autonomous" | "delegated" | "service";
}

export interface AuthorizeResult {
	allowed: boolean;
	reason?: string;
	auditId: string;
}

export type AuthorizeFn = (agentId: string, request: AuthorizeRequest) => Promise<AuthorizeResult>;

export interface AuthorizeRequest {
	action: string;
	resource: string;
	arguments?: Record<string, unknown>;
	/** Client IP address for ipAllowlist constraint enforcement */
	ip?: string;
}

export interface DelegateInput {
	fromAgent: string;
	toAgent: string;
	permissions: Permission[];
	expiresAt: Date;
	maxDepth?: number;
}

export interface DelegationChain {
	id: string;
	fromAgent: string;
	toAgent: string;
	permissions: Permission[];
	expiresAt: Date;
	depth: number;
	createdAt: Date;
}

export type DelegateFn = (input: DelegateInput) => Promise<DelegationChain>;

export interface AuditEntry {
	id: string;
	agentId: string;
	userId: string;
	action: string;
	resource: string;
	parameters: Record<string, unknown>;
	result: "allowed" | "denied" | "rate_limited";
	reason?: string;
	durationMs: number;
	tokensCost?: number;
	timestamp: Date;
}

export interface AuditFilter {
	agentId?: string;
	userId?: string;
	since?: Date;
	until?: Date;
	actions?: string[];
	result?: "allowed" | "denied" | "rate_limited";
	limit?: number;
	offset?: number;
}

export interface AuditExportOptions {
	format: "json" | "csv";
	since?: Date;
	until?: Date;
}

export interface McpServerInput {
	name: string;
	endpoint: string;
	tools: string[];
	authRequired?: boolean;
	rateLimit?: { rpm: number };
}

export interface McpServer {
	id: string;
	name: string;
	endpoint: string;
	tools: string[];
	authRequired: boolean;
	createdAt: Date;
}

export interface TokenValidationResult {
	valid: boolean;
	agentId?: string;
	userId?: string;
	scopes?: string[];
	expiresAt?: Date;
}

export type McpMiddleware = (request: Request) => Promise<Response | undefined>;
