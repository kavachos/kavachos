import { createAgentModule } from "./agent/agent.js";
import { createAuditModule } from "./audit/audit.js";
import { createDatabase } from "./db/database.js";
import { createTables } from "./db/migrations.js";
import { createDelegationModule } from "./delegation/delegation.js";
import { createPermissionEngine } from "./permission/engine.js";
import type {
	AuditExportOptions,
	AuditFilter,
	AuthorizeRequest,
	AuthorizeResult,
	DelegateInput,
	DelegationChain,
	KavachConfig,
} from "./types.js";

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

	// Authorize: look up agent, check permissions
	async function authorize(agentId: string, request: AuthorizeRequest): Promise<AuthorizeResult> {
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
		return permissionEngine.authorize(agent, request);
	}

	// Authorize by token: validate token then check permissions
	async function authorizeByToken(
		token: string,
		request: AuthorizeRequest,
	): Promise<AuthorizeResult> {
		const agent = await agentModule.validateToken(token);
		if (!agent) {
			return {
				allowed: false,
				reason: "Invalid or expired agent token",
				auditId: "",
			};
		}
		return permissionEngine.authorize(agent, request);
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

	return {
		agent: {
			create: agentModule.create,
			get: agentModule.get,
			list: agentModule.list,
			update: agentModule.update,
			revoke: agentModule.revoke,
			rotate: agentModule.rotate,
			validateToken: agentModule.validateToken,
		},
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
		},
		/** Direct database access for advanced usage */
		db,
	};
}

export type Kavach = Awaited<ReturnType<typeof createKavach>>;
