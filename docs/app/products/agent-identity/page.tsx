import type { Metadata } from "next";
import {
	Key,
	ArrowRight,
	RotateCcw,
	XCircle,
	Terminal,
	Check,
	Shield,
	Layers,
	GitBranch,
	Clock,
	MapPin,
	Cpu,
	Lock,
	Fingerprint,
	Activity,
} from "lucide-react";
import { Button } from "@/components/button";
import { HighlightedCode } from "@/components/highlighted-code";
import { InteractiveGrid } from "@/components/interactive-grid";

export const metadata: Metadata = {
	title: "Agent identity",
	description:
		"Every AI agent gets a cryptographic identity, scoped permissions, and an immutable audit trail. Stop sharing API keys between agents.",
};

const AGENT_TYPES = [
	{
		label: "01",
		title: "Autonomous",
		description:
			"Acts independently within its granted permissions. No user in the loop. Good for scheduled tasks, background jobs, and pipelines that run unattended.",
		bullets: [
			"Permissions locked at creation — no scope creep",
			"Every action checked inline via authorize()",
			"Audit log entry per call, with result and latency",
		],
		example: "autonomous",
	},
	{
		label: "02",
		title: "Delegated",
		description:
			"Receives a subset of a parent agent's permissions. Useful when a root agent spins up sub-agents to handle parallel workloads.",
		bullets: [
			"Cannot grant more than the parent holds",
			"Revoke the root, the whole chain dies",
			"Chain depth tracked and audited",
		],
		example: "delegated",
	},
	{
		label: "03",
		title: "Service",
		description:
			"Long-lived, for machine-to-machine calls. No session dependency. Typically no expiry — rotation handles credential hygiene instead.",
		bullets: [
			"No user session dependency",
			"Rotate without downtime — atomic swap",
			"Rate-limited and budget-capped independently",
		],
		example: "service",
	},
] as const;

const LIFECYCLE_STEPS = [
	{
		icon: Key,
		label: "Create",
		sub: "Agent created with type and permissions. Token returned once, never stored raw.",
	},
	{
		icon: Check,
		label: "Authorize",
		sub: "Every action calls authorize(). Constraints evaluated inline — no round-trips.",
	},
	{
		icon: RotateCcw,
		label: "Rotate",
		sub: "New token issued, old hash deleted atomically. Zero downtime, no coordination.",
	},
	{
		icon: XCircle,
		label: "Revoke",
		sub: "Agent disabled instantly. Cascades to all delegated sub-agents automatically.",
	},
] as const;

const COMP_ROWS: Array<{ feature: string; key: boolean | string; api: boolean | string }> = [
	{ feature: "Scoped to one agent", key: true, api: false },
	{ feature: "SHA-256 hashed at rest", key: true, api: false },
	{ feature: "Wildcard resource permissions", key: true, api: false },
	{ feature: "Atomic rotation", key: true, api: "manual" },
	{ feature: "Delegation chains", key: true, api: false },
	{ feature: "Per-agent audit trail", key: true, api: false },
	{ feature: "Budget caps", key: true, api: false },
	{ feature: "Trust scoring", key: true, api: false },
	{ feature: "W3C DID portable identity", key: true, api: false },
	{ feature: "Rate limit constraints", key: true, api: false },
];

const CONSTRAINT_TYPES = [
	{
		icon: Activity,
		label: "Rate limits",
		detail: "maxCallsPerMinute, maxCallsPerDay",
		example: "{ maxCallsPerDay: 5000 }",
		desc: "Hard cap on request frequency. Exceeding it blocks the agent until the window resets.",
	},
	{
		icon: Clock,
		label: "Time windows",
		detail: "allowedHoursUTC",
		example: '{ allowedHoursUTC: "09:00-18:00" }',
		desc: "Restrict agents to business hours or a declared active period. Off-hours access is blocked and logged.",
	},
	{
		icon: MapPin,
		label: "IP allowlists",
		detail: "ipAllowlist",
		example: '{ ipAllowlist: ["10.0.0.0/8"] }',
		desc: "Lock an agent to known infrastructure. Requests from unlisted IPs are denied before reaching your handler.",
	},
	{
		icon: Shield,
		label: "Approval gates",
		detail: "requireApprovalFor",
		example: '{ requireApprovalFor: ["payments:write"] }',
		desc: "High-risk actions pause for human review. The agent queues the request and waits for explicit approval.",
	},
	{
		icon: Cpu,
		label: "Budget caps",
		detail: "budgetUsdPerDay, budgetUsdPerMonth",
		example: "{ budgetUsdPerDay: 2.00 }",
		desc: "Token cost limit enforced inline during authorize(). Agent is throttled at 80% and blocked at the cap.",
	},
	{
		icon: Lock,
		label: "Argument patterns",
		detail: "argPatterns",
		example: '{ argPatterns: { path: "^/api/.*" } }',
		desc: "Regex patterns that argument values must match. Good for scoping file access or URL patterns.",
	},
] as const;

