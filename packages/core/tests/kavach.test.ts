import { sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "../src/db/schema.js";
import { createKavach } from "../src/kavach.js";

function createTestKavach() {
	const kavach = createKavach({
		database: { provider: "sqlite", url: ":memory:" },
		agents: {
			enabled: true,
			maxPerUser: 5,
			defaultPermissions: [],
			auditAll: true,
			tokenExpiry: "24h",
		},
	});

	// Create tables
	kavach.db.run(sql`
		CREATE TABLE IF NOT EXISTS kavach_users (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			name TEXT,
			external_id TEXT,
			external_provider TEXT,
			metadata TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);
	kavach.db.run(sql`
		CREATE TABLE IF NOT EXISTS kavach_agents (
			id TEXT PRIMARY KEY,
			owner_id TEXT NOT NULL REFERENCES kavach_users(id),
			name TEXT NOT NULL,
			type TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'active',
			token_hash TEXT NOT NULL,
			token_prefix TEXT NOT NULL,
			expires_at INTEGER,
			last_active_at INTEGER,
			metadata TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);
	kavach.db.run(sql`
		CREATE TABLE IF NOT EXISTS kavach_permissions (
			id TEXT PRIMARY KEY,
			agent_id TEXT NOT NULL REFERENCES kavach_agents(id) ON DELETE CASCADE,
			resource TEXT NOT NULL,
			actions TEXT NOT NULL,
			constraints TEXT,
			created_at INTEGER NOT NULL
		)
	`);
	kavach.db.run(sql`
		CREATE TABLE IF NOT EXISTS kavach_audit_logs (
			id TEXT PRIMARY KEY,
			agent_id TEXT NOT NULL REFERENCES kavach_agents(id),
			user_id TEXT NOT NULL REFERENCES kavach_users(id),
			action TEXT NOT NULL,
			resource TEXT NOT NULL,
			parameters TEXT,
			result TEXT NOT NULL,
			reason TEXT,
			duration_ms INTEGER NOT NULL,
			tokens_cost INTEGER,
			ip TEXT,
			user_agent TEXT,
			timestamp INTEGER NOT NULL
		)
	`);
	kavach.db.run(sql`
		CREATE TABLE IF NOT EXISTS kavach_rate_limits (
			id TEXT PRIMARY KEY,
			agent_id TEXT NOT NULL REFERENCES kavach_agents(id) ON DELETE CASCADE,
			resource TEXT NOT NULL,
			window_start INTEGER NOT NULL,
			count INTEGER NOT NULL DEFAULT 0
		)
	`);
	kavach.db.run(sql`
		CREATE TABLE IF NOT EXISTS kavach_delegation_chains (
			id TEXT PRIMARY KEY,
			from_agent_id TEXT NOT NULL REFERENCES kavach_agents(id),
			to_agent_id TEXT NOT NULL REFERENCES kavach_agents(id),
			permissions TEXT NOT NULL,
			depth INTEGER NOT NULL DEFAULT 1,
			max_depth INTEGER NOT NULL DEFAULT 3,
			status TEXT NOT NULL DEFAULT 'active',
			expires_at INTEGER NOT NULL,
			created_at INTEGER NOT NULL
		)
	`);

	// Create a test user
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

describe("createKavach", () => {
	let kavach: ReturnType<typeof createKavach>;

	beforeEach(() => {
		kavach = createTestKavach();
	});

	describe("agent lifecycle", () => {
		it("creates an agent with permissions", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "test-agent",
				type: "autonomous",
				permissions: [
					{ resource: "mcp:github", actions: ["read"] },
					{
						resource: "tool:file_write",
						actions: ["execute"],
						constraints: { maxCallsPerHour: 100 },
					},
				],
			});

			expect(agent.id).toBeDefined();
			expect(agent.name).toBe("test-agent");
			expect(agent.type).toBe("autonomous");
			expect(agent.status).toBe("active");
			expect(agent.token).toMatch(/^kv_/);
			expect(agent.permissions).toHaveLength(2);
		});

		it("gets an agent by id", async () => {
			const created = await kavach.agent.create({
				ownerId: "user-1",
				name: "getter-agent",
				type: "service",
				permissions: [{ resource: "mcp:*", actions: ["read"] }],
			});

			const agent = await kavach.agent.get(created.id);
			expect(agent).not.toBeNull();
			expect(agent?.name).toBe("getter-agent");
			expect(agent?.permissions).toHaveLength(1);
			expect(agent?.token).toBe(""); // token should not be returned on get
		});

		it("lists agents for a user", async () => {
			await kavach.agent.create({
				ownerId: "user-1",
				name: "a1",
				type: "autonomous",
				permissions: [],
			});
			await kavach.agent.create({
				ownerId: "user-1",
				name: "a2",
				type: "service",
				permissions: [],
			});

			const all = await kavach.agent.list({ userId: "user-1" });
			expect(all).toHaveLength(2);

			const services = await kavach.agent.list({ userId: "user-1", type: "service" });
			expect(services).toHaveLength(1);
			expect(services[0]?.name).toBe("a2");
		});

		it("revokes an agent", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "revokable",
				type: "autonomous",
				permissions: [],
			});

			await kavach.agent.revoke(agent.id);

			const revoked = await kavach.agent.get(agent.id);
			expect(revoked?.status).toBe("revoked");
		});

		it("rotates agent token", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "rotatable",
				type: "autonomous",
				permissions: [],
			});
			const originalToken = agent.token;

			const rotated = await kavach.agent.rotate(agent.id);
			expect(rotated.token).not.toBe(originalToken);
			expect(rotated.token).toMatch(/^kv_/);
		});

		it("validates agent token", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "validatable",
				type: "autonomous",
				permissions: [{ resource: "test:*", actions: ["read"] }],
			});

			const validated = await kavach.agent.validateToken(agent.token);
			expect(validated).not.toBeNull();
			expect(validated?.id).toBe(agent.id);
			expect(validated?.permissions).toHaveLength(1);
		});

		it("rejects invalid token", async () => {
			const result = await kavach.agent.validateToken("kv_invalid_token");
			expect(result).toBeNull();
		});

		it("enforces max agents per user", async () => {
			for (let i = 0; i < 5; i++) {
				await kavach.agent.create({
					ownerId: "user-1",
					name: `agent-${i}`,
					type: "autonomous",
					permissions: [],
				});
			}

			await expect(
				kavach.agent.create({
					ownerId: "user-1",
					name: "too-many",
					type: "autonomous",
					permissions: [],
				}),
			).rejects.toThrow("maximum of 5 active agents");
		});
	});

	describe("authorization", () => {
		it("allows authorized actions", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "auth-agent",
				type: "autonomous",
				permissions: [{ resource: "mcp:github", actions: ["read", "write"] }],
			});

			const result = await kavach.authorize(agent.id, {
				action: "read",
				resource: "mcp:github",
			});

			expect(result.allowed).toBe(true);
			expect(result.auditId).toBeDefined();
		});

		it("denies unauthorized actions", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "restricted-agent",
				type: "autonomous",
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
			});

			const result = await kavach.authorize(agent.id, {
				action: "delete",
				resource: "mcp:github",
			});

			expect(result.allowed).toBe(false);
			expect(result.reason).toContain("No permission");
		});

		it("supports wildcard resource matching", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "wildcard-agent",
				type: "autonomous",
				permissions: [{ resource: "mcp:github:*", actions: ["read"] }],
			});

			const result = await kavach.authorize(agent.id, {
				action: "read",
				resource: "mcp:github:repos",
			});

			expect(result.allowed).toBe(true);
		});

		it("denies non-matching resources", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "scoped-agent",
				type: "autonomous",
				permissions: [{ resource: "mcp:github:repos", actions: ["read"] }],
			});

			const result = await kavach.authorize(agent.id, {
				action: "read",
				resource: "mcp:slack:messages",
			});

			expect(result.allowed).toBe(false);
		});

		it("denies revoked agents", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "soon-revoked",
				type: "autonomous",
				permissions: [{ resource: "*", actions: ["*"] }],
			});

			await kavach.agent.revoke(agent.id);

			const result = await kavach.authorize(agent.id, {
				action: "read",
				resource: "anything",
			});

			expect(result.allowed).toBe(false);
			expect(result.reason).toContain("revoked");
		});

		it("authorizes by token", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "token-auth-agent",
				type: "autonomous",
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
			});

			const result = await kavach.authorizeByToken(agent.token, {
				action: "read",
				resource: "mcp:github",
			});

			expect(result.allowed).toBe(true);
		});
	});

	describe("audit trail", () => {
		it("logs authorization decisions", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "audited-agent",
				type: "autonomous",
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
			});

			await kavach.authorize(agent.id, { action: "read", resource: "mcp:github" });
			await kavach.authorize(agent.id, { action: "delete", resource: "mcp:github" });

			const logs = await kavach.audit.query({ agentId: agent.id });
			expect(logs).toHaveLength(2);

			// Verify both results exist (order may vary due to same-ms timestamps)
			const results = new Set(logs.map((l) => l.result));
			expect(results.has("allowed")).toBe(true);
			expect(results.has("denied")).toBe(true);
		});

		it("exports audit logs as CSV", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "csv-agent",
				type: "autonomous",
				permissions: [{ resource: "test:*", actions: ["read"] }],
			});

			await kavach.authorize(agent.id, { action: "read", resource: "test:data" });

			const csv = await kavach.audit.export({ format: "csv" });
			expect(csv).toContain("id,agentId,userId");
			expect(csv).toContain("allowed");
		});
	});

	describe("constraints", () => {
		it("enforces human-in-the-loop", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "hitl-agent",
				type: "autonomous",
				permissions: [
					{
						resource: "mcp:deploy",
						actions: ["execute"],
						constraints: { requireApproval: true },
					},
				],
			});

			const result = await kavach.authorize(agent.id, {
				action: "execute",
				resource: "mcp:deploy",
			});

			expect(result.allowed).toBe(false);
			expect(result.reason).toContain("human approval");
		});
	});
});
