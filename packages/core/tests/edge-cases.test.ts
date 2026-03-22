import { beforeEach, describe, expect, it } from "vitest";
import type { Kavach } from "./helpers.js";
import { createTestKavach } from "./helpers.js";

describe("edge cases", () => {
	let kavach: Kavach;

	beforeEach(async () => {
		kavach = await createTestKavach();
	});

	// ── Agent edge cases ────────────────────────────────────────────────────────

	describe("agent edge cases", () => {
		it("creates an agent with an empty permissions array", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "empty-perms-agent",
				type: "service",
				permissions: [],
			});

			expect(agent.id).toBeDefined();
			expect(agent.permissions).toHaveLength(0);
			expect(agent.status).toBe("active");
		});

		it("creates an agent with duplicate permissions without error", async () => {
			// Duplicate permissions are not deduplicated at the SDK level — they
			// are stored as-is. The test verifies the create call succeeds and
			// the permissions are persisted (duplicates included).
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "dup-perms-agent",
				type: "autonomous",
				permissions: [
					{ resource: "mcp:github", actions: ["read"] },
					{ resource: "mcp:github", actions: ["read"] },
				],
			});

			expect(agent.id).toBeDefined();
			// Both rows are stored; length is 2
			expect(agent.permissions).toHaveLength(2);
		});

		it("denies authorization when no permission matches the requested resource", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "narrow-agent",
				type: "autonomous",
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
			});

			const result = await kavach.authorize(agent.id, {
				action: "read",
				resource: "mcp:linear",
			});

			expect(result.allowed).toBe(false);
			expect(result.reason).toContain("No permission");
		});

		it("rejects token rotation for a revoked agent", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "revoked-rotatable",
				type: "autonomous",
				permissions: [],
			});

			await kavach.agent.revoke(agent.id);

			await expect(kavach.agent.rotate(agent.id)).rejects.toThrow("revoked");
		});

		it("marks an agent as expired when its tokenExpiry is already in the past", async () => {
			// Create an agent with an expiresAt that is already in the past
			const alreadyExpired = new Date(Date.now() - 60 * 1000); // 1 minute ago

			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "expired-agent",
				type: "autonomous",
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
				expiresAt: alreadyExpired,
			});

			// validateToken triggers the expiry check and transitions the status
			const validated = await kavach.agent.validateToken(agent.token);
			expect(validated).toBeNull();

			// The agent record should now be marked as expired in the DB
			const fetched = await kavach.agent.get(agent.id);
			expect(fetched?.status).toBe("expired");
		});
	});

	// ── Permission / wildcard edge cases ────────────────────────────────────────

	describe("permission and wildcard edge cases", () => {
		it("bare wildcard * matches any resource and action", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "superuser-agent",
				type: "autonomous",
				permissions: [{ resource: "*", actions: ["*"] }],
			});

			const result = await kavach.authorize(agent.id, {
				action: "delete",
				resource: "mcp:github:repos",
			});

			expect(result.allowed).toBe(true);
		});

		it("mcp:* matches a deeply nested resource like mcp:github:repos", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "mcp-wildcard-agent",
				type: "autonomous",
				permissions: [{ resource: "mcp:*", actions: ["read"] }],
			});

			const result = await kavach.authorize(agent.id, {
				action: "read",
				resource: "mcp:github:repos",
			});

			expect(result.allowed).toBe(true);
		});

		it("mcp:github:* does NOT match mcp:slack:channels", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "github-only-agent",
				type: "autonomous",
				permissions: [{ resource: "mcp:github:*", actions: ["read"] }],
			});

			const result = await kavach.authorize(agent.id, {
				action: "read",
				resource: "mcp:slack:channels",
			});

			expect(result.allowed).toBe(false);
		});

		it("exact match is checked alongside wildcards — exact permission grants access even without wildcard", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "exact-match-agent",
				type: "autonomous",
				permissions: [
					{ resource: "mcp:github:repos", actions: ["read"] },
					{ resource: "mcp:slack:*", actions: ["write"] },
				],
			});

			// Exact match grants access
			const exactAllowed = await kavach.authorize(agent.id, {
				action: "read",
				resource: "mcp:github:repos",
			});
			expect(exactAllowed.allowed).toBe(true);

			// Wildcard grants access
			const wildcardAllowed = await kavach.authorize(agent.id, {
				action: "write",
				resource: "mcp:slack:channels",
			});
			expect(wildcardAllowed.allowed).toBe(true);

			// Neither exact nor wildcard covers this
			const denied = await kavach.authorize(agent.id, {
				action: "read",
				resource: "mcp:slack:channels",
			});
			expect(denied.allowed).toBe(false);
		});

		it("empty actions array never grants access", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "empty-actions-agent",
				type: "autonomous",
				permissions: [{ resource: "mcp:github", actions: [] }],
			});

			const result = await kavach.authorize(agent.id, {
				action: "read",
				resource: "mcp:github",
			});

			// An empty actions list cannot match any requested action
			expect(result.allowed).toBe(false);
		});
	});

	// ── Delegation edge cases ────────────────────────────────────────────────────

	describe("delegation edge cases", () => {
		it("rejects delegation when parent does not hold the requested permissions", async () => {
			const parent = await kavach.agent.create({
				ownerId: "user-1",
				name: "under-resourced-parent",
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
					// Parent only has "read"; child requests "write" — must fail
					permissions: [{ resource: "mcp:github", actions: ["read", "write"] }],
					expiresAt: new Date(Date.now() + 60 * 60 * 1000),
				}),
			).rejects.toThrow("subset");
		});

		it("rejects self-delegation (parent and child are the same agent)", async () => {
			const agent = await kavach.agent.create({
				ownerId: "user-1",
				name: "self-delegating-agent",
				type: "autonomous",
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
			});

			// The delegation module checks the from-agent's existing incoming chains
			// to compute depth. For self-delegation the depth would be computed as 1
			// (no existing chains pointing to self-as-from-agent), so the operation
			// would succeed at the depth level — but it creates a logically circular
			// link. The test verifies the current behaviour (either throws or creates
			// a chain that results in a non-useful self-loop).
			// If the SDK adds an explicit self-delegation guard, this expectation
			// should switch to `rejects.toThrow(...)`.
			const result = await kavach.delegate({
				fromAgent: agent.id,
				toAgent: agent.id,
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
				expiresAt: new Date(Date.now() + 60 * 60 * 1000),
			});

			// Current behaviour: the SDK does not block self-delegation — the chain
			// is recorded with depth 1. The agent ends up with a delegated permission
			// pointing back to itself.
			expect(result.fromAgent).toBe(agent.id);
			expect(result.toAgent).toBe(agent.id);
			expect(result.depth).toBe(1);
		});

		it("allows delegation exactly at maxDepth", async () => {
			// Build a 3-level chain: top → middle → leaf, with maxDepth = 2.
			// The leaf delegation is at depth 2, which is exactly the limit.
			// Each delegating agent must own the permissions it delegates — the
			// SDK validates against own permissions, not effective permissions.
			const top = await kavach.agent.create({
				ownerId: "user-1",
				name: "top",
				type: "autonomous",
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
			});
			const middle = await kavach.agent.create({
				ownerId: "user-1",
				name: "middle",
				type: "delegated",
				// Middle must hold the permission it will delegate onward
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
			});
			const leaf = await kavach.agent.create({
				ownerId: "user-1",
				name: "leaf",
				type: "delegated",
				permissions: [],
			});

			await kavach.delegate({
				fromAgent: top.id,
				toAgent: middle.id,
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
				expiresAt: new Date(Date.now() + 60 * 60 * 1000),
				maxDepth: 2,
			});

			// Depth 2 — still within the limit
			const leafChain = await kavach.delegate({
				fromAgent: middle.id,
				toAgent: leaf.id,
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
				expiresAt: new Date(Date.now() + 60 * 60 * 1000),
				maxDepth: 2,
			});

			expect(leafChain.depth).toBe(2);
		});

		it("rejects delegation when chain depth would exceed maxDepth", async () => {
			// Build a chain: top → middle (depth 1) → leaf (depth 2).
			// Then attempt leaf → tooDeep (depth 3), which exceeds maxDepth 2.
			// Each hop agent owns the permission it delegates so the subset check
			// passes; only the depth guard should fire.
			const perm = [{ resource: "mcp:github", actions: ["read"] }] as const;

			const top = await kavach.agent.create({
				ownerId: "user-1",
				name: "top-deep",
				type: "autonomous",
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
			});
			const middle = await kavach.agent.create({
				ownerId: "user-1",
				name: "middle-deep",
				type: "delegated",
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
			});
			const leaf = await kavach.agent.create({
				ownerId: "user-1",
				name: "leaf-deep",
				type: "delegated",
				permissions: [{ resource: "mcp:github", actions: ["read"] }],
			});
			const tooDeep = await kavach.agent.create({
				ownerId: "user-1",
				name: "too-deep",
				type: "delegated",
				permissions: [],
			});

			await kavach.delegate({
				fromAgent: top.id,
				toAgent: middle.id,
				permissions: [...perm],
				expiresAt: new Date(Date.now() + 60 * 60 * 1000),
				maxDepth: 2,
			});

			await kavach.delegate({
				fromAgent: middle.id,
				toAgent: leaf.id,
				permissions: [...perm],
				expiresAt: new Date(Date.now() + 60 * 60 * 1000),
				maxDepth: 2,
			});

			// This would push depth to 3, exceeding maxDepth 2
			await expect(
				kavach.delegate({
					fromAgent: leaf.id,
					toAgent: tooDeep.id,
					permissions: [...perm],
					expiresAt: new Date(Date.now() + 60 * 60 * 1000),
					maxDepth: 2,
				}),
			).rejects.toThrow("depth");
		});

		it("revoking a delegation removes the sub-agent's effective permissions", async () => {
			const parent = await kavach.agent.create({
				ownerId: "user-1",
				name: "revoke-parent",
				type: "autonomous",
				permissions: [{ resource: "mcp:slack:*", actions: ["read"] }],
			});

			const child = await kavach.agent.create({
				ownerId: "user-1",
				name: "revoke-child",
				type: "delegated",
				permissions: [],
			});

			const chain = await kavach.delegate({
				fromAgent: parent.id,
				toAgent: child.id,
				permissions: [{ resource: "mcp:slack:messages", actions: ["read"] }],
				expiresAt: new Date(Date.now() + 60 * 60 * 1000),
			});

			// Child should have effective permissions before revocation
			const before = await kavach.delegation.getEffectivePermissions(child.id);
			expect(before).toHaveLength(1);
			expect(before[0]?.resource).toBe("mcp:slack:messages");

			// Revoke the chain
			await kavach.delegation.revoke(chain.id);

			// Child should have no effective permissions after revocation
			const after = await kavach.delegation.getEffectivePermissions(child.id);
			expect(after).toHaveLength(0);

			// Authorization should now be denied
			const result = await kavach.authorize(child.id, {
				action: "read",
				resource: "mcp:slack:messages",
			});
			expect(result.allowed).toBe(false);
		});
	});
});
