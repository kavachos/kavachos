import { createAgentModule } from "./agent/agent.js";
import { createAuditModule } from "./audit/audit.js";
import { createDatabase } from "./db/database.js";
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
 * @example
 * ```typescript
 * import { createKavach } from '@kavachos/core';
 *
 * const kavach = createKavach({
 *   database: { provider: 'sqlite', url: 'kavach.db' },
 *   agents: { enabled: true, maxPerUser: 10 },
 * });
 *
 * const agent = await kavach.agent.create({
 *   ownerId: 'user-123',
 *   name: 'my-coding-agent',
 *   type: 'autonomous',
 *   permissions: [{ resource: 'mcp:github', actions: ['read'] }],
 * });
 *
 * const result = await kavach.authorize(agent.id, {
 *   action: 'read',
 *   resource: 'mcp:github:repos',
 * });
 * // { allowed: true, auditId: '...' }
 * ```
 */
export function createKavach(config: KavachConfig) {
	const db = createDatabase({ provider: "sqlite", url: config.database.url });

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

export type Kavach = ReturnType<typeof createKavach>;
