import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { createAgentModule } from "./agent/agent.js";
import { createPrivilegeAnalyzer } from "./analyzer/privilege.js";
import { createApprovalModule } from "./approval/approval.js";
import { createAuditModule } from "./audit/audit.js";
import type { ResolvedUser } from "./auth/types.js";
import { createDatabase } from "./db/database.js";
import { createTables } from "./db/migrations.js";
import { mcpServers } from "./db/schema.js";
import { createDelegationModule } from "./delegation/delegation.js";
import { createDidModule } from "./did/module.js";
import type { ViolationType } from "./hooks/lifecycle.js";
import { createPermissionEngine } from "./permission/engine.js";
import { createPolicyModule } from "./policies/budget.js";
import type { SessionManager } from "./session/session.js";
import { createSessionManager } from "./session/session.js";
import { createTenantModule } from "./tenant/tenant.js";
import { createTrustModule } from "./trust/scoring.js";
import type {
	AuditExportOptions,
	AuditFilter,
	AuthorizeRequest,
	AuthorizeResult,
	DelegateInput,
	DelegationChain,
	KavachConfig,
	McpServer,
	McpServerInput,
	RequestContext,
} from "./types.js";

/**
 * Map an authorization denial reason string to a violation type.
 * Falls back to 'permission_denied' when no more specific match is found.
 */
function classifyViolation(reason: string | undefined): ViolationType {
	const r = reason?.toLowerCase() ?? "";
	if (r.includes("rate") || r.includes("rate_limited")) return "rate_limited";
	if (r.includes("ip") || r.includes("allowlist")) return "ip_blocked";
	if (r.includes("time") || r.includes("window")) return "time_restricted";
	if (r.includes("approval")) return "approval_required";
	return "permission_denied";
}

/**
 * Create a KavachOS instance.
 *
 * The factory is **async** so it can open database connections for Postgres
 * and MySQL (which require async driver initialisation) and optionally run
 * `CREATE TABLE IF NOT EXISTS` for all schema tables.
 *
 * @example SQLite (simplest)
 * ```typescript
 * import { createKavach } from 'kavachos';
 *
 * const kavach = await createKavach({
 *   database: { provider: 'sqlite', url: 'kavach.db' },
 * });
 * ```
 *
 * @example Postgres
 * ```typescript
 * const kavach = await createKavach({
 *   database: { provider: 'postgres', url: process.env.DATABASE_URL },
 * });
 * ```
 *
 * @example MySQL – skip auto-migration (tables managed externally)
 * ```typescript
 * const kavach = await createKavach({
 *   database: {
 *     provider: 'mysql',
 *     url: process.env.DATABASE_URL,
 *     skipMigrations: true,
 *   },
 * });
 * ```
 */
