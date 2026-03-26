import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPrismaAdapter } from "../src/adapter.js";
import type { KavachPrismaAdapter } from "../src/types.js";

// ─── Mock PrismaClient ────────────────────────────────────────────────────────

function makeModelMock() {
	return {
		findUnique: vi.fn(),
		findFirst: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		upsert: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		count: vi.fn(),
	};
}

function createMockPrisma() {
	const mocks = {
		kavachUser: makeModelMock(),
		kavachAgent: makeModelMock(),
		kavachPermission: makeModelMock(),
		kavachDelegationChain: makeModelMock(),
		kavachAuditLog: makeModelMock(),
		kavachSession: makeModelMock(),
		kavachRateLimit: makeModelMock(),
		kavachOAuthClient: makeModelMock(),
		kavachOAuthAccessToken: makeModelMock(),
		kavachOAuthAuthorizationCode: makeModelMock(),
		kavachMcpServer: makeModelMock(),
		kavachApiKey: makeModelMock(),
		kavachOrganization: makeModelMock(),
		kavachOrgMember: makeModelMock(),
		kavachOrgInvitation: makeModelMock(),
		kavachJwtRefreshToken: makeModelMock(),
		kavachTrustScore: makeModelMock(),
		kavachApprovalRequest: makeModelMock(),
		$transaction: vi.fn(),
	};
	return mocks;
}

type MockPrisma = ReturnType<typeof createMockPrisma>;

// ─── Test fixtures ────────────────────────────────────────────────────────────

const NOW = new Date("2025-01-01T00:00:00Z");

const USER = {
	id: "user-1",
	email: "alice@example.com",
	name: "Alice",
	username: null,
	externalId: null,
	externalProvider: null,
	metadata: null,
	banned: false,
	banReason: null,
	banExpiresAt: null,
	forcePasswordReset: false,
	stripeCustomerId: null,
	stripeSubscriptionId: null,
	stripeSubscriptionStatus: null,
	stripePriceId: null,
	stripeCurrentPeriodEnd: null,
	stripeCancelAtPeriodEnd: false,
	polarCustomerId: null,
	polarSubscriptionId: null,
	polarSubscriptionStatus: null,
	polarProductId: null,
	polarCurrentPeriodEnd: null,
	polarCancelAtPeriodEnd: false,
	createdAt: NOW,
	updatedAt: NOW,
};

const AGENT = {
	id: "agent-1",
	ownerId: "user-1",
	tenantId: null,
	name: "test-agent",
	type: "autonomous",
	status: "active",
	tokenHash: "abc123hash",
	tokenPrefix: "kv_abc123",
	expiresAt: null,
	lastActiveAt: null,
	metadata: null,
	createdAt: NOW,
	updatedAt: NOW,
};

const PERMISSION = {
	id: "perm-1",
	agentId: "agent-1",
	resource: "mcp:github:*",
	actions: ["read", "write"],
	constraints: null,
	createdAt: NOW,
};

const AUDIT_LOG = {
	id: "audit-1",
	agentId: "agent-1",
	userId: "user-1",
	action: "execute",
	resource: "mcp:github:create_issue",
	parameters: { title: "bug" },
	result: "allowed",
	reason: null,
	durationMs: 42,
	tokensCost: null,
	ip: "127.0.0.1",
	userAgent: "vitest",
	timestamp: NOW,
};