const CODE = `import { createKavach } from "kavachos";

const kavach = createKavach({ db, secret: process.env.KAVACH_SECRET });

// Step 1 — create an agent. Token shown once only.
const { agent, token } = await kavach.agents.create({
  userId: "user_123",
  name: "github-assistant",
  type: "autonomous",
  permissions: [{ resource: "mcp:github:*", actions: ["read", "write"] }],
  constraints: { maxCallsPerDay: 5000, budgetUsdPerDay: 2.00 },
});
// token = "kv_a3f8c2..." — never stored, only the SHA-256 hash is

// Step 2 — authorize before every action
const result = await kavach.agents.authorize({
  token: agentToken,
  resource: "mcp:github:issues",
  action: "write",
});
if (!result.allowed) return { error: result.reason };

// Step 3 — rotate. Old token invalidated atomically.
const { token: newToken } = await kavach.agents.rotate(agent.id);`;

const STATS = [
	{ value: "700+", label: "tests passing" },
	{ value: "9", label: "OAuth providers" },
	{ value: "7", label: "framework adapters" },
	{ value: "3", label: "database backends" },
];

function cell(v: boolean | string) {
	if (v === true)
		return <Check className="mx-auto h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />;
	if (v === false) return <span className="text-fd-muted-foreground/25">&times;</span>;
	return <span className="text-[10px] text-amber-500">{v}</span>;
}