export async function createKavach(config: KavachConfig) {
	const authAdapter = config.auth?.adapter ?? null;

	const db = await createDatabase(config.database);

	// Automatically create tables unless the caller has opted out.
	// Uses CREATE TABLE IF NOT EXISTS so it is safe to run every startup.
	if (!config.database.skipMigrations) {
		await createTables(db, config.database.provider);
	}

	const agentConfig = {
		db,
		maxPerUser: config.agents?.maxPerUser ?? 10,
		defaultPermissions: config.agents?.defaultPermissions ?? [],
		tokenExpiry: config.agents?.tokenExpiry ?? "24h",
	};

	const agentModule = createAgentModule(agentConfig);

	const permissionEngine = createPermissionEngine({
		db,
		auditAll: config.agents?.auditAll ?? true,
	});

	const auditModule = createAuditModule({ db });

	const delegationModule = createDelegationModule({ db });

	// Session manager – only created when the caller opts in via auth.session.
	const sessionManager: SessionManager | null = config.auth?.session
		? createSessionManager(config.auth.session, db)
		: null;

	// Privilege analyzer — always available via kavach.analyzer.
	const privilegeAnalyzer = createPrivilegeAnalyzer(db);

	// Lifecycle hooks from config.
	const hooks = config.hooks ?? {};

	const tenantModule = createTenantModule(db);

	const policyModule = createPolicyModule(db);

	// Approval module — CIBA-style async human approval flows
	const approvalModule = createApprovalModule(config.approval ?? {}, db);

	// Trust module — graduated autonomy scoring
	const trustModule = createTrustModule({}, db);

	// DID module — W3C Decentralized Identifiers for agents
	const didModule = createDidModule(db, config.did);

	// Authorize: look up agent, check own permissions then delegated permissions
	async function authorize(
		agentId: string,
		request: AuthorizeRequest,
		context?: RequestContext,
	): Promise<AuthorizeResult> {
		// beforeAuthorize hook — may block the request before any DB work
		if (hooks.beforeAuthorize) {
			const verdict = await hooks.beforeAuthorize({
				agentId,
				action: request.action,
				resource: request.resource,
				arguments: request.arguments,
			});
			if (verdict && !verdict.allow) {
				const reason = verdict.reason ?? "Blocked by beforeAuthorize hook";
				void hooks.onViolation?.({
					type: classifyViolation(reason),
					agentId,
					action: request.action,
					resource: request.resource,
					reason,
				});
				return { allowed: false, reason, auditId: "" };
			}
		}

		const agent = await agentModule.get(agentId);
		if (!agent) {
			return {
				allowed: false,
				reason: `Agent "${agentId}" not found`,
				auditId: "",
			};
		}
		if (agent.status !== "active") {
			return {
				allowed: false,
				reason: `Agent "${agent.name}" is ${agent.status}`,
				auditId: "",
			};
		}

		const enrichedRequest: AuthorizeRequest = context ? { ...request, context } : request;

		// First check the agent's own permissions
		const ownResult = await permissionEngine.authorize(agent, enrichedRequest);

		let finalResult: AuthorizeResult;

		if (ownResult.allowed) {
			finalResult = ownResult;
		} else {
			// If own permissions deny, check effective permissions from delegation chains
			const delegatedPerms = await delegationModule.getEffectivePermissions(agentId);

			if (delegatedPerms.length === 0) {
				finalResult = ownResult;
			} else {
				// Build a synthetic agent view with delegated permissions merged in
				const agentWithDelegated = { ...agent, permissions: delegatedPerms };
				const delegatedResult = await permissionEngine.authorize(
					agentWithDelegated,
					enrichedRequest,
				);
				// Both denied — return the original denial so the message references the agent by name
				finalResult = delegatedResult.allowed ? delegatedResult : ownResult;
			}
		}

		// afterAuthorize hook
		void hooks.afterAuthorize?.({
			agentId,
			action: request.action,
			resource: request.resource,
			result: {
				allowed: finalResult.allowed,
				reason: finalResult.reason,
				auditId: finalResult.auditId,
			},
		});

		// onViolation hook when the request was denied
		if (!finalResult.allowed) {
			void hooks.onViolation?.({
				type: classifyViolation(finalResult.reason),
				agentId,
				action: request.action,
				resource: request.resource,
				reason: finalResult.reason ?? "Authorization denied",
			});
		}

		return finalResult;
	}

	// Authorize by token: validate token then check permissions
	async function authorizeByToken(
		token: string,
		request: AuthorizeRequest,
		context?: RequestContext,
	): Promise<AuthorizeResult> {
		const agent = await agentModule.validateToken(token);
		if (!agent) {
			return {
				allowed: false,
				reason: "Invalid or expired agent token",
				auditId: "",
			};
		}
		const enrichedRequest: AuthorizeRequest = context ? { ...request, context } : request;
		return permissionEngine.authorize(agent, enrichedRequest);
	}

	// Delegate: verify parent permissions then create chain
	async function delegate(input: DelegateInput): Promise<DelegationChain> {
		const parentAgent = await agentModule.get(input.fromAgent);
		if (!parentAgent) throw new Error(`Parent agent "${input.fromAgent}" not found`);
		if (parentAgent.status !== "active") {
			throw new Error(`Parent agent "${parentAgent.name}" is ${parentAgent.status}`);
		}
		return delegationModule.delegate(input, parentAgent.permissions);
	}

	// Agent facade with hooks wired in
	const agentProxy = {
		async create(
			...args: Parameters<typeof agentModule.create>
		): ReturnType<typeof agentModule.create> {
			const [input] = args;

			if (hooks.beforeAgentCreate) {
				const verdict = await hooks.beforeAgentCreate(input);
				if (verdict && !verdict.allow) {
					throw new Error(verdict.reason ?? "Agent creation blocked by beforeAgentCreate hook");
				}
			}

			const agent = await agentModule.create(input);

			void hooks.afterAgentCreate?.(agent);

			return agent;
		},

		async revoke(agentId: string): ReturnType<typeof agentModule.revoke> {
			await agentModule.revoke(agentId);
			void hooks.onAgentRevoke?.(agentId);
		},

		async rotate(
			...args: Parameters<typeof agentModule.rotate>
		): ReturnType<typeof agentModule.rotate> {
			return agentModule.rotate(...args);
		},

		get: agentModule.get,
		list: agentModule.list,
		update: agentModule.update,
		validateToken: agentModule.validateToken,
	};

	// ── MCP server registry ─────────────────────────────────────────
	// Uses the kavach_mcp_servers table (defined in db/schema.ts).
	const mcpRegistry = {
		/**
		 * Register a new MCP tool server.
		 *
		 * Persists the server entry to the `kavach_mcp_servers` table.
		 * The returned record includes the generated `id` and `createdAt`.
		 */
		async register(input: McpServerInput): Promise<McpServer> {
			const now = new Date();
			const id = randomUUID();

			await db.insert(mcpServers).values({
				id,
				name: input.name,
				endpoint: input.endpoint,
				tools: input.tools,
				authRequired: input.authRequired ?? true,
				rateLimitRpm: input.rateLimit?.rpm ?? null,
				status: "active",
				createdAt: now,
				updatedAt: now,
			});

			return {
				id,
				name: input.name,
				endpoint: input.endpoint,
				tools: input.tools,
				authRequired: input.authRequired ?? true,
				createdAt: now,
			};
		},

		/**
		 * List all registered MCP servers (active and inactive).
		 */
		async list(): Promise<McpServer[]> {
			const rows = await db.select().from(mcpServers);
			return rows.map((row) => ({
				id: row.id,
				name: row.name,
				endpoint: row.endpoint,
				tools: row.tools,
				authRequired: row.authRequired,
				createdAt: row.createdAt,
			}));
		},

		/**
		 * Get a single MCP server by ID. Returns null when not found.
		 */
		async get(id: string): Promise<McpServer | null> {
			const rows = await db.select().from(mcpServers).where(eq(mcpServers.id, id));
			const row = rows[0];
			if (!row) return null;
			return {
				id: row.id,
				name: row.name,
				endpoint: row.endpoint,
				tools: row.tools,
				authRequired: row.authRequired,
				createdAt: row.createdAt,
			};
		},
	};

	return {
		agent: agentProxy,
		authorize,
		authorizeByToken,
		delegate,
		delegation: {
			revoke: delegationModule.revokeDelegation,
			getEffectivePermissions: delegationModule.getEffectivePermissions,
			listChains: delegationModule.listChains,
		},
		audit: {
			query: (filter: AuditFilter) => auditModule.query(filter),
			export: (options: AuditExportOptions) => auditModule.export(options),
			cleanup: (options: { retentionDays: number }) => auditModule.cleanup(options),
		},
		/**
		 * MCP server registration.
		 *
		 * Register and look up MCP tool servers. Uses the `kavach_mcp_servers`
		 * database table — no separate in-memory store needed.
		 */
		mcp: mcpRegistry,
		/**
		 * Least-privilege analyzer.
		 *
		 * Compare agent permissions against actual audit log usage to surface
		 * wildcards, unused grants, and over-permissioned identities.
		 */
		analyzer: {
			analyzeAgent: privilegeAnalyzer.analyzeAgent,
			analyzeAll: privilegeAnalyzer.analyzeAll,
			getSummary: privilegeAnalyzer.getSummary,
		},
		/**
		 * Human auth integration.
		 *
		 * `resolveUser` extracts the authenticated human from an inbound HTTP
		 * request via the configured adapter.  `session` is a full session
		 * manager (create / validate / revoke) when `auth.session` was passed
		 * to `createKavach()`.
		 *
		 * @example
		 * ```typescript
		 * app.use(async (req, res, next) => {
		 *   const user = await kavach.auth.resolveUser(req);
		 *   if (!user) return res.status(401).json({ error: 'Unauthorized' });
		 *   req.user = user;
		 *   next();
		 * });
		 * ```
		 */
		auth: {
			async resolveUser(request: Request): Promise<ResolvedUser | null> {
				if (!authAdapter) return null;
				return authAdapter.resolveUser(request);
			},
			session: sessionManager,
		},
		/**
		 * Resolve a human user from an incoming HTTP request.
		 *
		 * @deprecated Use `kavach.auth.resolveUser(request)` instead.
		 */
		async resolveUser(request: Request): Promise<ResolvedUser | null> {
			if (!authAdapter) return null;
			return authAdapter.resolveUser(request);
		},
		/** Direct database access for advanced usage */
		db,
		/**
		 * Multi-tenant isolation.
		 *
		 * Create and manage tenants (organizations) that share a single
		 * KavachOS instance with full data isolation. Agents can be scoped
		 * to a tenant via `tenantId`.
		 */
		tenant: tenantModule,
		/**
		 * Agent execution budget policies.
		 *
		 * Set spending caps (token cost, call counts) per agent, user, or
		 * tenant. Exceeded policies trigger a configurable action: warn,
		 * throttle, block, or revoke.
		 */
		policies: policyModule,
		/**
		 * CIBA-style async human approval flows.
		 *
		 * Create pending approval requests, notify humans via webhook or
		 * custom handler, and resolve them with approve / deny.
		 */
		approval: approvalModule,
		/**
		 * Graduated autonomy trust scoring.
		 *
		 * Compute and persist 0-100 trust scores derived from audit history,
		 * mapped to five levels: untrusted, limited, standard, trusted, elevated.
		 */
		trust: trustModule,
		/**
		 * W3C Decentralized Identifiers (DID) for agents.
		 *
		 * Generate did:key or did:web identities, sign payloads, and verify
		 * signatures. Private keys are never stored — they are returned to
		 * the caller on generation and must be stored securely.
		 *
		 * @example
		 * ```typescript
		 * const { agentDid, privateKeyJwk } = await kavach.did.generateKey(agentId);
		 * const signed = await kavach.did.sign(agentId, { action: 'read' }, privateKeyJwk);
		 * const result = await kavach.did.verify(signed.jws, agentDid.did);
		 * ```
		 */
		did: didModule,
	};
}

export type Kavach = Awaited<ReturnType<typeof createKavach>>;
