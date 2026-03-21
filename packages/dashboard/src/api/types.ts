// ─── Agent Types ──────────────────────────────────────────────────────────────

export type AgentStatus = "active" | "revoked" | "expired";

export type AgentType = "llm" | "workflow" | "tool" | "human-in-loop" | "system";

export interface AgentPermission {
	id: string;
	resource: string;
	actions: string[];
	constraints: Record<string, unknown>;
}

export interface Agent {
	id: string;
	name: string;
	type: AgentType;
	status: AgentStatus;
	permissionsCount: number;
	lastActiveAt: string | null;
	createdAt: string;
	expiresAt: string | null;
	metadata: Record<string, unknown>;
}

export interface CreateAgentInput {
	name: string;
	type: AgentType;
	permissions: Array<{
		resource: string;
		actions: string[];
		constraints?: Record<string, unknown>;
	}>;
	expiresAt?: string;
	metadata?: Record<string, unknown>;
}

export interface CreateAgentResponse {
	agent: Agent;
	token: string;
}

// ─── Audit Log Types ──────────────────────────────────────────────────────────

export type AuditResult = "allowed" | "denied" | "rate_limited";

export interface AuditLogEntry {
	id: string;
	timestamp: string;
	agentId: string;
	agentName: string;
	action: string;
	resource: string;
	result: AuditResult;
	durationMs: number;
	metadata: Record<string, unknown>;
}

export interface AuditLogFilters {
	agentId?: string;
	action?: string;
	result?: AuditResult;
	from?: string;
	to?: string;
	limit?: number;
	offset?: number;
}

export interface PaginatedAuditLogs {
	entries: AuditLogEntry[];
	total: number;
	limit: number;
	offset: number;
}

// ─── Permission Template Types ────────────────────────────────────────────────

export interface PermissionTemplate {
	id: string;
	name: string;
	description: string;
	resource: string;
	actions: string[];
	constraints: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
}

export interface CreatePermissionTemplateInput {
	name: string;
	description?: string;
	resource: string;
	actions: string[];
	constraints?: Record<string, unknown>;
}

// ─── Settings Types ───────────────────────────────────────────────────────────

export interface DatabaseInfo {
	adapter: string;
	url: string;
	version: string;
}

export interface KavachSettings {
	database: DatabaseInfo;
	tokenExpirySeconds: number;
	rateLimitRequestsPerMinute: number;
	rateLimitWindowSeconds: number;
	auditRetentionDays: number;
	maxAgentsPerTenant: number;
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────

export type ApiResult<T> =
	| { success: true; data: T }
	| { success: false; error: { code: string; message: string } };
