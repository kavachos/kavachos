import { FileText, GitBranch, Key, Server, Shield, Zap, ArrowRight, Terminal } from "lucide-react";
import Link from "next/link";
import { ComparisonTable } from "@/components/comparison-table";
import { FeatureCard } from "@/components/feature-card";
import { Footer } from "@/components/footer";
import { HeroPanel } from "@/components/hero-panel";

export default function HomePage() {
	return (
		<>
			{/* Hero — two column like better-auth */}
			<section className="relative overflow-hidden">
				<div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-30" />
				<div className="relative flex min-h-[calc(100vh-var(--nav-height))] flex-col lg:flex-row">
					{/* Left — headline + CTA */}
					<div className="flex w-full flex-col justify-center border-b border-fd-border px-6 py-16 lg:w-[45%] lg:border-b-0 lg:border-r lg:px-12 lg:py-0">
						<div className="mx-auto max-w-lg">
							<div className="animate-fade-up">
								<span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--kavach-gold-mid)]/30 bg-[var(--kavach-gold-mid)]/10 px-3 py-1 text-xs font-medium text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-bright)]">
									<Shield className="h-3 w-3" />
									Open source auth for the agentic era
								</span>
							</div>

							<h1 className="animate-fade-up-delay-1 mt-6 text-3xl font-bold tracking-tight md:text-4xl xl:text-5xl">
								Auth for humans{" "}
								<span className="gradient-gold-text">and their agents</span>
							</h1>

							<p className="animate-fade-up-delay-2 mt-5 text-base text-fd-muted-foreground leading-relaxed">
								Every AI agent gets a cryptographic identity, least-privilege
								permissions, auditable delegation chains, and MCP OAuth 2.1.
								TypeScript SDK, zero framework dependencies.
							</p>

							<div className="animate-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-3">
								<Link
									href="/docs/quickstart"
									className="gradient-gold inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
								>
									Get started
									<ArrowRight className="h-3.5 w-3.5" />
								</Link>
								<Link
									href="https://github.com/kavachos/kavachos"
									className="inline-flex items-center gap-2 rounded-md border border-fd-border px-5 py-2 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
									target="_blank"
									rel="noopener noreferrer"
								>
									View source
								</Link>
							</div>

							{/* Install command */}
							<div className="animate-fade-up-delay-3 mt-5">
								<code className="inline-flex items-center gap-2 rounded-md border border-fd-border bg-fd-card px-3 py-1.5 font-mono text-xs text-fd-muted-foreground">
									<Terminal className="h-3 w-3 text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]" />
									pnpm add kavachos
								</code>
							</div>
						</div>
					</div>

					{/* Right — tabbed panel */}
					<div className="flex w-full items-center justify-center px-6 py-8 lg:w-[55%] lg:px-8">
						<div className="w-full max-w-2xl rounded-lg border border-fd-border bg-fd-card/50 backdrop-blur-sm">
							<HeroPanel />
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="border-t border-fd-border">
				<div className="mx-auto max-w-6xl px-6 py-20 lg:px-12">
					<div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-xs font-medium uppercase tracking-widest text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
								Core capabilities
							</p>
							<h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
								Built for agent-first auth
							</h2>
						</div>
						<p className="max-w-sm text-sm text-fd-muted-foreground">
							Not a user-auth library with agent support bolted on. Agents are
							the primary entity.
						</p>
					</div>
					<div className="grid gap-px overflow-hidden rounded-lg border border-fd-border bg-fd-border sm:grid-cols-2 lg:grid-cols-3">
						<FeatureCard
							icon={Key}
							title="Agent identity"
							description="Every agent gets a bearer token backed by SHA-256. Rotation is atomic. Tokens shown once, then hashed."
						/>
						<FeatureCard
							icon={Shield}
							title="Permission engine"
							description="Resource-based RBAC with wildcard matching, rate limits, time windows, and human-in-the-loop gates."
						/>
						<FeatureCard
							icon={GitBranch}
							title="Delegation chains"
							description="Agents delegate strict subsets of permissions to sub-agents. Configurable depth limits and expiry."
						/>
						<FeatureCard
							icon={FileText}
							title="Audit trail"
							description="Every authorization decision written to an immutable log. Export as JSON or CSV for compliance."
						/>
						<FeatureCard
							icon={Server}
							title="MCP OAuth 2.1"
							description="Spec-compliant auth server for Model Context Protocol. PKCE, RFC 9728, 8707, 8414, 7591."
						/>
						<FeatureCard
							icon={Zap}
							title="Framework adapters"
							description="Drop-in middleware for Hono, Express, Next.js, Fastify, Nuxt, SvelteKit, and Astro."
						/>
					</div>
				</div>
			</section>

			{/* Comparison */}
			<section className="border-t border-fd-border">
				<div className="mx-auto max-w-6xl px-6 py-20 lg:px-12">
					<div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-xs font-medium uppercase tracking-widest text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
								Comparison
							</p>
							<h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
								How it stacks up
							</h2>
						</div>
						<p className="max-w-sm text-sm text-fd-muted-foreground">
							KavachOS runs alongside your existing auth provider. It handles
							everything after the human logs in.
						</p>
					</div>
					<ComparisonTable />
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-fd-border">
				<div className="mx-auto max-w-6xl px-6 py-20 lg:px-12">
					<div className="relative overflow-hidden rounded-xl border border-[var(--kavach-gold-mid)]/20 bg-fd-card p-12 text-center">
						<div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-20" />
						<div className="relative">
							<p className="text-xs font-medium uppercase tracking-widest text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
								Open source
							</p>
							<h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
								Armor for every identity
							</h2>
							<p className="mx-auto mt-3 max-w-md text-sm text-fd-muted-foreground">
								Human and agent. TypeScript SDK, zero framework lock-in, MIT
								licensed.
							</p>
							<div className="mt-8 flex justify-center gap-3">
								<Link
									href="/docs/quickstart"
									className="gradient-gold inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
								>
									Read the docs
									<ArrowRight className="h-3.5 w-3.5" />
								</Link>
								<Link
									href="https://github.com/kavachos/kavachos"
									className="inline-flex items-center gap-2 rounded-md border border-fd-border bg-fd-background px-5 py-2 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
									target="_blank"
									rel="noopener noreferrer"
								>
									Star on GitHub
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</>
	);
}
