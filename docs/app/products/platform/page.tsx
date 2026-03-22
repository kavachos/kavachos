import type { Metadata } from "next";
import { ArrowRight, Check, Terminal, ChevronRight, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/button";
import { InteractiveGrid } from "@/components/interactive-grid";
import { NavSpacer } from "@/components/nav";
import { Footer } from "@/components/footer";
import {
	HonoIcon,
	ExpressIcon,
	NextjsIcon,
	FastifyIcon,
	NuxtIcon,
	SvelteIcon,
	AstroIcon,
} from "@/components/icons";

export const metadata: Metadata = {
	title: "Platform",
	description:
		"MCP OAuth 2.1, 7 framework adapters, admin dashboard, client SDK, and multi-tenant isolation.",
};

const FRAMEWORKS = [
	{ icon: HonoIcon, name: "Hono", fn: "kavachHono()", ready: true },
	{ icon: ExpressIcon, name: "Express", fn: "kavachExpress()", ready: true },
	{ icon: NextjsIcon, name: "Next.js", fn: "kavachNext()", ready: true },
	{ icon: FastifyIcon, name: "Fastify", fn: "kavachFastify()", ready: false },
	{ icon: NuxtIcon, name: "Nuxt", fn: "kavachNuxt()", ready: false },
	{ icon: SvelteIcon, name: "SvelteKit", fn: "kavachSvelteKit()", ready: false },
	{ icon: AstroIcon, name: "Astro", fn: "kavachAstro()", ready: false },
] as const;

const RFCS = [
	{ id: "RFC 9728", title: "Authorization server discovery" },
	{ id: "RFC 8707", title: "Resource indicators for audience binding" },
	{ id: "RFC 8414", title: "OAuth 2.0 server metadata" },
	{ id: "RFC 7591", title: "Dynamic client registration" },
	{ id: "PKCE S256", title: "Code challenge method" },
	{ id: "OAuth 2.1", title: "Base authorization framework" },
] satisfies { id: string; title: string }[];

const DASHBOARD_PAGES = [
	"Overview — active agents, recent denials, trust scores",
	"Agents — list, create, rotate tokens, revoke",
	"Users — attached agents, delegation trees",
	"Permissions — visual editor with conflict detection",
	"Audit — filterable log with export",
	"Security — anomaly scan results and alerts",
	"Compliance — report generation by framework",
	"Budget — per-agent cost usage and limits",
	"Settings — tenant config, retention, MCP settings",
] as const;

export default function PlatformPage() {
	return (
		<div className="relative text-fd-foreground">
			<NavSpacer />
			<div className="flex flex-col lg:flex-row">
				{/* Left pane: sticky hero */}
				<div className="relative w-full border-b border-fd-border lg:sticky lg:top-[var(--nav-height)] lg:h-[calc(100vh-var(--nav-height))] lg:w-[40%] lg:border-b-0 lg:border-r lg:overflow-hidden">
					<div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--kavach-gold-mid)]/[0.06] blur-3xl" />
					<div className="relative flex h-full flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
						<div className="relative z-10">
							<Link
								href="/products"
								className="group mb-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--kavach-gold-mid)]/25 bg-[var(--kavach-gold-mid)]/8 px-3.5 py-1 text-[11px] font-medium text-[var(--kavach-gold-deep)] transition-colors hover:bg-[var(--kavach-gold-mid)]/15 dark:text-[var(--kavach-gold-bright)]"
							>
								<Shield className="h-3 w-3" />
								Platform
								<ChevronRight className="h-3 w-3 opacity-40 transition-transform group-hover:translate-x-0.5" />
							</Link>

							<h1 className="text-3xl font-extrabold tracking-tight text-lift sm:text-4xl xl:text-[2.75rem] xl:leading-[1.15]">
								Everything you need to{" "}
								<span className="gradient-gold-text text-lift-gold">ship agent auth</span>
							</h1>

							<p className="mt-5 max-w-sm text-[15px] font-light text-fd-muted-foreground leading-relaxed">
								MCP OAuth 2.1 server, 7 framework adapters, admin dashboard, and a
								zero-dependency client SDK. One package.
							</p>

							<div className="mt-8 flex flex-wrap items-center gap-3">
								<Button href="/docs/quickstart" variant="gold">
									Get started
									<ArrowRight className="h-3.5 w-3.5" />
								</Button>
								<Button href="/docs" variant="outline">
									Read docs
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
					{/* Section 1: MCP OAuth 2.1 */}
					<div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
						<p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Section 1
						</p>
						<h2 className="font-heading text-xl font-bold tracking-tight text-fd-foreground">
							MCP OAuth 2.1
						</h2>
						<p className="mt-2 text-sm text-fd-muted-foreground/70 leading-relaxed">
							Full spec coverage. No custom extensions, no shortcuts. Every RFC the MCP
							authorization specification references is implemented and tested.
						</p>
						<div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
							{RFCS.map((rfc) => (
								<div
									key={rfc.id}
									className="rounded-lg border border-fd-border bg-fd-card/40 p-3 transition-colors hover:bg-fd-card/70"
								>
									<p className="font-mono text-xs font-semibold text-[var(--kavach-gold-primary)]">
										{rfc.id}
									</p>
									<p className="mt-0.5 text-[11px] text-fd-muted-foreground/60">{rfc.title}</p>
								</div>
							))}
						</div>
						{/* Auth flow visual */}
						<div className="mt-6 flex items-center gap-2 overflow-x-auto rounded-xl border border-fd-border bg-fd-muted/30 px-4 py-3">
							{["Client", "PKCE", "Auth server", "Token", "MCP resource"].flatMap((step, i, arr) =>
								i < arr.length - 1
									? [
											<span key={step} className="shrink-0 rounded-md border border-fd-border bg-fd-card px-2.5 py-1.5 font-mono text-[10px] text-fd-foreground/80">{step}</span>,
											<ArrowRight key={`a${i}`} className="h-3 w-3 shrink-0 text-[var(--kavach-gold-mid)]/60" />,
										]
									: [<span key={step} className="shrink-0 rounded-md border border-fd-border bg-fd-card px-2.5 py-1.5 font-mono text-[10px] text-fd-foreground/80">{step}</span>],
							)}
						</div>
					</div>

					{/* Section 2: Framework adapters */}
					<div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
						<p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Section 2
						</p>
						<h2 className="font-heading text-xl font-bold tracking-tight text-fd-foreground">
							Framework adapters
						</h2>
						<p className="mt-2 text-sm text-fd-muted-foreground/70 leading-relaxed">
							Every adapter mounts the same API surface. Switch frameworks without touching your
							kavach config.
						</p>
						<div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
							{FRAMEWORKS.map(({ icon: Icon, name, fn, ready }) => (
								<div
									key={name}
									className="flex flex-col gap-2 rounded-xl border border-fd-border bg-fd-card/40 px-4 py-3 transition-colors hover:bg-fd-card/70"
								>
									<div className="flex items-center justify-between">
										<Icon className="h-4 w-4 text-fd-foreground/80" />
										<span
											className={`font-mono text-[9px] font-semibold uppercase tracking-wider ${ready ? "text-emerald-500 dark:text-emerald-400" : "text-fd-muted-foreground/40"}`}
										>
											{ready ? "ready" : "coming"}
										</span>
									</div>
									<div>
										<p className="font-heading text-sm font-semibold text-fd-foreground">
											{name}
										</p>
										<p className="font-mono text-[10px] text-fd-muted-foreground/50">{fn}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Section 3: Admin dashboard */}
					<div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
						<p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Section 3
						</p>
						<h2 className="font-heading text-xl font-bold tracking-tight text-fd-foreground">
							Admin dashboard
						</h2>
						<p className="mt-2 text-sm text-fd-muted-foreground/70 leading-relaxed">
							Embed as a React component or run standalone via CLI. Nine pages covering
							everything from permissions to budget.
						</p>
						<div className="mt-6 space-y-1.5">
							{DASHBOARD_PAGES.map((page) => (
								<div
									key={page}
									className="flex items-start gap-2.5 rounded-lg border border-fd-border bg-fd-card/40 px-3 py-2 transition-colors hover:bg-fd-card/70"
								>
									<Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--kavach-gold-mid)]" />
									<span className="text-xs text-fd-muted-foreground/70">{page}</span>
								</div>
							))}
						</div>
					</div>

					{/* Section 4: TypeScript client */}
					<div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
						<p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Section 4
						</p>
						<h2 className="font-heading text-xl font-bold tracking-tight text-fd-foreground">
							TypeScript client
						</h2>
						<p className="mt-2 text-sm text-fd-muted-foreground/70 leading-relaxed">
							Zero runtime dependencies. Works in browsers, Node.js, Deno, and Bun without
							polyfills. Fully typed from your server schema.
						</p>
						<pre className="mt-6 overflow-x-auto rounded-xl border border-fd-border bg-fd-muted/50 p-5 font-mono text-xs leading-relaxed text-fd-foreground/80">
							<code>{`import { createKavachClient } from "kavachos/client";

const kavach = createKavachClient({
  baseUrl: "https://api.yourapp.com/kavach",
});

// Fully typed — no codegen step required
const agent = await kavach.agents.create({
  name: "billing-agent",
  permissions: ["invoices:read", "payments:write"],
});

// Token rotation built in
const token = await kavach.agents.rotateToken(agent.id);`}</code>
						</pre>
					</div>

					{/* Section 5: Multi-tenant */}
					<div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
						<p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							Section 5
						</p>
						<h2 className="font-heading text-xl font-bold tracking-tight text-fd-foreground">
							Multi-tenant
						</h2>
						<p className="mt-2 text-sm text-fd-muted-foreground/70 leading-relaxed">
							Every agent is scoped to a tenant at creation time. Suspend or activate an entire
							tenant without touching individual agents.
						</p>
						<div className="mt-6 grid grid-cols-3 gap-3">
							{(["acme-corp", "buildco", "startupxyz"] as const).map((tenant, i) => (
								<div key={tenant} className="rounded-xl border border-fd-border bg-fd-card/40 p-4">
									<p className="font-mono text-[10px] text-[var(--kavach-gold-primary)]">tenant/{tenant}</p>
									<div className="mt-3 space-y-1.5">
										{Array.from({ length: 2 + i }, (_, j) => (
											<div key={j} className="h-1.5 rounded-full bg-fd-border" style={{ width: `${55 + j * 15}%` }} />
										))}
									</div>
									<p className="mt-3 text-[10px] text-fd-muted-foreground/50">{2 + i * 3} agents · isolated</p>
								</div>
							))}
						</div>
						<div className="mt-4 flex flex-wrap gap-3">
							{["Per-tenant rate limits", "Permission templates", "Suspend without agent changes"].map((item) => (
								<div key={item} className="flex items-center gap-2 text-xs text-fd-muted-foreground/70">
									<Check className="h-3 w-3 shrink-0 text-[var(--kavach-gold-mid)]" />
									{item}
								</div>
							))}
						</div>
					</div>

					{/* CTA */}
					<div className="px-6 py-10 text-center sm:px-10 lg:px-12">
						<h2 className="text-2xl font-bold tracking-tight text-lift sm:text-3xl">
							One package, full stack
						</h2>
						<p className="mx-auto mt-3 max-w-md text-sm font-light text-fd-muted-foreground/80 leading-relaxed">
							Core, adapters, dashboard, and client SDK ship together. TypeScript, MIT licensed.
						</p>
						<div className="mt-8 flex flex-wrap justify-center gap-3">
							<Button href="/docs/quickstart" variant="gold" size="lg">
								Get started
								<ArrowRight className="h-4 w-4" />
							</Button>
							<Button href="/products/agent-identity" variant="outline" size="lg">
								Agent identity
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					<Footer />
				</div>
			</div>
		</div>
	);
}