export default function AgentIdentityPage() {
	return (
		<div className="relative text-fd-foreground">
			<div className="flex flex-col lg:flex-row">
				{/* Left pane: sticky hero */}
				<div className="relative w-full border-b border-fd-border lg:sticky lg:top-[var(--nav-height)] lg:h-[calc(100vh-var(--nav-height))] lg:w-[40%] lg:overflow-hidden lg:border-b-0 lg:border-r">
					<div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--kavach-gold-mid)]/[0.06] blur-3xl" />
					<div className="relative flex h-full flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
						<div className="relative z-10">
							<span className="inline-block rounded-full border border-[var(--kavach-gold-mid)]/25 bg-[var(--kavach-gold-mid)]/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
								Agent identity
							</span>
							<h1 className="mt-4 text-3xl font-extrabold tracking-tight text-lift sm:text-4xl xl:text-[2.75rem] xl:leading-[1.15]">
								Stop sharing API keys{" "}
								<span className="gradient-gold-text text-lift-gold">between agents</span>
							</h1>
							<p className="mt-4 max-w-sm text-[15px] font-light leading-relaxed text-fd-muted-foreground">
								Shared API keys have no owner, no scope, and no audit trail. When one
								leaks, every agent using it is exposed. KavachOS gives each agent its
								own cryptographic identity — with permissions and rotation built in.
							</p>

							{/* Stats row */}
							<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
								{STATS.map((s) => (
									<div
										key={s.label}
										className="rounded-lg border border-[var(--kavach-border-ghost)] bg-[var(--kavach-surface-low)]/40 px-3 py-2 text-center"
									>
										<p className="font-mono text-base font-bold text-[var(--kavach-gold-primary)]">
											{s.value}
										</p>
										<p className="mt-0.5 text-[10px] text-fd-muted-foreground/60">{s.label}</p>
									</div>
								))}
							</div>

							<div className="mt-6 flex flex-wrap items-center gap-3">
								<Button href="/docs/agent-identity" variant="gold">
									Read docs
									<ArrowRight className="h-3.5 w-3.5" />
								</Button>
								<Button href="https://github.com/kavachos/kavachos" variant="outline" external>
									View source
								</Button>
							</div>
							<div className="mt-4">
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
					{/* Section: How tokens work */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							How tokens work
						</p>
						<h2 className="section-heading font-heading mt-2 text-base font-semibold text-fd-foreground">
							Shown once, stored as a hash
						</h2>
						<p className="mt-3 text-[13px] font-light text-fd-muted-foreground">
							The raw token is returned at creation and never stored. Only the SHA-256
							hash lives in your database. A breach exposes nothing usable.
						</p>
						<div className="mt-4 space-y-3">
							<div className="lifted-card flex items-center gap-3 rounded-lg border border-fd-border bg-fd-muted/40 px-4 py-3">
								<Key className="h-3.5 w-3.5 shrink-0 text-[var(--kavach-gold-primary)]" />
								<code className="font-mono text-[11px] text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-bright)]">
									kv_a3f8c2d91b4e7f05...
								</code>
								<span className="ml-auto rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] text-emerald-600 dark:text-emerald-400">
									returned once
								</span>
							</div>
							<div className="flex items-center gap-2 px-1">
								<div className="h-px flex-1 bg-fd-border" />
								<span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-fd-muted-foreground/50">
									SHA-256
								</span>
								<div className="h-px flex-1 bg-fd-border" />
							</div>
							<div className="flex items-start gap-3 rounded-lg border border-fd-border bg-fd-muted/40 px-4 py-3">
								<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-fd-muted-foreground/30" />
								<div>
									<code className="break-all font-mono text-[10px] text-fd-muted-foreground/60">
										8d4f2a1c9b3e6d07f1a4b8c2d5e9f3a0b7c4d1e8f2a5b9c3d6e0f4a2...
									</code>
									<p className="mt-1 text-[10px] text-fd-muted-foreground/40">
										stored in db — useless without the raw token
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Section: Agent types */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Agent types
						</p>
						<h2 className="section-heading font-heading mt-2 text-base font-semibold text-fd-foreground">
							Three roles, one identity model
						</h2>
						<p className="mt-3 text-[13px] font-light text-fd-muted-foreground">
							Each type maps to a different operational pattern. The SDK enforces the
							constraints automatically — no extra code on your end.
						</p>
						<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
							{AGENT_TYPES.map((t) => (
								<div
									key={t.label}
									className="lifted-card rounded-lg border border-fd-border bg-fd-card/40 p-4 transition-colors hover:bg-fd-card/70"
								>
									<span className="inline-block rounded-full border border-[var(--kavach-gold-mid)]/25 bg-[var(--kavach-gold-mid)]/8 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
										{t.label}
									</span>
									<h3 className="font-heading mt-2 text-base font-semibold text-fd-foreground">
										{t.title}
									</h3>
									<p className="mt-1 text-[12px] font-light text-fd-muted-foreground">
										{t.description}
									</p>
									<ul className="mt-3 space-y-1">
										{t.bullets.map((b) => (
											<li key={b} className="flex items-start gap-1.5">
												<Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--kavach-gold-mid)]" />
												<span className="text-[11px] text-fd-muted-foreground/70">{b}</span>
											</li>
										))}
									</ul>
									<code className="mt-3 block font-mono text-[10px] text-fd-muted-foreground/50">
										type: &quot;{t.example}&quot;
									</code>
								</div>
							))}
						</div>
					</div>

					{/* Section: Permission engine */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Permission engine
						</p>
						<h2 className="section-heading font-heading mt-2 text-base font-semibold text-fd-foreground">
							Six constraint types, evaluated inline
						</h2>
						<p className="mt-3 text-[13px] font-light text-fd-muted-foreground">
							Every constraint is checked inside{" "}
							<code className="font-mono text-[12px] text-fd-foreground/80">
								authorize()
							</code>{" "}
							before your handler runs. No middleware stacks, no separate policy service.
						</p>
						<div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
							{CONSTRAINT_TYPES.map(({ icon: Icon, label, detail, example, desc }) => (
								<div
									key={label}
									className="lifted-card rounded-lg border border-fd-border bg-fd-card/40 p-4 transition-colors hover:bg-fd-card/70"
								>
									<div className="flex items-center gap-2">
										<Icon className="h-3.5 w-3.5 shrink-0 text-[var(--kavach-gold-primary)]" />
										<span className="text-xs font-semibold text-fd-foreground">{label}</span>
									</div>
									<p className="mt-1.5 text-[11px] leading-snug text-fd-muted-foreground/60">
										{desc}
									</p>
									<div className="mt-2 space-y-0.5">
										<code className="block font-mono text-[10px] text-[var(--kavach-gold-primary)]/70">
											{detail}
										</code>
										<code className="block font-mono text-[10px] text-fd-muted-foreground/40">
											{example}
										</code>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Section: How it works */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							How it works
						</p>
						<h2 className="section-heading font-heading mt-2 text-base font-semibold text-fd-foreground">
							Three steps from install to audited
						</h2>
						<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
							{[
								{
									step: "01",
									title: "Install",
									code: "pnpm add kavachos",
									desc: "One package. Bring your own DB — SQLite, Postgres, or MySQL all work.",
								},
								{
									step: "02",
									title: "Create agent",
									code: "kavach.agents.create()",
									desc: "Set type, permissions, and constraints. Get a token back, once.",
								},
								{
									step: "03",
									title: "Authorize",
									code: "kavach.agents.authorize()",
									desc: "Call before every action. Inline evaluation, no extra network hop.",
								},
							].map((s) => (
								<div
									key={s.step}
									className="lifted-card rounded-lg border border-fd-border bg-fd-card/40 p-4"
								>
									<span className="font-mono text-[10px] text-[var(--kavach-gold-primary)]">
										{s.step}
									</span>
									<h3 className="mt-1 text-sm font-semibold text-fd-foreground">{s.title}</h3>
									<code className="mt-1 block font-mono text-[11px] text-fd-muted-foreground/60">
										{s.code}
									</code>
									<p className="mt-2 text-[11px] leading-snug text-fd-muted-foreground/60">
										{s.desc}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* Section: Code example */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Code example
						</p>
						<h2 className="section-heading font-heading mt-2 text-base font-semibold text-fd-foreground">
							Install, create, authorize
						</h2>
						<p className="mt-2 text-[13px] font-light text-fd-muted-foreground">
							Everything below runs in under 50 ms. No token storage, no polling, no
							external service.
						</p>
						<HighlightedCode code={CODE} filename="app.ts" highlight={[4, 5, 6, 7, 8, 9, 10, 11]} />
					</div>

					{/* Section: Token lifecycle */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Token lifecycle
						</p>
						<h2 className="section-heading font-heading mt-2 text-base font-semibold text-fd-foreground">
							Create, use, rotate, revoke
						</h2>
						<div className="mt-5 space-y-0">
							{LIFECYCLE_STEPS.map(({ icon: Icon, label, sub }, i) => (
								<div key={label} className="flex items-start gap-3">
									<div className="flex flex-col items-center">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--kavach-gold-mid)]/20 bg-[var(--kavach-gold-mid)]/5 text-[var(--kavach-gold-primary)]">
											<Icon className="h-4 w-4" />
										</div>
										{i < LIFECYCLE_STEPS.length - 1 && (
											<div
												className="w-px flex-1 bg-fd-border"
												style={{ minHeight: "1.5rem" }}
											/>
										)}
									</div>
									<div className="pb-5">
										<p className="text-[13px] font-medium text-fd-foreground">{label}</p>
										<p className="text-[11px] font-light text-fd-muted-foreground/60">{sub}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Section: Comparison */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Compared to API keys
						</p>
						<h2 className="section-heading font-heading mt-2 text-base font-semibold text-fd-foreground">
							Why agent tokens beat shared API keys
						</h2>
						<p className="mt-2 text-[13px] font-light text-fd-muted-foreground">
							Shared keys have no scope, no owner, and no audit trail. One key
							compromised means every agent using it is compromised.
						</p>
						<div className="mt-4 overflow-hidden rounded-lg border border-fd-border">
							<table className="w-full text-[12px]">
								<thead>
									<tr className="border-b border-fd-border bg-fd-secondary/30">
										<th className="px-3 py-2.5 text-left font-medium text-fd-muted-foreground/80" />
										<th className="px-3 py-2.5 text-center font-heading font-semibold text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
											Agent token
										</th>
										<th className="px-3 py-2.5 text-center font-medium text-fd-muted-foreground/70">
											API key
										</th>
									</tr>
								</thead>
								<tbody className="text-fd-muted-foreground">
									{COMP_ROWS.map((r) => (
										<tr key={r.feature} className="border-b border-fd-border last:border-b-0">
											<td className="px-3 py-2.5 font-medium text-fd-foreground/80">
												{r.feature}
											</td>
											<td className="px-3 py-2.5 text-center">{cell(r.key)}</td>
											<td className="px-3 py-2.5 text-center">{cell(r.api)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Section: What you get */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							What you get
						</p>
						<h2 className="section-heading font-heading mt-2 text-base font-semibold text-fd-foreground">
							Everything in one package
						</h2>
						<div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
							{[
								{ icon: Key, text: "SHA-256 token hashing, shown once only" },
								{ icon: Shield, text: "Per-agent permission scopes with wildcard support" },
								{ icon: RotateCcw, text: "Atomic rotation — no downtime, no coordination" },
								{ icon: XCircle, text: "Revoke cascades to all sub-agents instantly" },
								{ icon: Layers, text: "Budget caps enforced inline during authorize()" },
								{ icon: GitBranch, text: "Delegation chains with configurable depth" },
								{ icon: Fingerprint, text: "W3C DID portable identity support" },
								{ icon: Check, text: "Immutable audit log per agent, per call" },
							].map(({ icon: Icon, text }) => (
								<div
									key={text}
									className="flex items-center gap-2.5 rounded-lg border border-fd-border bg-fd-card/30 px-3 py-2.5"
								>
									<Icon className="h-3.5 w-3.5 shrink-0 text-[var(--kavach-gold-primary)]" />
									<span className="text-[12px] text-fd-muted-foreground/80">{text}</span>
								</div>
							))}
						</div>
					</div>

					{/* CTA */}
					<div className="px-6 py-12 text-center sm:px-10 lg:px-12">
						<h2 className="section-heading text-2xl font-bold tracking-tight text-lift sm:text-3xl">
							Give every agent its own identity
						</h2>
						<p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-fd-muted-foreground/80">
							TypeScript-first, MIT licensed. Works with SQLite, Postgres, or MySQL.
							No cloud dependency, no vendor lock-in.
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
				</div>
			</div>
		</div>
	);
}