const SESSION = {
	id: "sess-1",
	userId: "user-1",
	expiresAt: new Date(NOW.getTime() + 86400000),
	metadata: null,
	createdAt: NOW,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("createPrismaAdapter", () => {
	let prisma: MockPrisma;
	let db: KavachPrismaAdapter;

	beforeEach(() => {
		prisma = createMockPrisma();
		db = createPrismaAdapter(prisma as any);
	});

	// ── Users ──────────────────────────────────────────────────────────────────

	describe("users", () => {
		it("findUserById calls findUnique with the correct where clause", async () => {
			prisma.kavachUser.findUnique.mockResolvedValue(USER);
			const result = await db.findUserById("user-1");
			expect(prisma.kavachUser.findUnique).toHaveBeenCalledWith({ where: { id: "user-1" } });
			expect(result).toEqual(USER);
		});

		it("findUserById returns null when not found", async () => {
			prisma.kavachUser.findUnique.mockResolvedValue(null);
			const result = await db.findUserById("missing");
			expect(result).toBeNull();
		});

		it("findUserByEmail calls findUnique with email", async () => {
			prisma.kavachUser.findUnique.mockResolvedValue(USER);
			const result = await db.findUserByEmail("alice@example.com");
			expect(prisma.kavachUser.findUnique).toHaveBeenCalledWith({
				where: { email: "alice@example.com" },
			});
			expect(result).toEqual(USER);
		});

		it("createUser calls create with input data", async () => {
			prisma.kavachUser.create.mockResolvedValue(USER);
			const input = { id: "user-1", email: "alice@example.com", createdAt: NOW, updatedAt: NOW };
			const result = await db.createUser(input);
			expect(prisma.kavachUser.create).toHaveBeenCalledWith({ data: input });
			expect(result).toEqual(USER);
		});

		it("updateUser calls update with id and data", async () => {
			const updated = { ...USER, name: "Alice Updated" };
			prisma.kavachUser.update.mockResolvedValue(updated);
			const result = await db.updateUser("user-1", { name: "Alice Updated" });
			expect(prisma.kavachUser.update).toHaveBeenCalledWith({
				where: { id: "user-1" },
				data: { name: "Alice Updated" },
			});
			expect(result.name).toBe("Alice Updated");
		});

		it("deleteUser calls delete with id", async () => {
			prisma.kavachUser.delete.mockResolvedValue(USER);
			await db.deleteUser("user-1");
			expect(prisma.kavachUser.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
		});
	});

	// ── Agents ─────────────────────────────────────────────────────────────────

	describe("agents", () => {
		it("findAgentById returns the agent", async () => {
			prisma.kavachAgent.findUnique.mockResolvedValue(AGENT);
			const result = await db.findAgentById("agent-1");
			expect(result).toEqual(AGENT);
		});

		it("findAgentById returns null when not found", async () => {
			prisma.kavachAgent.findUnique.mockResolvedValue(null);
			expect(await db.findAgentById("nope")).toBeNull();
		});

		it("findAgentByTokenHash calls findFirst with tokenHash", async () => {
			prisma.kavachAgent.findFirst.mockResolvedValue(AGENT);
			const result = await db.findAgentByTokenHash("abc123hash");
			expect(prisma.kavachAgent.findFirst).toHaveBeenCalledWith({
				where: { tokenHash: "abc123hash" },
			});
			expect(result).toEqual(AGENT);
		});

		it("listAgents with no filter returns all agents", async () => {
			prisma.kavachAgent.findMany.mockResolvedValue([AGENT]);
			const result = await db.listAgents();
			expect(prisma.kavachAgent.findMany).toHaveBeenCalledWith({
				where: {},
				orderBy: { createdAt: "desc" },
			});
			expect(result).toHaveLength(1);
		});

		it("listAgents with filter passes where clause", async () => {
			prisma.kavachAgent.findMany.mockResolvedValue([AGENT]);
			await db.listAgents({ ownerId: "user-1", status: "active" });
			expect(prisma.kavachAgent.findMany).toHaveBeenCalledWith({
				where: { ownerId: "user-1", status: "active" },
				orderBy: { createdAt: "desc" },
			});
		});

		it("createAgent calls create with input", async () => {
			prisma.kavachAgent.create.mockResolvedValue(AGENT);
			const result = await db.createAgent({
				id: "agent-1",
				ownerId: "user-1",
				name: "test-agent",
				type: "autonomous",
				tokenHash: "abc123hash",
				tokenPrefix: "kv_abc123",
				createdAt: NOW,
				updatedAt: NOW,
			});
			expect(result).toEqual(AGENT);
		});

		it("updateAgent calls update with id and data", async () => {
			const updated = { ...AGENT, status: "revoked" };
			prisma.kavachAgent.update.mockResolvedValue(updated);
			const result = await db.updateAgent("agent-1", { status: "revoked" });
			expect(result.status).toBe("revoked");
		});

		it("deleteAgent calls delete with id", async () => {
			prisma.kavachAgent.delete.mockResolvedValue(AGENT);
			await db.deleteAgent("agent-1");
			expect(prisma.kavachAgent.delete).toHaveBeenCalledWith({ where: { id: "agent-1" } });
		});
	});

	// ── Permissions ────────────────────────────────────────────────────────────

	describe("permissions", () => {
		it("findPermissionsByAgentId returns permissions list", async () => {
			prisma.kavachPermission.findMany.mockResolvedValue([PERMISSION]);
			const result = await db.findPermissionsByAgentId("agent-1");
			expect(prisma.kavachPermission.findMany).toHaveBeenCalledWith({
				where: { agentId: "agent-1" },
			});
			expect(result).toHaveLength(1);
		});

		it("createPermission calls create with input", async () => {
			prisma.kavachPermission.create.mockResolvedValue(PERMISSION);
			const result = await db.createPermission({
				id: "perm-1",
				agentId: "agent-1",
				resource: "mcp:github:*",
				actions: ["read", "write"],
				createdAt: NOW,
			});
			expect(result).toEqual(PERMISSION);
		});

		it("deletePermissionsByAgentId calls deleteMany with agentId", async () => {
			prisma.kavachPermission.deleteMany.mockResolvedValue({ count: 2 });
			await db.deletePermissionsByAgentId("agent-1");
			expect(prisma.kavachPermission.deleteMany).toHaveBeenCalledWith({
				where: { agentId: "agent-1" },
			});
		});

		it("deletePermission calls delete with id", async () => {
			prisma.kavachPermission.delete.mockResolvedValue(PERMISSION);
			await db.deletePermission("perm-1");
			expect(prisma.kavachPermission.delete).toHaveBeenCalledWith({ where: { id: "perm-1" } });
		});
	});

	// ── Audit logs ─────────────────────────────────────────────────────────────

	describe("audit logs", () => {
		it("createAuditLog calls create with input", async () => {
			prisma.kavachAuditLog.create.mockResolvedValue(AUDIT_LOG);
			const result = await db.createAuditLog({
				id: "audit-1",
				agentId: "agent-1",
				userId: "user-1",
				action: "execute",
				resource: "mcp:github:create_issue",
				result: "allowed",
				durationMs: 42,
				timestamp: NOW,
			});
			expect(result).toEqual(AUDIT_LOG);
		});

		it("queryAuditLogs with agentId filter builds correct where", async () => {
			prisma.kavachAuditLog.findMany.mockResolvedValue([AUDIT_LOG]);
			const result = await db.queryAuditLogs({ agentId: "agent-1" });
			expect(prisma.kavachAuditLog.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ agentId: "agent-1" }),
				}),
			);
			expect(result).toHaveLength(1);
		});

		it("queryAuditLogs with date range builds timestamp filter", async () => {
			prisma.kavachAuditLog.findMany.mockResolvedValue([]);
			const since = new Date("2025-01-01");
			const until = new Date("2025-02-01");
			await db.queryAuditLogs({ since, until });
			expect(prisma.kavachAuditLog.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						timestamp: { gte: since, lte: until },
					}),
				}),
			);
		});

		it("queryAuditLogs applies default limit of 100", async () => {
			prisma.kavachAuditLog.findMany.mockResolvedValue([]);
			await db.queryAuditLogs({});
			expect(prisma.kavachAuditLog.findMany).toHaveBeenCalledWith(
				expect.objectContaining({ take: 100, skip: 0 }),
			);
		});

		it("queryAuditLogs respects custom limit and offset", async () => {
			prisma.kavachAuditLog.findMany.mockResolvedValue([]);
			await db.queryAuditLogs({ limit: 25, offset: 50 });
			expect(prisma.kavachAuditLog.findMany).toHaveBeenCalledWith(
				expect.objectContaining({ take: 25, skip: 50 }),
			);
		});
	});

	// ── Sessions ───────────────────────────────────────────────────────────────

	describe("sessions", () => {
		it("findSessionById returns session", async () => {
			prisma.kavachSession.findUnique.mockResolvedValue(SESSION);
			const result = await db.findSessionById("sess-1");
			expect(result).toEqual(SESSION);
		});

		it("createSession calls create with input", async () => {
			prisma.kavachSession.create.mockResolvedValue(SESSION);
			const result = await db.createSession({
				id: "sess-1",
				userId: "user-1",
				expiresAt: SESSION.expiresAt,
				createdAt: NOW,
			});
			expect(result).toEqual(SESSION);
		});

		it("deleteSession calls delete with id", async () => {
			prisma.kavachSession.delete.mockResolvedValue(SESSION);
			await db.deleteSession("sess-1");
			expect(prisma.kavachSession.delete).toHaveBeenCalledWith({ where: { id: "sess-1" } });
		});

		it("deleteExpiredSessions calls deleteMany and returns count", async () => {
			prisma.kavachSession.deleteMany.mockResolvedValue({ count: 3 });
			const count = await db.deleteExpiredSessions();
			expect(count).toBe(3);
			expect(prisma.kavachSession.deleteMany).toHaveBeenCalled();
		});
	});

	// ── Delegation chains ──────────────────────────────────────────────────────

	describe("delegation chains", () => {
		const CHAIN = {
			id: "chain-1",
			fromAgentId: "agent-1",
			toAgentId: "agent-2",
			permissions: [{ resource: "mcp:*", actions: ["read"] }],
			depth: 1,
			maxDepth: 3,
			status: "active",
			expiresAt: new Date(NOW.getTime() + 3600000),
			createdAt: NOW,
		};

		it("findDelegationChain returns chain by id", async () => {
			prisma.kavachDelegationChain.findUnique.mockResolvedValue(CHAIN);
			const result = await db.findDelegationChain("chain-1");
			expect(result).toEqual(CHAIN);
		});

		it("findDelegationChainsByAgent filters by fromAgentId", async () => {
			prisma.kavachDelegationChain.findMany.mockResolvedValue([CHAIN]);
			const result = await db.findDelegationChainsByAgent("agent-1");
			expect(prisma.kavachDelegationChain.findMany).toHaveBeenCalledWith(
				expect.objectContaining({ where: { fromAgentId: "agent-1" } }),
			);
			expect(result).toHaveLength(1);
		});

		it("updateDelegationChain revokes a chain", async () => {
			const revoked = { ...CHAIN, status: "revoked" };
			prisma.kavachDelegationChain.update.mockResolvedValue(revoked);
			const result = await db.updateDelegationChain("chain-1", { status: "revoked" });
			expect(result.status).toBe("revoked");
		});
	});

	// ── Organizations ──────────────────────────────────────────────────────────

	describe("organizations", () => {
		const ORG = {
			id: "org-1",
			name: "Acme Corp",
			slug: "acme",
			ownerId: "user-1",
			metadata: null,
			createdAt: NOW,
			updatedAt: NOW,
		};

		it("findOrgBySlug returns org", async () => {
			prisma.kavachOrganization.findFirst.mockResolvedValue(ORG);
			const result = await db.findOrgBySlug("acme");
			expect(prisma.kavachOrganization.findFirst).toHaveBeenCalledWith({ where: { slug: "acme" } });
			expect(result).toEqual(ORG);
		});

		it("createOrg calls create with input", async () => {
			prisma.kavachOrganization.create.mockResolvedValue(ORG);
			const result = await db.createOrg({
				id: "org-1",
				name: "Acme Corp",
				slug: "acme",
				ownerId: "user-1",
				createdAt: NOW,
				updatedAt: NOW,
			});
			expect(result).toEqual(ORG);
		});

		it("findOrgMember queries by orgId and userId", async () => {
			const MEMBER = { id: "m-1", orgId: "org-1", userId: "user-1", role: "owner", joinedAt: NOW };
			prisma.kavachOrgMember.findFirst.mockResolvedValue(MEMBER);
			const result = await db.findOrgMember("org-1", "user-1");
			expect(prisma.kavachOrgMember.findFirst).toHaveBeenCalledWith({
				where: { orgId: "org-1", userId: "user-1" },
			});
			expect(result).toEqual(MEMBER);
		});

		it("deleteOrgMember calls deleteMany with orgId and userId", async () => {
			prisma.kavachOrgMember.deleteMany.mockResolvedValue({ count: 1 });
			await db.deleteOrgMember("org-1", "user-1");
			expect(prisma.kavachOrgMember.deleteMany).toHaveBeenCalledWith({
				where: { orgId: "org-1", userId: "user-1" },
			});
		});
	});

	// ── Trust scores ───────────────────────────────────────────────────────────

	describe("trust scores", () => {
		const TRUST = {
			agentId: "agent-1",
			score: 80,
			level: "trusted",
			factors: { successRate: 0.98 },
			computedAt: NOW,
		};

		it("findTrustScore returns score", async () => {
			prisma.kavachTrustScore.findUnique.mockResolvedValue(TRUST);
			const result = await db.findTrustScore("agent-1");
			expect(result).toEqual(TRUST);
		});

		it("upsertTrustScore calls upsert with agentId where", async () => {
			prisma.kavachTrustScore.upsert.mockResolvedValue(TRUST);
			const result = await db.upsertTrustScore(TRUST);
			expect(prisma.kavachTrustScore.upsert).toHaveBeenCalledWith(
				expect.objectContaining({ where: { agentId: "agent-1" } }),
			);
			expect(result).toEqual(TRUST);
		});
	});

	// ── Approval requests ──────────────────────────────────────────────────────

	describe("approval requests", () => {
		const APPROVAL = {
			id: "approval-1",
			agentId: "agent-1",
			userId: "user-1",
			action: "execute",
			resource: "mcp:github:delete_repo",
			arguments: { repo: "my-repo" },
			status: "pending",
			expiresAt: new Date(NOW.getTime() + 3600000),
			respondedAt: null,
			respondedBy: null,
			createdAt: NOW,
		};

		it("listPendingApprovals filters by agentId and pending status", async () => {
			prisma.kavachApprovalRequest.findMany.mockResolvedValue([APPROVAL]);
			const result = await db.listPendingApprovals("agent-1");
			expect(prisma.kavachApprovalRequest.findMany).toHaveBeenCalledWith(
				expect.objectContaining({ where: { agentId: "agent-1", status: "pending" } }),
			);
			expect(result).toHaveLength(1);
		});

		it("updateApprovalRequest approves a request", async () => {
			const approved = { ...APPROVAL, status: "approved", respondedAt: NOW, respondedBy: "user-1" };
			prisma.kavachApprovalRequest.update.mockResolvedValue(approved);
			const result = await db.updateApprovalRequest("approval-1", {
				status: "approved",
				respondedAt: NOW,
				respondedBy: "user-1",
			});
			expect(result.status).toBe("approved");
		});
	});

	// ── Transactions ───────────────────────────────────────────────────────────

	describe("transactions", () => {
		it("wraps the callback in prisma.$transaction", async () => {
			prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
				fn(prisma),
			);
			const spy = vi.fn().mockResolvedValue("result");
			const result = await db.transaction(spy);
			expect(prisma.$transaction).toHaveBeenCalled();
			expect(spy).toHaveBeenCalled();
			expect(result).toBe("result");
		});

		it("passes a new adapter instance into the transaction callback", async () => {
			prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
				fn(prisma),
			);
			let innerAdapter: KavachPrismaAdapter | undefined;
			await db.transaction(async (adapter) => {
				innerAdapter = adapter;
			});
			expect(innerAdapter).toBeDefined();
			expect(typeof innerAdapter?.findAgentById).toBe("function");
		});
	});

	// ── Rate limits ────────────────────────────────────────────────────────────

	describe("rate limits", () => {
		it("upsertRateLimit calls upsert with a derived id", async () => {
			const RATE = { id: "xxx", agentId: "agent-1", resource: "mcp:*", windowStart: NOW, count: 5 };
			prisma.kavachRateLimit.upsert.mockResolvedValue(RATE);
			const result = await db.upsertRateLimit("agent-1", "mcp:*", NOW, 5);
			expect(prisma.kavachRateLimit.upsert).toHaveBeenCalledWith(
				expect.objectContaining({
					create: expect.objectContaining({ agentId: "agent-1", resource: "mcp:*", count: 5 }),
					update: { count: 5 },
				}),
			);
			expect(result).toEqual(RATE);
		});
	});

	// ── OAuth ──────────────────────────────────────────────────────────────────

	describe("oauth", () => {
		it("findOAuthClientById queries by clientId field", async () => {
			const CLIENT = {
				id: "oc-1",
				clientId: "my-client",
				clientSecret: "secret",
				clientName: null,
				clientUri: null,
				redirectUris: ["https://app.example.com/callback"],
				grantTypes: ["authorization_code"],
				responseTypes: ["code"],
				tokenEndpointAuthMethod: "client_secret_basic",
				type: "confidential",
				disabled: false,
				metadata: null,
				createdAt: NOW,
				updatedAt: NOW,
			};
			prisma.kavachOAuthClient.findFirst.mockResolvedValue(CLIENT);
			const result = await db.findOAuthClientById("my-client");
			expect(prisma.kavachOAuthClient.findFirst).toHaveBeenCalledWith({
				where: { clientId: "my-client" },
			});
			expect(result?.clientId).toBe("my-client");
		});

		it("revokeOAuthAccessToken calls deleteMany with accessToken", async () => {
			prisma.kavachOAuthAccessToken.deleteMany.mockResolvedValue({ count: 1 });
			await db.revokeOAuthAccessToken("tok_abc");
			expect(prisma.kavachOAuthAccessToken.deleteMany).toHaveBeenCalledWith({
				where: { accessToken: "tok_abc" },
			});
		});
	});
});
