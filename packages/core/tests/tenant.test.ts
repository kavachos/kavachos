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

describe("tenant module", () => {
	let kavach: Kavach;

	beforeEach(async () => {
		kavach = await createTestKavach();
	});

	describe("create", () => {
		it("creates a tenant with valid slug", async () => {
			const tenant = await kavach.tenant.create({
				name: "Acme Corp",
				slug: "acme-corp",
			});

			expect(tenant.id).toMatch(/^tnt_/);
			expect(tenant.name).toBe("Acme Corp");
			expect(tenant.slug).toBe("acme-corp");
			expect(tenant.status).toBe("active");
			expect(tenant.settings).toEqual({});
			expect(tenant.createdAt).toBeInstanceOf(Date);
			expect(tenant.updatedAt).toBeInstanceOf(Date);
		});

		it("creates a tenant with settings", async () => {
			const tenant = await kavach.tenant.create({
				name: "Startup Inc",
				slug: "startup-inc",
				settings: {
					maxAgents: 50,
					auditRetentionDays: 90,
					allowedAgentTypes: ["autonomous", "service"],
				},
			});

			expect(tenant.settings.maxAgents).toBe(50);
			expect(tenant.settings.auditRetentionDays).toBe(90);
			expect(tenant.settings.allowedAgentTypes).toEqual(["autonomous", "service"]);
		});

		it("rejects invalid slug characters", async () => {
			await expect(kavach.tenant.create({ name: "Bad Slug", slug: "Bad Slug!" })).rejects.toThrow(
				"Invalid slug",
			);
		});

		it("rejects duplicate slug", async () => {
			await kavach.tenant.create({ name: "First", slug: "my-org" });
			await expect(kavach.tenant.create({ name: "Second", slug: "my-org" })).rejects.toThrow(
				"already exists",
			);
		});
	});

	describe("get", () => {
		it("returns tenant by id", async () => {
			const created = await kavach.tenant.create({ name: "Org A", slug: "org-a" });
			const found = await kavach.tenant.get(created.id);

			expect(found).not.toBeNull();
			expect(found?.id).toBe(created.id);
			expect(found?.slug).toBe("org-a");
		});

		it("returns null for unknown id", async () => {
			const result = await kavach.tenant.get("tnt_nonexistent");
			expect(result).toBeNull();
		});
	});

	describe("getBySlug", () => {
		it("returns tenant by slug", async () => {
			await kavach.tenant.create({ name: "Org B", slug: "org-b" });
			const found = await kavach.tenant.getBySlug("org-b");

			expect(found).not.toBeNull();
			expect(found?.name).toBe("Org B");
		});

		it("returns null for unknown slug", async () => {
			const result = await kavach.tenant.getBySlug("does-not-exist");
			expect(result).toBeNull();
		});
	});

	describe("list", () => {
		it("lists all tenants", async () => {
			await kavach.tenant.create({ name: "Alpha", slug: "alpha" });
			await kavach.tenant.create({ name: "Beta", slug: "beta" });

			const all = await kavach.tenant.list();
			expect(all.length).toBeGreaterThanOrEqual(2);
			const slugs = all.map((t) => t.slug);
			expect(slugs).toContain("alpha");
			expect(slugs).toContain("beta");
		});
	});

	describe("update", () => {
		it("updates tenant name", async () => {
			const tenant = await kavach.tenant.create({ name: "Old Name", slug: "old-name" });
			const updated = await kavach.tenant.update(tenant.id, { name: "New Name" });

			expect(updated.name).toBe("New Name");
			expect(updated.slug).toBe("old-name"); // slug unchanged
		});

		it("updates slug when valid and unique", async () => {
			const tenant = await kavach.tenant.create({ name: "Org", slug: "original-slug" });
			const updated = await kavach.tenant.update(tenant.id, { slug: "new-slug" });

			expect(updated.slug).toBe("new-slug");
		});

		it("rejects slug conflict on update", async () => {
			const a = await kavach.tenant.create({ name: "A", slug: "slug-a" });
			await kavach.tenant.create({ name: "B", slug: "slug-b" });

			await expect(kavach.tenant.update(a.id, { slug: "slug-b" })).rejects.toThrow(
				"already exists",
			);
		});

		it("merges settings on update", async () => {
			const tenant = await kavach.tenant.create({
				name: "Org",
				slug: "settings-org",
				settings: { maxAgents: 10, auditRetentionDays: 30 },
			});

			const updated = await kavach.tenant.update(tenant.id, {
				settings: { maxAgents: 50 },
			});

			expect(updated.settings.maxAgents).toBe(50);
			expect(updated.settings.auditRetentionDays).toBe(30); // preserved
		});

		it("throws for unknown tenant", async () => {
			await expect(kavach.tenant.update("tnt_ghost", { name: "Ghost" })).rejects.toThrow(
				"not found",
			);
		});
	});

	describe("suspend / activate", () => {
		it("suspends an active tenant", async () => {
			const tenant = await kavach.tenant.create({ name: "Org", slug: "suspendable" });
			expect(tenant.status).toBe("active");

			await kavach.tenant.suspend(tenant.id);

			const updated = await kavach.tenant.get(tenant.id);
			expect(updated?.status).toBe("suspended");
		});

		it("activates a suspended tenant", async () => {
			const tenant = await kavach.tenant.create({ name: "Org", slug: "reactivatable" });
			await kavach.tenant.suspend(tenant.id);
			await kavach.tenant.activate(tenant.id);

			const updated = await kavach.tenant.get(tenant.id);
			expect(updated?.status).toBe("active");
		});

		it("throws suspend for unknown tenant", async () => {
			await expect(kavach.tenant.suspend("tnt_ghost")).rejects.toThrow("not found");
		});

		it("throws activate for unknown tenant", async () => {
			await expect(kavach.tenant.activate("tnt_ghost")).rejects.toThrow("not found");
		});
	});

	describe("agent tenant scoping", () => {
		it("creates an agent scoped to a tenant", async () => {
			const tenant = await kavach.tenant.create({ name: "Acme", slug: "acme" });

			const agent = await kavach.agent.create({
				ownerId: "user-1",
				tenantId: tenant.id,
				name: "scoped-agent",
				type: "autonomous",
				permissions: [],
			});

			expect(agent.tenantId).toBe(tenant.id);
		});

		it("filters agents by tenantId", async () => {
			const tenant = await kavach.tenant.create({ name: "TenantX", slug: "tenant-x" });

			await kavach.agent.create({
				ownerId: "user-1",
				tenantId: tenant.id,
				name: "tenant-agent",
				type: "autonomous",
				permissions: [],
			});

			await kavach.agent.create({
				ownerId: "user-1",
				name: "global-agent",
				type: "service",
				permissions: [],
			});

			const tenantAgents = await kavach.agent.list({ tenantId: tenant.id });
			expect(tenantAgents.every((a) => a.tenantId === tenant.id)).toBe(true);
			expect(tenantAgents.map((a) => a.name)).toContain("tenant-agent");
			expect(tenantAgents.map((a) => a.name)).not.toContain("global-agent");
		});
	});
});
