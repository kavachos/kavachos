import { FileText, GitBranch, Key, Server, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { CodePreview } from "@/components/code-preview";
import { ComparisonTable } from "@/components/comparison-table";
import { FeatureCard } from "@/components/feature-card";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";

export default function HomePage() {
	return (
		<div className="relative">
			{/* Nav */}
			<nav className="sticky top-0 z-50 border-b border-fd-border bg-fd-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
					<Link href="/" className="flex items-center gap-2.5">
						<Logo size={28} />
						<span className="font-mono font-bold tracking-tight text-sm">
							kavach<span className="font-light text-fd-muted-foreground">OS</span>
						</span>
					</Link>
					<div className="flex items-center gap-6">
						<Link
							href="/docs"
							className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
						>
							Docs
						</Link>
						<Link
							href="https://github.com/kavachos/kavachos"
							className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub
						</Link>
						<Link
							href="/docs/quickstart"
							className="gradient-gold inline-flex items-center rounded-md px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
						>
							Get started
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero */}
			<section className="relative overflow-hidden border-b border-fd-border">
				<div className="bg-grid pointer-events-none absolute inset-0" />
				<div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40">
					<div className="max-w-3xl">
						<div className="animate-fade-up">
							<span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--kavach-gold-mid)]/30 bg-[var(--kavach-gold-mid)]/10 px-3 py-1 text-xs font-medium text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-bright)]">
								<Shield className="h-3 w-3" />
								Open source auth for the agentic era
							</span>
						</div>

						<h1 className="animate-fade-up-delay-1 mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
							Auth for humans <span className="gradient-gold-text">and their agents</span>
						</h1>

						<p className="animate-fade-up-delay-2 mt-6 max-w-2xl text-lg text-fd-muted-foreground sm:text-xl">
							Every AI agent gets a cryptographic identity, least-privilege permissions, auditable
							delegation chains, and MCP OAuth 2.1. Ships as a TypeScript SDK with zero framework
							dependencies.
						</p>

						<div className="animate-fade-up-delay-3 mt-8 flex flex-wrap gap-3">
							<Link
								href="/docs/quickstart"
								className="gradient-gold inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
							>
								Get started
								<Zap className="h-4 w-4" />
							</Link>
							<Link
								href="https://github.com/kavachos/kavachos"
								className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-background px-6 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
								target="_blank"
								rel="noopener noreferrer"
							>
								View on GitHub
							</Link>
						</div>

						{/* Install command */}
						<div className="animate-fade-up-delay-3 mt-6">
							<code className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-4 py-2 font-mono text-sm text-fd-muted-foreground">
								<span className="select-none text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
									$
								</span>
								<span>pnpm add @kavachos/core</span>
							</code>
						</div>
					</div>
				</div>
			</section>

			{/* Code preview */}
			<section className="border-b border-fd-border">
				<div className="mx-auto max-w-6xl px-6 py-20">
					<div className="mb-12 max-w-lg">
						<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
							Five minutes to agent auth
						</h2>
						<p className="mt-3 text-fd-muted-foreground">
							Create an agent, scope its permissions, authorize actions. Every decision goes to an
							immutable audit log.
						</p>
					</div>
					<CodePreview />
				</div>
			</section>

			{/* Features */}
			<section className="border-b border-fd-border">
				<div className="mx-auto max-w-6xl px-6 py-20">
					<div className="mb-12 max-w-lg">
						<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
							Built for agent-first auth
						</h2>
						<p className="mt-3 text-fd-muted-foreground">
							Not a user-auth library with agent support bolted on. Agents are the primary entity,
							humans own them.
						</p>
					</div>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<FeatureCard
							icon={Key}
							title="Agent identity"
							description="Every agent gets a bearer token backed by SHA-256. Rotation is atomic and instant. Tokens are shown once, then hashed."
						/>
						<FeatureCard
							icon={Shield}
							title="Permission engine"
							description="Resource-based RBAC with wildcard matching, rate limits, time windows, IP allowlists, and human-in-the-loop gates."
						/>
						<FeatureCard
							icon={GitBranch}
							title="Delegation chains"
							description="Agents delegate strict subsets of permissions to sub-agents. Configurable depth limits and expiry. Fully audited."
						/>
						<FeatureCard
							icon={FileText}
							title="Audit trail"
							description="Every authorization decision is written to an immutable log. Export as JSON or CSV for compliance tooling."
						/>
						<FeatureCard
							icon={Server}
							title="MCP OAuth 2.1"
							description="Spec-compliant auth server for Model Context Protocol. PKCE, RFC 9728, 8707, 8414, and 7591."
						/>
						<FeatureCard
							icon={Zap}
							title="Framework adapters"
							description="Drop-in middleware for Hono, Express, Next.js, Fastify, Nuxt, SvelteKit, and Astro. Core has zero framework deps."
						/>
					</div>
				</div>
			</section>

			{/* Comparison */}
			<section className="border-b border-fd-border">
				<div className="mx-auto max-w-6xl px-6 py-20">
					<div className="mb-12 max-w-lg">
						<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How it compares</h2>
						<p className="mt-3 text-fd-muted-foreground">
							KavachOS runs alongside your existing auth provider. It handles everything after the
							human logs in.
						</p>
					</div>
					<ComparisonTable />
				</div>
			</section>

			{/* CTA */}
			<section className="border-b border-fd-border">
				<div className="mx-auto max-w-6xl px-6 py-20 text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
						Armor for every identity
					</h2>
					<p className="mx-auto mt-3 max-w-lg text-fd-muted-foreground">
						Human and agent. Open source, TypeScript, zero framework lock-in.
					</p>
					<div className="mt-8 flex justify-center gap-3">
						<Link
							href="/docs/quickstart"
							className="gradient-gold inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
						>
							Read the docs
						</Link>
						<Link
							href="https://github.com/kavachos/kavachos"
							className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-background px-6 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
							target="_blank"
							rel="noopener noreferrer"
						>
							Star on GitHub
						</Link>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
