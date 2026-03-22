import type { Metadata } from "next";
import Link from "next/link";
import {
	Key,
	Shield,
	GitBranch,
	FileText,
	ArrowRight,
	Check,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/components/button";

export const metadata: Metadata = {
	title: "Agent identity",
	description:
		"Every AI agent gets a cryptographic identity, scoped permissions, and an immutable audit trail.",
};

interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	items: string[];
}

function FeatureCard({ icon, title, items }: FeatureCardProps) {
	return (
		<div className="group rounded-xl border border-fd-border bg-fd-card/40 p-6 transition-colors hover:bg-fd-card/70">
			<div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-fd-border bg-fd-secondary/50 text-[var(--kavach-gold-primary)]">
				{icon}
			</div>
			<h3 className="font-heading text-base font-semibold tracking-tight text-fd-foreground">
				{title}
			</h3>
			<ul className="mt-3 space-y-2">
				{items.map((item) => (
					<li key={item} className="flex items-start gap-2 text-sm text-fd-muted-foreground/70">
						<Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--kavach-gold-mid)]" />
						<span>{item}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

interface StepProps {
	number: string;
	title: string;
	description: string;
	code: string;
}

function Step({ number, title, description, code }: StepProps) {
	return (
		<div className="flex gap-6">
			<div className="flex flex-col items-center">
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--kavach-gold-mid)]/30 bg-[var(--kavach-gold-mid)]/10 font-mono text-xs font-semibold text-[var(--kavach-gold-primary)]">
					{number}
				</div>
				<div className="mt-2 w-px flex-1 bg-fd-border/50" />
			</div>
			<div className="pb-10">
				<h3 className="font-heading text-base font-semibold text-fd-foreground">{title}</h3>
				<p className="mt-1 text-sm text-fd-muted-foreground/70">{description}</p>
				<pre className="mt-4 overflow-x-auto rounded-lg border border-fd-border bg-fd-muted/50 p-4 font-mono text-xs leading-relaxed text-fd-foreground/80">
					<code>{code}</code>
				</pre>
			</div>
		</div>
	);
}

interface StatProps {
	value: string;
	label: string;
}

function Stat({ value, label }: StatProps) {
	return (
		<div className="flex flex-col items-center gap-1 px-6 py-4">
			<span className="font-heading text-3xl font-bold gradient-gold-text">{value}</span>
			<span className="text-xs text-fd-muted-foreground/60">{label}</span>
		</div>
	);
}

export default function AgentIdentityPage() {
	return (
		<div className="bg-fd-background text-fd-foreground">
			{/* Hero */}
			<section className="relative overflow-hidden border-b border-fd-border bg-grid pb-20 pt-20 lg:pt-28">
				{/* Subtle glow */}
				<div
					className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-64 w-[600px] opacity-20 blur-3xl"
					style={{
						background:
							"radial-gradient(ellipse, var(--kavach-gold-mid) 0%, transparent 70%)",
					}}
					aria-hidden="true"
				/>
				<div className="relative mx-auto max-w-5xl px-6 lg:px-8">
					<div className="max-w-3xl">
						<p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--kavach-gold-primary)]">
							KavachOS Products
						</p>
						<h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-fd-foreground lg:text-5xl animate-fade-up">
							Agent identity
						</h1>
						<p className="mt-4 text-lg text-fd-muted-foreground/70 leading-relaxed animate-fade-up-delay-1">
							Every AI agent gets a cryptographic identity, scoped permissions,
							and an immutable audit trail.
						</p>
						<div className="mt-8 flex flex-wrap gap-3 animate-fade-up-delay-2">
							<Button href="/docs" variant="gold" size="lg">
								Read docs
								<ArrowRight className="h-4 w-4" />
							</Button>
							<Button href="/docs/quickstart" variant="outline" size="lg">
								Get started
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Feature categories */}
			<section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
				<h2 className="font-heading text-2xl font-semibold tracking-tight text-fd-foreground">
					What&apos;s included
				</h2>
				<p className="mt-2 text-sm text-fd-muted-foreground/60">
					Four interconnected systems that handle the full lifecycle of agent auth.
				</p>
				<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<FeatureCard
						icon={<Key className="h-4 w-4" />}
						title="Identity"
						items={[
							"Bearer tokens with kv_ prefix, SHA-256 hashed",
							"Atomic token rotation — old token revoked instantly",
							"Three agent types: autonomous, delegated, service",
							"Expiry timestamps and arbitrary metadata fields",
							"Configurable max agents per user via env var",
						]}
					/>
					<FeatureCard
						icon={<Shield className="h-4 w-4" />}
						title="Permissions"
						items={[
							"Resource pattern matching with colon-separated paths and wildcards",
							"5 constraint types: rate limit, time window, IP, approval, arg patterns",
							"8 built-in permission templates out of the box",
							"Templates for readonly, admin, mcpBasic, and more",
							"Per-action grants with fine-grained overrides",
						]}
					/>
					<FeatureCard
						icon={<GitBranch className="h-4 w-4" />}
						title="Delegation"
						items={[
							"Agent-to-agent delegation chains with parent tracking",
							"Configurable depth limits to prevent runaway nesting",
							"Cascading revocation — revoke parent, all children revoked",
							"Effective permissions computed across the full chain",
							"Sub-agents can only receive strict subsets of parent permissions",
						]}
					/>
					<FeatureCard
						icon={<FileText className="h-4 w-4" />}
						title="Audit"
						items={[
							"Every authorization decision logged: allowed, denied, rate_limited",
							"Export audit data as JSON or CSV for compliance",
							"Configurable retention policies per environment",
							"Token cost tracking attached to each audit entry",
							"Cost aggregation queries by agent, user, or day",
						]}
					/>
				</div>
			</section>

			{/* How it works */}
			<section className="border-t border-fd-border bg-fd-muted/20">
				<div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
					<h2 className="font-heading text-2xl font-semibold tracking-tight text-fd-foreground">
						How it works
					</h2>
					<p className="mt-2 text-sm text-fd-muted-foreground/60">
						Three API calls to go from zero to a fully audited agent.
					</p>
					<div className="mt-10">
						<Step
							number="1"
							title="Create an agent with permissions"
							description="Agents are created with an identity, a type, and a set of resource permissions. The token is returned once and stored hashed."
							code={`import { createKavach } from "kavachos";

const kavach = createKavach({ db, secret: process.env.KAVACH_SECRET });

const { agent, token } = await kavach.agents.create({
  userId: "user_123",
  name: "github-assistant",
  type: "autonomous",
  permissions: [
    { resource: "mcp:github:*", actions: ["read"] },
    { resource: "mcp:github:issues", actions: ["read", "write"] },
  ],
});

// token is shown once — store it or pass it to the agent
console.log(token); // kv_a3f8c2...`}
						/>
						<Step
							number="2"
							title="Authorize actions at runtime"
							description="Call authorize() before any sensitive operation. Pass the token, resource, and action. Constraints like rate limits are evaluated automatically."
							code={`const result = await kavach.agents.authorize({
  token: agentToken,
  resource: "mcp:github:issues",
  action: "write",
  context: { ip: request.ip },
});

if (!result.allowed) {
  // result.reason tells you why: "permission_denied", "rate_limited", etc.
  return { error: result.reason };
}

// proceed with the action`}
						/>
						<Step
							number="3"
							title="Query the audit trail"
							description="Every authorize() call is logged. Query by agent, time range, or outcome. Export for compliance or feed into your anomaly detection."
							code={`const logs = await kavach.audit.query({
  agentId: agent.id,
  outcome: "denied",
  from: new Date(Date.now() - 86_400_000), // last 24h
});

// Export to CSV
const csv = await kavach.audit.export({ format: "csv", agentId: agent.id });`}
						/>
					</div>
				</div>
			</section>

			{/* Stats row */}
			<section className="border-t border-fd-border">
				<div className="mx-auto max-w-5xl px-6 lg:px-8">
					<div className="flex flex-wrap items-center justify-center divide-x divide-fd-border">
						<Stat value="240+" label="tests" />
						<Stat value="7" label="framework adapters" />
						<Stat value="3" label="supported databases" />
						<Stat value="4" label="compliance frameworks" />
					</div>
				</div>
			</section>

			{/* Bottom CTA */}
			<section className="border-t border-fd-border bg-fd-muted/20">
				<div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
					<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="font-heading text-xl font-semibold text-fd-foreground">
								Start building in minutes
							</h2>
							<p className="mt-1 text-sm text-fd-muted-foreground/60">
								One package, TypeScript-first, works with SQLite, Postgres, or MySQL.
							</p>
						</div>
						<div className="flex gap-3 shrink-0">
							<Button href="/docs/quickstart" variant="gold">
								Get started
								<ArrowRight className="h-4 w-4" />
							</Button>
							<Button href="/products/security" variant="outline">
								Security features
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
