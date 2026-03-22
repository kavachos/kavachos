import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { auditLogs } from "../src/db/schema.js";
import type { Kavach } from "./helpers.js";
import { createTestKavach } from "./helpers.js";

describe("audit log IP and User-Agent capture", () => {
	let kavach: Kavach;

	beforeEach(async () => {
		kavach = await createTestKavach({ auditAll: true });
	});

	it("writes ip and userAgent to audit log when context is provided", async () => {
		const agent = await kavach.agent.create({
			ownerId: "user-1",
			name: "context-test-agent",
			type: "autonomous",
			permissions: [{ resource: "tool:search", actions: ["execute"] }],
		});

		const result = await kavach.authorize(
			agent.id,
			{ action: "execute", resource: "tool:search" },
			{ ip: "203.0.113.42", userAgent: "TestAgent/1.0" },
		);

		expect(result.allowed).toBe(true);

		const rows = await kavach.db.select().from(auditLogs).where(eq(auditLogs.agentId, agent.id));

		expect(rows).toHaveLength(1);
		const row = rows[0];
		expect(row).toBeDefined();
		expect(row?.ip).toBe("203.0.113.42");
		expect(row?.userAgent).toBe("TestAgent/1.0");
	});

	it("writes ip and userAgent for denied requests when context is provided", async () => {
		const agent = await kavach.agent.create({
			ownerId: "user-1",
			name: "denied-context-agent",
			type: "autonomous",
			permissions: [{ resource: "tool:search", actions: ["execute"] }],
		});

		const result = await kavach.authorize(
			agent.id,
			{ action: "delete", resource: "tool:search" },
			{ ip: "198.51.100.7", userAgent: "BotClient/2.3" },
		);

		expect(result.allowed).toBe(false);

		const rows = await kavach.db.select().from(auditLogs).where(eq(auditLogs.agentId, agent.id));

		expect(rows).toHaveLength(1);
		const row = rows[0];
		expect(row).toBeDefined();
		expect(row?.ip).toBe("198.51.100.7");
		expect(row?.userAgent).toBe("BotClient/2.3");
		expect(row?.result).toBe("denied");
	});

	it("writes null ip and userAgent when no context is provided", async () => {
		const agent = await kavach.agent.create({
			ownerId: "user-1",
			name: "no-context-agent",
			type: "autonomous",
			permissions: [{ resource: "tool:search", actions: ["execute"] }],
		});

		await kavach.authorize(agent.id, { action: "execute", resource: "tool:search" });

		const rows = await kavach.db.select().from(auditLogs).where(eq(auditLogs.agentId, agent.id));

		expect(rows).toHaveLength(1);
		const row = rows[0];
		expect(row).toBeDefined();
		expect(row?.ip).toBeNull();
		expect(row?.userAgent).toBeNull();
	});

	it("writes ip and userAgent when using authorizeByToken with context", async () => {
		const agent = await kavach.agent.create({
			ownerId: "user-1",
			name: "token-context-agent",
			type: "service",
			permissions: [{ resource: "api:data", actions: ["read"] }],
		});

		const result = await kavach.authorizeByToken(
			agent.token,
			{ action: "read", resource: "api:data" },
			{ ip: "10.0.0.5", userAgent: "ServiceClient/3.0" },
		);

		expect(result.allowed).toBe(true);

		const rows = await kavach.db.select().from(auditLogs).where(eq(auditLogs.agentId, agent.id));

		expect(rows).toHaveLength(1);
		const row = rows[0];
		expect(row).toBeDefined();
		expect(row?.ip).toBe("10.0.0.5");
		expect(row?.userAgent).toBe("ServiceClient/3.0");
	});
});
