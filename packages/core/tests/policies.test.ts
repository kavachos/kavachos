import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "../src/db/schema.js";
import type { Kavach } from "../src/kavach.js";
import { createKavach } from "../src/kavach.js";

async function createTestKavach() {
	const kavach = await createKavach({
		database: { provider: "sqlite", url: ":memory:" },
		agents: {
			enabled: true,
			maxPerUser: 20,
			defaultPermissions: [],
			auditAll: true,
			tokenExpiry: "24h",
		},
	});

	// Seed a test user
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

describe("budget policy module", () => {
	let kavach: Kavach;

	beforeEach(async () => {
		kavach = await createTestKavach();
	});

	describe("create", () => {
		it("creates a policy with id prefix pol_", async () => {
			const policy = await kavach.policies.create({
				limits: { maxCallsPerDay: 100 },
				action: "block",
			});

			expect(policy.id).toMatch(/^pol_/);
			expect(policy.limits.maxCallsPerDay).toBe(100);
			expect(policy.action).toBe("block");
			expect(policy.status).toBe("active");
			expect(policy.currentUsage.callsToday).toBe(0);
			expect(policy.currentUsage.tokensCostToday).toBe(0);
		});

		it("creates a policy scoped to an agent", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "budget-agent",
				type: "autonomous",
				permissions: [],
			});

			const policy = await kavach.policies.create({
				agentId: agent.id,
				limits: { maxTokensCostPerMonth: 500 },
				action: "warn",
			});

			expect(policy.agentId).toBe(agent.id);
		});

		it("creates a global policy (no agentId)", async () => {
			const policy = await kavach.policies.create({
				limits: { maxCallsPerDay: 1000 },
				action: "throttle",
			});

			expect(policy.agentId).toBeUndefined();
		});
	});

	describe("get", () => {
		it("returns policy by id", async () => {
			const created = await kavach.policies.create({
				limits: { maxCallsPerDay: 50 },
				action: "block",
			});

			const found = await kavach.policies.get(created.id);
			expect(found).not.toBeNull();
			expect(found?.id).toBe(created.id);
		});

		it("returns null for unknown id", async () => {
			const result = await kavach.policies.get("pol_nonexistent");
			expect(result).toBeNull();
		});
	});

	describe("list", () => {
		it("lists all policies without filter", async () => {
			await kavach.policies.create({ limits: { maxCallsPerDay: 10 }, action: "warn" });
			await kavach.policies.create({ limits: { maxCallsPerMonth: 100 }, action: "block" });

			const all = await kavach.policies.list();
			expect(all.length).toBeGreaterThanOrEqual(2);
		});

		it("lists policies filtered by agentId including global ones", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "filter-agent",
				type: "service",
				permissions: [],
			});

			const agentPolicy = await kavach.policies.create({
				agentId: agent.id,
				limits: { maxCallsPerDay: 5 },
				action: "block",
			});
			const globalPolicy = await kavach.policies.create({
				limits: { maxCallsPerDay: 1000 },
				action: "warn",
			});

			const filtered = await kavach.policies.list({ agentId: agent.id });
			const ids = filtered.map((p) => p.id);
			expect(ids).toContain(agentPolicy.id);
			expect(ids).toContain(globalPolicy.id); // global policies also apply
		});
	});

	describe("update", () => {
		it("updates policy limits and action", async () => {
			const policy = await kavach.policies.create({
				limits: { maxCallsPerDay: 10 },
				action: "warn",
			});

			const updated = await kavach.policies.update(policy.id, {
				limits: { maxCallsPerDay: 50, maxCallsPerMonth: 1000 },
				action: "block",
			});

			expect(updated.limits.maxCallsPerDay).toBe(50);
			expect(updated.limits.maxCallsPerMonth).toBe(1000);
			expect(updated.action).toBe("block");
		});

		it("throws for unknown policy", async () => {
			await expect(kavach.policies.update("pol_ghost", { action: "block" })).rejects.toThrow(
				"not found",
			);
		});
	});

	describe("remove", () => {
		it("removes a policy", async () => {
			const policy = await kavach.policies.create({
				limits: { maxCallsPerDay: 5 },
				action: "block",
			});

			await kavach.policies.remove(policy.id);
			const found = await kavach.policies.get(policy.id);
			expect(found).toBeNull();
		});

		it("throws when removing unknown policy", async () => {
			await expect(kavach.policies.remove("pol_ghost")).rejects.toThrow("not found");
		});
	});

	describe("checkBudget", () => {
		it("allows when no policies exist for agent", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "clean-agent",
				type: "autonomous",
				permissions: [],
			});

			const result = await kavach.policies.checkBudget(agent.id);
			expect(result.allowed).toBe(true);
		});

		it("allows when usage is within limits", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "within-budget-agent",
				type: "autonomous",
				permissions: [],
			});

			await kavach.policies.create({
				agentId: agent.id,
				limits: { maxCallsPerDay: 100 },
				action: "block",
			});

			const result = await kavach.policies.checkBudget(agent.id);
			expect(result.allowed).toBe(true);
		});

		it("blocks when call limit is exceeded", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "blocked-agent",
				type: "autonomous",
				permissions: [],
			});

			const policy = await kavach.policies.create({
				agentId: agent.id,
				limits: { maxCallsPerDay: 0 }, // zero = already at limit
				action: "block",
			});

			// Trigger the policy by recording usage
			await kavach.policies.recordUsage(agent.id);

			const result = await kavach.policies.checkBudget(agent.id);
			expect(result.allowed).toBe(false);
			expect(result.policy?.id).toBe(policy.id);
			expect(result.reason).toContain("exceeded");
		});

		it("allows (but warns) when action is warn", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "warn-agent",
				type: "autonomous",
				permissions: [],
			});

			await kavach.policies.create({
				agentId: agent.id,
				limits: { maxCallsPerDay: 0 },
				action: "warn",
			});

			await kavach.policies.recordUsage(agent.id);

			const result = await kavach.policies.checkBudget(agent.id);
			// warn action = allowed is true even when exceeded
			expect(result.allowed).toBe(true);
			expect(result.policy).toBeDefined();
		});

		it("blocks when token cost limit would be exceeded", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "token-agent",
				type: "autonomous",
				permissions: [],
			});

			await kavach.policies.create({
				agentId: agent.id,
				limits: { maxTokensCostPerDay: 10 },
				action: "block",
			});

			// Check with a cost that would exceed the limit
			const result = await kavach.policies.checkBudget(agent.id, 15);
			expect(result.allowed).toBe(false);
		});
	});

	describe("recordUsage", () => {
		it("increments call counters for all applicable policies", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "usage-agent",
				type: "service",
				permissions: [],
			});

			const policy = await kavach.policies.create({
				agentId: agent.id,
				limits: { maxCallsPerDay: 100 },
				action: "block",
			});

			await kavach.policies.recordUsage(agent.id, 5);

			const updated = await kavach.policies.get(policy.id);
			expect(updated?.currentUsage.callsToday).toBe(1);
			expect(updated?.currentUsage.callsThisMonth).toBe(1);
			expect(updated?.currentUsage.tokensCostToday).toBe(5);
			expect(updated?.currentUsage.tokensCostThisMonth).toBe(5);
		});

		it("transitions status to triggered when limit is breached", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "breach-agent",
				type: "autonomous",
				permissions: [],
			});

			const policy = await kavach.policies.create({
				agentId: agent.id,
				limits: { maxCallsPerDay: 1 },
				action: "block",
			});

			await kavach.policies.recordUsage(agent.id);
			await kavach.policies.recordUsage(agent.id); // second call breaches limit

			const updated = await kavach.policies.get(policy.id);
			expect(updated?.status).toBe("triggered");
		});
	});

	describe("resetDaily", () => {
		it("resets daily counters to zero", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "daily-reset-agent",
				type: "service",
				permissions: [],
			});

			const policy = await kavach.policies.create({
				agentId: agent.id,
				limits: { maxCallsPerDay: 100 },
				action: "block",
			});

			await kavach.policies.recordUsage(agent.id, 10);
			await kavach.policies.recordUsage(agent.id, 10);

			const { reset } = await kavach.policies.resetDaily();
			expect(reset).toBeGreaterThan(0);

			const updated = await kavach.policies.get(policy.id);
			expect(updated?.currentUsage.callsToday).toBe(0);
			expect(updated?.currentUsage.tokensCostToday).toBe(0);
			// Monthly counters should be preserved
			expect(updated?.currentUsage.callsThisMonth).toBe(2);
		});

		it("restores triggered status to active when daily reset clears the violation", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "restore-agent",
				type: "autonomous",
				permissions: [],
			});

			const policy = await kavach.policies.create({
				agentId: agent.id,
				limits: { maxCallsPerDay: 1 },
				action: "block",
			});

			await kavach.policies.recordUsage(agent.id);
			await kavach.policies.recordUsage(agent.id); // triggers

			await kavach.policies.resetDaily();

			const updated = await kavach.policies.get(policy.id);
			expect(updated?.status).toBe("active");
		});
	});

	describe("resetMonthly", () => {
		it("resets monthly counters to zero", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "monthly-agent",
				type: "service",
				permissions: [],
			});

			const policy = await kavach.policies.create({
				agentId: agent.id,
				limits: { maxCallsPerMonth: 500 },
				action: "warn",
			});

			await kavach.policies.recordUsage(agent.id);

			const { reset } = await kavach.policies.resetMonthly();
			expect(reset).toBeGreaterThan(0);

			const updated = await kavach.policies.get(policy.id);
			expect(updated?.currentUsage.callsThisMonth).toBe(0);
			expect(updated?.currentUsage.tokensCostThisMonth).toBe(0);
		});
	});
});
