import type { Metadata } from "next";
import {
	Lock,
	Puzzle,
	LayoutDashboard,
	Package,
	Building2,
	Search,
	ArrowRight,
	Check,
} from "lucide-react";
import { Button } from "@/components/button";

export const metadata: Metadata = {
	title: "Platform",
	description:
		"MCP OAuth 2.1, 7 framework adapters, admin dashboard, client SDK, and multi-tenant isolation.",
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

interface FrameworkBadgeProps {
	name: string;
	note?: string;
}

function FrameworkBadge({ name, note }: FrameworkBadgeProps) {
	return (
		<div className="flex flex-col items-center gap-1 rounded-xl border border-fd-border bg-fd-card/40 px-5 py-4 transition-colors hover:bg-fd-card/70">
			<span className="font-heading text-sm font-semibold text-fd-foreground">{name}</span>
			{note && (
				<span className="font-mono text-[10px] text-fd-muted-foreground/50">{note}</span>
			)}
		</div>
	);
}

interface RfcBadgeProps {
	rfc: string;
	title: string;
}

function RfcBadge({ rfc, title }: RfcBadgeProps) {
	return (
		<div className="rounded-lg border border-fd-border bg-fd-secondary/30 p-3">
			<p className="font-mono text-xs font-semibold text-[var(--kavach-gold-primary)]">{rfc}</p>
			<p className="mt-0.5 text-[11px] text-fd-muted-foreground/60">{title}</p>
		</div>
	);
}

export default function PlatformPage() {
	return (
		<div className="bg-fd-background text-fd-foreground">
			{/* Hero */}
			<section className="relative overflow-hidden border-b border-fd-border bg-grid pb-20 pt-20 lg:pt-28">
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
							Platform
						</h1>
						<p className="mt-4 text-lg text-fd-muted-foreground/70 leading-relaxed animate-fade-up-delay-1">
							MCP OAuth 2.1, 7 framework adapters, admin dashboard, client SDK,
							and multi-tenant isolation.
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
					Infrastructure
				</h2>
				<p className="mt-2 text-sm text-fd-muted-foreground/60">
					Everything from the OAuth server to the admin UI, packaged and ready to mount.
				</p>
				<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<FeatureCard
						icon={<Lock className="h-4 w-4" />}
						title="MCP OAuth 2.1"
						items={[
							"PKCE S256 — no implicit flow, no secrets in URLs",
							"RFC 9728: authorization server metadata discovery",
							"RFC 8414: OAuth 2.0 authorization server metadata",
							"RFC 7591: dynamic client registration",
							"RFC 8707: resource indicators for audience binding",
							"Consent screen flow and step-up authorization",
						]}
					/>
					<FeatureCard
						icon={<Puzzle className="h-4 w-4" />}
						title="Framework adapters"
						items={[
							"Hono, Express, Next.js, Fastify, Nuxt, SvelteKit, Astro",
							"Single function: kavachHono(kavach) or kavachExpress(kavach)",
							"Full REST API mounted at a configurable base path",
							"MCP OAuth endpoints included in every adapter",
							"TypeScript types generated from your kavach instance",
						]}
					/>
					<FeatureCard
						icon={<LayoutDashboard className="h-4 w-4" />}
						title="Dashboard"
						items={[
							"9 admin pages covering agents, users, audit, security, and settings",
							"Embeddable as a React component or run standalone via CLI",
							"Visual permission editor with drag-and-drop resource assignment",
							"Conflict detection flags overlapping or redundant rules",
						]}
					/>
					<FeatureCard
						icon={<Package className="h-4 w-4" />}
						title="Client SDK"
						items={[
							"Zero runtime dependencies — no bundler surprises",
							"Works in browser, Node.js, Deno, and Bun without polyfills",
							"Fully typed API generated from the server schema",
							"KavachApiError class with code, message, and status fields",
						]}
					/>
					<FeatureCard
						icon={<Building2 className="h-4 w-4" />}
						title="Multi-tenant"
						items={[
							"Tenant CRUD with name, slug, and settings",
							"All agents scoped to a tenant at creation time",
							"Per-tenant rate limits, permission templates, and budget policies",
							"Suspend or activate a tenant without touching individual agents",
						]}
					/>
					<FeatureCard
						icon={<Search className="h-4 w-4" />}
						title="Discovery"
						items={[
							"Agent capability cards published to a registry endpoint",
							"A2A-compatible format for inter-agent capability negotiation",
							"Search by protocol, capability name, or resource pattern",
							"Endpoint advertising via well-known URLs",
						]}
					/>
				</div>
			</section>

			{/* Framework row */}
			<section className="border-t border-fd-border bg-fd-muted/20">
				<div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
					<h2 className="font-heading text-2xl font-semibold tracking-tight text-fd-foreground">
						Framework support
					</h2>
					<p className="mt-2 text-sm text-fd-muted-foreground/60">
						Every adapter mounts the same API surface. Switch frameworks without changing your kavach config.
					</p>
					<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
						<FrameworkBadge name="Hono" note="kavachHono()" />
						<FrameworkBadge name="Express" note="kavachExpress()" />
						<FrameworkBadge name="Next.js" note="kavachNext()" />
						<FrameworkBadge name="Fastify" note="kavachFastify()" />
						<FrameworkBadge name="Nuxt" note="kavachNuxt()" />
						<FrameworkBadge name="SvelteKit" note="kavachSvelteKit()" />
						<FrameworkBadge name="Astro" note="kavachAstro()" />
					</div>

					<div className="mt-10">
						<h3 className="font-heading text-base font-semibold text-fd-foreground">
							Example: Hono adapter
						</h3>
						<p className="mt-1 text-sm text-fd-muted-foreground/60">
							One function call mounts the full REST API, including MCP OAuth endpoints.
						</p>
						<pre className="mt-4 overflow-x-auto rounded-xl border border-fd-border bg-fd-muted/50 p-6 font-mono text-xs leading-relaxed text-fd-foreground/80">
							<code>{`import { Hono } from "hono";
import { createKavach } from "kavachos";
import { kavachHono } from "kavachos/hono";

const kavach = createKavach({ db, secret: process.env.KAVACH_SECRET });

const app = new Hono();

// Mounts /auth/*, /agents/*, /audit/*, and MCP OAuth endpoints
app.route("/kavach", kavachHono(kavach));

export default app;`}</code>
						</pre>
					</div>
				</div>
			</section>

			{/* MCP OAuth RFC coverage */}
			<section className="border-t border-fd-border">
				<div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
					<div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
						<div>
							<h2 className="font-heading text-2xl font-semibold tracking-tight text-fd-foreground">
								MCP OAuth 2.1 spec coverage
							</h2>
							<p className="mt-2 text-sm text-fd-muted-foreground/60">
								KavachOS implements the full set of RFCs referenced by the MCP
								authorization specification. No custom extensions, no shortcuts.
							</p>
							<div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
								<RfcBadge rfc="PKCE S256" title="Code challenge method" />
								<RfcBadge rfc="RFC 9728" title="Authorization server metadata" />
								<RfcBadge rfc="RFC 8414" title="OAuth 2.0 server metadata" />
								<RfcBadge rfc="RFC 7591" title="Dynamic client registration" />
								<RfcBadge rfc="RFC 8707" title="Resource indicators" />
								<RfcBadge rfc="OAuth 2.1" title="Base authorization framework" />
							</div>
						</div>

						<div>
							<h2 className="font-heading text-2xl font-semibold tracking-tight text-fd-foreground">
								Dashboard pages
							</h2>
							<p className="mt-2 text-sm text-fd-muted-foreground/60">
								Embed the dashboard component in your existing app or deploy it standalone.
							</p>
							<div className="mt-6 space-y-2">
								{[
									"Overview — active agents, recent denials, trust distribution",
									"Agents — list, create, rotate tokens, revoke",
									"Users — attached agents, delegation trees",
									"Permissions — visual editor, conflict detection",
									"Audit — filterable log with export",
									"Security — anomaly scan results, trust scores",
									"Compliance — report generation by framework",
									"Budget — per-agent cost usage and limits",
									"Settings — tenant config, retention, MCP settings",
								].map((page) => (
									<div
										key={page}
										className="flex items-start gap-2 rounded-lg border border-fd-border bg-fd-card/40 px-3 py-2"
									>
										<Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--kavach-gold-mid)]" />
										<span className="text-xs text-fd-muted-foreground/70">{page}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Bottom CTA */}
			<section className="border-t border-fd-border bg-fd-muted/20">
				<div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
					<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="font-heading text-xl font-semibold text-fd-foreground">
								One package, full stack
							</h2>
							<p className="mt-1 text-sm text-fd-muted-foreground/60">
								Core, adapters, dashboard, and client SDK are all in the kavachos package.
							</p>
						</div>
						<div className="flex gap-3 shrink-0">
							<Button href="/docs/quickstart" variant="gold">
								Get started
								<ArrowRight className="h-4 w-4" />
							</Button>
							<Button href="/products/agent-identity" variant="outline">
								Agent identity
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
