import { describe, expect, it, vi } from "vitest";
import * as schema from "../src/db/schema.js";
import type { Kavach } from "../src/kavach.js";
import { createKavach } from "../src/kavach.js";

async function createTestKavach(hookOverrides?: Parameters<typeof createKavach>[0]["hooks"]) {
	const kavach = await createKavach({
		database: { provider: "sqlite", url: ":memory:" },
		agents: {
			enabled: true,
			maxPerUser: 10,
			defaultPermissions: [],
			auditAll: true,
			tokenExpiry: "24h",
		},
		hooks: hookOverrides,
	});

	await kavach.db
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

async function seedAgent(kavach: Kavach) {
	return kavach.agent.create({
		ownerId: "user-1",
		name: "test-agent",
		type: "autonomous",
		permissions: [{ resource: "mcp:github", actions: ["read"] }],
	});
}

describe("KavachHooks - beforeAuthorize", () => {
	it("allows the request when hook returns void", async () => {
		const beforeAuthorize = vi.fn().mockResolvedValue(undefined);
		const kavach = await createTestKavach({ beforeAuthorize });
		const agent = await seedAgent(kavach);

		const result = await kavach.authorize(agent.id, {
			action: "read",
			resource: "mcp:github",
		});

		expect(beforeAuthorize).toHaveBeenCalledOnce();
		expect(result.allowed).toBe(true);
	});

	it("blocks the request when hook returns { allow: false }", async () => {
		const kavach = await createTestKavach({
			beforeAuthorize: async () => ({ allow: false, reason: "Sandbox blocked this" }),
		});
		const agent = await seedAgent(kavach);

		const result = await kavach.authorize(agent.id, {
			action: "read",
			resource: "mcp:github",
		});

		expect(result.allowed).toBe(false);
		expect(result.reason).toBe("Sandbox blocked this");
	});

	it("passes action, resource, and arguments to the hook", async () => {
		const beforeAuthorize = vi.fn().mockResolvedValue(undefined);
		const kavach = await createTestKavach({ beforeAuthorize });
		const agent = await seedAgent(kavach);

		await kavach.authorize(agent.id, {
			action: "execute",
			resource: "mcp:github:create_issue",
			arguments: { title: "test" },
		});

		expect(beforeAuthorize).toHaveBeenCalledWith(
			expect.objectContaining({
				agentId: agent.id,
				action: "execute",
				resource: "mcp:github:create_issue",
				arguments: { title: "test" },
			}),
		);
	});
});

describe("KavachHooks - afterAuthorize", () => {
	it("fires after a successful authorization", async () => {
		const afterAuthorize = vi.fn().mockResolvedValue(undefined);
		const kavach = await createTestKavach({ afterAuthorize });
		const agent = await seedAgent(kavach);

		await kavach.authorize(agent.id, { action: "read", resource: "mcp:github" });

		expect(afterAuthorize).toHaveBeenCalledOnce();
		const ctx = afterAuthorize.mock.calls[0]?.[0];
		expect(ctx?.result.allowed).toBe(true);
		expect(ctx?.agentId).toBe(agent.id);
	});

	it("fires after a denied authorization", async () => {
		const afterAuthorize = vi.fn().mockResolvedValue(undefined);
		const kavach = await createTestKavach({ afterAuthorize });
		const agent = await seedAgent(kavach);

		await kavach.authorize(agent.id, { action: "write", resource: "mcp:not:allowed" });

		expect(afterAuthorize).toHaveBeenCalledOnce();
		const ctx = afterAuthorize.mock.calls[0]?.[0];
		expect(ctx?.result.allowed).toBe(false);
	});
});

describe("KavachHooks - onViolation", () => {
	it("fires when authorization is denied", async () => {
		const onViolation = vi.fn().mockResolvedValue(undefined);
		const kavach = await createTestKavach({ onViolation });
		const agent = await seedAgent(kavach);

		await kavach.authorize(agent.id, { action: "write", resource: "mcp:not:allowed" });

		expect(onViolation).toHaveBeenCalledOnce();
		const violation = onViolation.mock.calls[0]?.[0];
		expect(violation?.agentId).toBe(agent.id);
		expect(violation?.action).toBe("write");
		expect(violation?.resource).toBe("mcp:not:allowed");
		expect(violation?.type).toBe("permission_denied");
	});

	it("fires when blocked by beforeAuthorize", async () => {
		const onViolation = vi.fn().mockResolvedValue(undefined);
		const kavach = await createTestKavach({
			beforeAuthorize: async () => ({ allow: false, reason: "rate_limited" }),
			onViolation,
		});
		const agent = await seedAgent(kavach);

		await kavach.authorize(agent.id, { action: "read", resource: "mcp:github" });

		expect(onViolation).toHaveBeenCalledOnce();
		const violation = onViolation.mock.calls[0]?.[0];
		expect(violation?.type).toBe("rate_limited");
	});

	it("does not fire when authorization is allowed", async () => {
		const onViolation = vi.fn().mockResolvedValue(undefined);
		const kavach = await createTestKavach({ onViolation });
		const agent = await seedAgent(kavach);

		await kavach.authorize(agent.id, { action: "read", resource: "mcp:github" });

		expect(onViolation).not.toHaveBeenCalled();
	});
});

describe("KavachHooks - agent lifecycle", () => {
	it("beforeAgentCreate can block agent creation", async () => {
		const kavach = await createTestKavach({
			beforeAgentCreate: async () => ({ allow: false, reason: "Not allowed in sandbox" }),
		});

		await expect(
			kavach.agent.create({
				ownerId: "user-1",
				name: "blocked-agent",
				type: "autonomous",
				permissions: [],
			}),
		).rejects.toThrow("Not allowed in sandbox");
	});

	it("afterAgentCreate fires after successful creation", async () => {
		const afterAgentCreate = vi.fn().mockResolvedValue(undefined);
		const kavach = await createTestKavach({ afterAgentCreate });

		await kavach.agent.create({
			ownerId: "user-1",
			name: "new-agent",
			type: "autonomous",
			permissions: [],
		});

		expect(afterAgentCreate).toHaveBeenCalledOnce();
		const agent = afterAgentCreate.mock.calls[0]?.[0];
		expect(agent?.name).toBe("new-agent");
	});

	it("onAgentRevoke fires when an agent is revoked", async () => {
		const onAgentRevoke = vi.fn().mockResolvedValue(undefined);
		const kavach = await createTestKavach({ onAgentRevoke });
		const agent = await seedAgent(kavach);

		await kavach.agent.revoke(agent.id);

		expect(onAgentRevoke).toHaveBeenCalledWith(agent.id);
	});

	it("beforeAgentCreate passes the input to the hook", async () => {
		const beforeAgentCreate = vi.fn().mockResolvedValue(undefined);
		const kavach = await createTestKavach({ beforeAgentCreate });

		await kavach.agent.create({
			ownerId: "user-1",
			name: "my-agent",
			type: "service",
			permissions: [],
		});

		expect(beforeAgentCreate).toHaveBeenCalledWith(
			expect.objectContaining({ name: "my-agent", type: "service" }),
		);
	});
});
