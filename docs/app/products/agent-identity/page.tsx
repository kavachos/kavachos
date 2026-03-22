import type { Metadata } from "next";
import { Key, ArrowRight, RotateCcw, XCircle, Terminal, Check } from "lucide-react";
import { Button } from "@/components/button";
import { Footer } from "@/components/footer";
import { NavSpacer } from "@/components/nav";
import { InteractiveGrid } from "@/components/interactive-grid";

export const metadata: Metadata = {
	title: "Agent identity",
	description:
		"Every AI agent gets a cryptographic identity, scoped permissions, and an immutable audit trail.",
};

const AGENT_TYPES = [
	{
		label: "01",
		title: "Autonomous",
		description: "Acts independently within its granted permissions. No user in the loop.",
		example: "autonomous",
	},
	{
		label: "02",
		title: "Delegated",
		description: "Receives a subset of a parent agent's permissions. Chain depth is configurable.",
		example: "delegated",
	},
	{
		label: "03",
		title: "Service",
		description: "Long-lived, for machine-to-machine calls. Typically has no expiry.",
		example: "service",
	},
] as const;

const LIFECYCLE_STEPS = [
	{ icon: Key, label: "Create", sub: "Agent created with type and permissions. Token returned once." },
	{ icon: Check, label: "Authorize", sub: "Every action calls authorize(). Constraints evaluated inline." },
	{ icon: RotateCcw, label: "Rotate", sub: "New token issued, old hash deleted atomically. No downtime." },
	{ icon: XCircle, label: "Revoke", sub: "Agent disabled instantly. Cascades to delegated sub-agents." },
] as const;

const COMP_ROWS: Array<{ feature: string; key: boolean | string; api: boolean | string }> = [
	{ feature: "Scoped to one agent", key: true, api: false },
	{ feature: "SHA-256 hashed at rest", key: true, api: false },
	{ feature: "Wildcard resource permissions", key: true, api: false },
	{ feature: "Atomic rotation", key: true, api: "manual" },
	{ feature: "Delegation chains", key: true, api: false },
	{ feature: "Immutable audit log", key: true, api: false },
	{ feature: "Rate limit constraints", key: true, api: false },
];

const CODE = `import { createKavach } from "kavachos";

const kavach = createKavach({ db, secret: process.env.KAVACH_SECRET });

// 1. Create an agent
const { agent, token } = await kavach.agents.create({
  userId: "user_123",
  name: "github-assistant",
  type: "autonomous",
  permissions: [{ resource: "mcp:github:*", actions: ["read", "write"] }],
});
// token = "kv_a3f8c2..." — shown once only

// 2. Authorize before every action
const result = await kavach.agents.authorize({
  token: agentToken,
  resource: "mcp:github:issues",
  action: "write",
});
if (!result.allowed) return { error: result.reason };

// 3. Rotate — old token invalidated atomically
const { token: newToken } = await kavach.agents.rotate(agent.id);`;

function cell(v: boolean | string) {
	if (v === true) return <Check className="mx-auto h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />;
	if (v === false) return <span className="text-fd-muted-foreground/25">&times;</span>;
	return <span className="text-[10px] text-amber-500">{v}</span>;
}

