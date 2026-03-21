import { sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "../src/db/schema.js";
import { createKavach } from "../src/kavach.js";

function createTestKavach() {
	const kavach = createKavach({
		database: { provider: "sqlite", url: ":memory:" },
		agents: {
			enabled: true,
			maxPerUser: 10,
			defaultPermissions: [],
			auditAll: false,
			tokenExpiry: "24h",
		},
	});

	kavach.db.run(
		sql`CREATE TABLE IF NOT EXISTS kavach_users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT, external_id TEXT, external_provider TEXT, metadata TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
	);
	kavach.db.run(
		sql`CREATE TABLE IF NOT EXISTS kavach_agents (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', token_hash TEXT NOT NULL, token_prefix TEXT NOT NULL, expires_at INTEGER, last_active_at INTEGER, metadata TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
	);
	kavach.db.run(
		sql`CREATE TABLE IF NOT EXISTS kavach_permissions (id TEXT PRIMARY KEY, agent_id TEXT NOT NULL, resource TEXT NOT NULL, actions TEXT NOT NULL, constraints TEXT, created_at INTEGER NOT NULL)`,
	);
	kavach.db.run(
		sql`CREATE TABLE IF NOT EXISTS kavach_delegation_chains (id TEXT PRIMARY KEY, from_agent_id TEXT NOT NULL, to_agent_id TEXT NOT NULL, permissions TEXT NOT NULL, depth INTEGER NOT NULL DEFAULT 1, max_depth INTEGER NOT NULL DEFAULT 3, status TEXT NOT NULL DEFAULT 'active', expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)`,
	);
	kavach.db.run(
		sql`CREATE TABLE IF NOT EXISTS kavach_audit_logs (id TEXT PRIMARY KEY, agent_id TEXT NOT NULL, user_id TEXT NOT NULL, action TEXT NOT NULL, resource TEXT NOT NULL, parameters TEXT, result TEXT NOT NULL, reason TEXT, duration_ms INTEGER NOT NULL, tokens_cost INTEGER, ip TEXT, user_agent TEXT, timestamp INTEGER NOT NULL)`,
	);
	kavach.db.run(
		sql`CREATE TABLE IF NOT EXISTS kavach_rate_limits (id TEXT PRIMARY KEY, agent_id TEXT NOT NULL, resource TEXT NOT NULL, window_start INTEGER NOT NULL, count INTEGER NOT NULL DEFAULT 0)`,
	);

	kavach.db
		.insert(schema.users)
		.values({
			id: "user-1",
			email: "test@example.com",
			name: "Test User",
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.run();

	return kavach;
}

describe("delegation chains", () => {
	let kavach: ReturnType<typeof createKavach>;

	beforeEach(() => {
		kavach = createTestKavach();
	});

	it("delegates permissions from parent to child", async () => {
		const parent = await kavach.agent.create({
			ownerId: "user-1",
			name: "parent-agent",
			type: "autonomous",
			permissions: [
				{ resource: "mcp:github:*", actions: ["read", "write"] },
				{ resource: "mcp:slack:*", actions: ["read"] },
			],
		});

		const child = await kavach.agent.create({
			ownerId: "user-1",
			name: "child-agent",
			type: "delegated",
			permissions: [],
		});

		const chain = await kavach.delegate({
			fromAgent: parent.id,
			toAgent: child.id,
			permissions: [{ resource: "mcp:github:repos", actions: ["read"] }],
			expiresAt: new Date(Date.now() + 60 * 60 * 1000),
		});

		expect(chain.id).toBeDefined();
		expect(chain.depth).toBe(1);
		expect(chain.fromAgent).toBe(parent.id);
		expect(chain.toAgent).toBe(child.id);
	});

	it("rejects delegation that exceeds parent permissions", async () => {
		const parent = await kavach.agent.create({
			ownerId: "user-1",
			name: "limited-parent",
			type: "autonomous",
			permissions: [{ resource: "mcp:github", actions: ["read"] }],
		});

		const child = await kavach.agent.create({
			ownerId: "user-1",
			name: "greedy-child",
			type: "delegated",
			permissions: [],
		});

		await expect(
			kavach.delegate({
				fromAgent: parent.id,
				toAgent: child.id,
				permissions: [{ resource: "mcp:github", actions: ["read", "write", "delete"] }],
				expiresAt: new Date(Date.now() + 60 * 60 * 1000),
			}),
		).rejects.toThrow("subset");
	});

	it("tracks effective permissions for delegated agents", async () => {
		const parent = await kavach.agent.create({
			ownerId: "user-1",
			name: "delegator",
			type: "autonomous",
			permissions: [{ resource: "mcp:*", actions: ["read", "write"] }],
		});

		const child = await kavach.agent.create({
			ownerId: "user-1",
			name: "delegate",
			type: "delegated",
			permissions: [],
		});

		await kavach.delegate({
			fromAgent: parent.id,
			toAgent: child.id,
			permissions: [{ resource: "mcp:github", actions: ["read"] }],
			expiresAt: new Date(Date.now() + 60 * 60 * 1000),
		});

		const effective = await kavach.delegation.getEffectivePermissions(child.id);
		expect(effective).toHaveLength(1);
		expect(effective[0]!.resource).toBe("mcp:github");
		expect(effective[0]!.actions).toEqual(["read"]);
	});

	it("cascades revocation down the chain", async () => {
		const parent = await kavach.agent.create({
			ownerId: "user-1",
			name: "top",
			type: "autonomous",
			permissions: [{ resource: "*", actions: ["*"] }],
		});

		const middle = await kavach.agent.create({
			ownerId: "user-1",
			name: "middle",
			type: "delegated",
			permissions: [{ resource: "mcp:github", actions: ["read"] }],
		});

		const leaf = await kavach.agent.create({
			ownerId: "user-1",
			name: "leaf",
			type: "delegated",
			permissions: [],
		});

		const chain1 = await kavach.delegate({
			fromAgent: parent.id,
			toAgent: middle.id,
			permissions: [{ resource: "mcp:github", actions: ["read"] }],
			expiresAt: new Date(Date.now() + 60 * 60 * 1000),
		});

		// middle delegates to leaf (middle has the permission to delegate)
		await kavach.delegate({
			fromAgent: middle.id,
			toAgent: leaf.id,
			permissions: [{ resource: "mcp:github", actions: ["read"] }],
			expiresAt: new Date(Date.now() + 60 * 60 * 1000),
		});

		// Revoke the top chain - should cascade
		await kavach.delegation.revoke(chain1.id);

		const leafPerms = await kavach.delegation.getEffectivePermissions(leaf.id);
		expect(leafPerms).toHaveLength(0);
	});

	it("lists delegation chains for an agent", async () => {
		const parent = await kavach.agent.create({
			ownerId: "user-1",
			name: "multi-delegator",
			type: "autonomous",
			permissions: [{ resource: "*", actions: ["*"] }],
		});

		const child1 = await kavach.agent.create({
			ownerId: "user-1",
			name: "c1",
			type: "delegated",
			permissions: [],
		});
		const child2 = await kavach.agent.create({
			ownerId: "user-1",
			name: "c2",
			type: "delegated",
			permissions: [],
		});

		await kavach.delegate({
			fromAgent: parent.id,
			toAgent: child1.id,
			permissions: [{ resource: "mcp:github", actions: ["read"] }],
			expiresAt: new Date(Date.now() + 60 * 60 * 1000),
		});

		await kavach.delegate({
			fromAgent: parent.id,
			toAgent: child2.id,
			permissions: [{ resource: "mcp:slack", actions: ["read"] }],
			expiresAt: new Date(Date.now() + 60 * 60 * 1000),
		});

		const chains = await kavach.delegation.listChains(parent.id);
		expect(chains).toHaveLength(2);
	});
});