export default function AgentIdentityPage() {
	return (
		<div className="relative text-fd-foreground">
			<NavSpacer />
			<div className="flex flex-col lg:flex-row">
				{/* Left pane: sticky hero */}
				<div className="relative w-full border-b border-fd-border lg:sticky lg:top-[var(--nav-height)] lg:h-[calc(100vh-var(--nav-height))] lg:w-[40%] lg:overflow-hidden lg:border-b-0 lg:border-r">
					<div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--kavach-gold-mid)]/[0.06] blur-3xl" />
					<div className="relative flex h-full flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
						<div className="relative z-10">
							<span className="inline-block rounded-full border border-[var(--kavach-gold-mid)]/25 bg-[var(--kavach-gold-mid)]/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
								Core feature
							</span>
							<h1 className="mt-4 text-3xl font-extrabold tracking-tight text-lift sm:text-4xl xl:text-[2.75rem] xl:leading-[1.15]">
								Cryptographic identity for every agent
							</h1>
							<p className="mt-4 max-w-sm text-[15px] font-light text-fd-muted-foreground leading-relaxed">
								Every AI agent gets a unique bearer token, hashed with SHA-256. Permissions,
								rotation, and revocation are built in from day one.
							</p>
							<div className="mt-8 flex flex-wrap items-center gap-3">
								<Button href="/docs/agent-identity" variant="gold">
									Read docs
									<ArrowRight className="h-3.5 w-3.5" />
								</Button>
								<Button href="https://github.com/kavachos/kavachos" variant="outline" external>
									View source
								</Button>
							</div>
							<div className="mt-5">
								<code className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-3.5 py-2 font-mono text-xs text-fd-muted-foreground/80">
									<Terminal className="h-3.5 w-3.5 text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]" />
									pnpm add kavachos
								</code>
							</div>
						</div>
					</div>
					<div className="absolute inset-0 z-0 overflow-hidden">
						<InteractiveGrid />
					</div>
				</div>

				{/* Right pane: scrollable sections */}
				<div className="w-full lg:w-[60%]">
					{/* Section 1: How tokens work */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							How tokens work
						</p>
						<h2 className="font-heading mt-2 text-base font-semibold text-fd-foreground">
							Shown once, stored as a hash
						</h2>
						<p className="mt-1 text-[13px] font-light text-fd-muted-foreground">
							The raw token is returned at creation and never stored. Only the SHA-256 hash lives in your database — so a leak exposes nothing usable.
						</p>
						<div className="mt-4 space-y-3">
							<div className="flex items-center gap-3 rounded-lg border border-fd-border bg-fd-muted/40 px-4 py-3">
								<Key className="h-3.5 w-3.5 shrink-0 text-[var(--kavach-gold-primary)]" />
								<code className="font-mono text-[11px] text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-bright)]">
									kv_a3f8c2d91b4e7f05...
								</code>
								<span className="ml-auto rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] text-emerald-600 dark:text-emerald-400">
									active
								</span>
							</div>
							<div className="flex items-center gap-2 px-1">
								<div className="h-px flex-1 bg-fd-border" />
								<span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-fd-muted-foreground/50">SHA-256</span>
								<div className="h-px flex-1 bg-fd-border" />
							</div>
							<div className="flex items-start gap-3 rounded-lg border border-fd-border bg-fd-muted/40 px-4 py-3">
								<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-fd-muted-foreground/30" />
								<code className="break-all font-mono text-[10px] text-fd-muted-foreground/60">
									8d4f2a1c9b3e6d07f1a4b8c2d5e9f3a0b7c4d1e8f2a5b9c3d6e0f4a2...
								</code>
							</div>
						</div>
					</div>

					{/* Section 2: Agent types */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Agent types
						</p>
						<h2 className="font-heading mt-2 text-base font-semibold text-fd-foreground">
							Three roles, one identity model
						</h2>
						<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
							{AGENT_TYPES.map((t) => (
								<div key={t.label} className="rounded-lg border border-fd-border bg-fd-card/40 p-4 transition-colors hover:bg-fd-card/70">
									<span className="inline-block rounded-full border border-[var(--kavach-gold-mid)]/25 bg-[var(--kavach-gold-mid)]/8 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
										{t.label}
									</span>
									<h3 className="font-heading mt-2 text-base font-semibold text-fd-foreground">{t.title}</h3>
									<p className="mt-1 text-[13px] font-light text-fd-muted-foreground">{t.description}</p>
									<code className="mt-2 block font-mono text-[10px] text-fd-muted-foreground/50">type: &quot;{t.example}&quot;</code>
								</div>
							))}
						</div>
					</div>

					{/* Section 3: Token lifecycle */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Token lifecycle
						</p>
						<h2 className="font-heading mt-2 text-base font-semibold text-fd-foreground">
							Create, use, rotate, revoke
						</h2>
						<div className="mt-5 space-y-0">
							{LIFECYCLE_STEPS.map(({ icon: Icon, label, sub }, i) => (
								<div key={label} className="flex items-start gap-3">
									<div className="flex flex-col items-center">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fd-border bg-fd-card text-fd-muted-foreground/70">
											<Icon className="h-4 w-4" />
										</div>
										{i < LIFECYCLE_STEPS.length - 1 && <div className="w-px flex-1 bg-fd-border" style={{ minHeight: "1.5rem" }} />}
									</div>
									<div className="pb-5">
										<p className="text-[13px] font-medium text-fd-foreground">{label}</p>
										<p className="text-[11px] font-light text-fd-muted-foreground/60">{sub}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Section 4: Code example */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Code example
						</p>
						<h2 className="font-heading mt-2 text-base font-semibold text-fd-foreground">
							Three calls from zero to audited
						</h2>
						<pre className="mt-4 overflow-x-auto rounded-lg border border-fd-border bg-fd-muted/50 p-4 font-mono text-[11px] leading-relaxed text-fd-foreground/80">
							<code>{CODE}</code>
						</pre>
					</div>

					{/* Section 5: Comparison */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Compared to API keys
						</p>
						<h2 className="font-heading mt-2 text-base font-semibold text-fd-foreground">
							Why agent tokens beat shared API keys
						</h2>
						<p className="mt-1 text-[13px] font-light text-fd-muted-foreground">
							Shared API keys have no scope, no owner, and no audit trail.
						</p>
						<div className="mt-4 overflow-hidden rounded-lg border border-fd-border">
							<table className="w-full text-[12px]">
								<thead>
									<tr className="border-b border-fd-border bg-fd-secondary/30">
										<th className="px-3 py-2.5 text-left font-medium text-fd-muted-foreground/80" />
										<th className="px-3 py-2.5 text-center font-heading font-semibold text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">Agent token</th>
										<th className="px-3 py-2.5 text-center font-medium text-fd-muted-foreground/70">API key</th>
									</tr>
								</thead>
								<tbody className="text-fd-muted-foreground">
									{COMP_ROWS.map((r) => (
										<tr key={r.feature} className="border-b border-fd-border last:border-b-0">
											<td className="px-3 py-2.5 font-medium text-fd-foreground/80">{r.feature}</td>
											<td className="px-3 py-2.5 text-center">{cell(r.key)}</td>
											<td className="px-3 py-2.5 text-center">{cell(r.api)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* CTA */}
					<div className="px-6 py-12 text-center sm:px-10 lg:px-12">
						<h2 className="text-2xl font-bold tracking-tight text-lift sm:text-3xl">
							Start issuing agent tokens
						</h2>
						<p className="mx-auto mt-3 max-w-md text-sm font-light text-fd-muted-foreground/80 leading-relaxed">
							TypeScript-first, MIT licensed, works with SQLite, Postgres, or MySQL.
						</p>
						<div className="mt-8 flex flex-wrap justify-center gap-3">
							<Button href="/docs/agent-identity" variant="gold" size="lg">
								Read the docs
								<ArrowRight className="h-4 w-4" />
							</Button>
							<Button href="/products" variant="outline" size="lg">
								All products
							</Button>
						</div>
					</div>

					<Footer />
				</div>
			</div>
		</div>
	);
}
