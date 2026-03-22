import {
	Shield,
	ArrowRight,
	Terminal,
	ChevronRight,
	Check,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/button";
import { Footer } from "@/components/footer";
import { FeatureGrid } from "@/components/feature-grid";
import { FlowDiagram } from "@/components/flow-diagram";
import { NavSpacer } from "@/components/nav";
import { InteractiveGrid } from "@/components/interactive-grid";
import { HonoIcon, ExpressIcon, NextjsIcon, FastifyIcon, NuxtIcon, SvelteIcon, AstroIcon } from "@/components/icons";

export default function HomePage() {
	return (
		<div className="relative text-fd-foreground">
			<NavSpacer />
			<div className="flex flex-col lg:flex-row">
				{/* ===== LEFT PANE: Sticky hero ===== */}
				<div className="relative w-full border-b border-fd-border lg:sticky lg:top-[var(--nav-height)] lg:h-[calc(100vh-var(--nav-height))] lg:w-[40%] lg:border-b-0 lg:border-r lg:overflow-hidden">
					{/* Gold ambient glow */}
					<div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--kavach-gold-mid)]/[0.06] blur-3xl" />
					{/* Background watermark */}
					<div className="pointer-events-none absolute inset-0 z-[1] flex select-none items-start justify-center overflow-hidden pt-16" aria-hidden="true">
						<span className="animate-fade-in font-heading leading-none tracking-[-0.03em]" style={{ color: "rgba(201, 168, 76, 0.05)" }}>
							<span className="text-[12vw] font-extrabold lg:text-[6rem]">kavach</span>
							<span className="text-[14vw] font-black lg:text-[7rem]">OS</span>
						</span>
					</div>

					{/* Hero content */}
					<div className="relative flex h-full flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
						<div className="relative z-10">
						<Link
							href="/docs"
							className="group mb-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--kavach-gold-mid)]/25 bg-[var(--kavach-gold-mid)]/8 px-3.5 py-1 text-[11px] font-medium text-[var(--kavach-gold-deep)] transition-colors hover:bg-[var(--kavach-gold-mid)]/15 dark:text-[var(--kavach-gold-bright)]"
						>
							<Shield className="h-3 w-3" />
							Open source auth SDK
							<ChevronRight className="h-3 w-3 opacity-40 transition-transform group-hover:translate-x-0.5" />
						</Link>

						<h1 className="text-3xl font-extrabold tracking-tight text-lift sm:text-4xl xl:text-[2.75rem] xl:leading-[1.15]">
							Identity for humans.
							<br />
							<span className="gradient-gold-text text-lift-gold">
								Identity for AI agents.
							</span>
						</h1>

						<p className="mt-5 max-w-sm text-[15px] font-light text-fd-muted-foreground/70 leading-relaxed">
							Give every AI agent a cryptographic identity, scoped permissions,
							and an audit trail. Plugs into your existing auth stack.
						</p>

						<div className="mt-8 flex flex-wrap items-center gap-3">
							<Button href="/docs/quickstart" variant="gold">
								Get started
								<ArrowRight className="h-3.5 w-3.5" />
							</Button>
							<Button href="https://github.com/kavachos/kavachos" variant="outline" external>
								View source
							</Button>
						</div>

						<div className="mt-5">
							<code className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-3.5 py-2 font-mono text-xs text-fd-muted-foreground/60">
								<Terminal className="h-3.5 w-3.5 text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]" />
								pnpm add kavachos
							</code>
						</div>

						<div className="mt-8 hidden lg:block">
							<p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/30">
								Works with
							</p>
							{/* Marquee */}
							<div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
								<div className="flex w-max animate-marquee gap-3">
									<FrameworkPill icon={HonoIcon} name="Hono" />
									<FrameworkPill icon={ExpressIcon} name="Express" />
									<FrameworkPill icon={NextjsIcon} name="Next.js" />
									<FrameworkPill icon={FastifyIcon} name="Fastify" />
									<FrameworkPill icon={NuxtIcon} name="Nuxt" />
									<FrameworkPill icon={SvelteIcon} name="SvelteKit" />
									<FrameworkPill icon={AstroIcon} name="Astro" />
									{/* Duplicate for seamless loop */}
									<FrameworkPill icon={HonoIcon} name="Hono" />
									<FrameworkPill icon={ExpressIcon} name="Express" />
									<FrameworkPill icon={NextjsIcon} name="Next.js" />
									<FrameworkPill icon={FastifyIcon} name="Fastify" />
									<FrameworkPill icon={NuxtIcon} name="Nuxt" />
									<FrameworkPill icon={SvelteIcon} name="SvelteKit" />
									<FrameworkPill icon={AstroIcon} name="Astro" />
								</div>
							</div>
						</div>
					</div>
					</div>
					{/* Interactive grid - behind content */}
					<div className="absolute inset-0 z-0 overflow-hidden">
						<InteractiveGrid />
					</div>
				</div>

				{/* ===== RIGHT PANE: Scrollable content ===== */}
				<div className="w-full lg:w-[60%]">
					{/* 1. Flow diagram */}
					<div className="border-b border-fd-border px-6 py-5 sm:px-10 lg:px-12">
						<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/50">
							How it works
						</p>
						<FlowDiagram />
					</div>

					{/* 2. Features (moved up) */}
					<div className="border-b border-fd-border px-6 py-3 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/50">
							Features
						</p>
					</div>
					<FeatureGrid />

					{/* 3. Stats */}
					<div className="border-t border-fd-border px-6 py-6 sm:px-10 lg:px-12">
						<p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/50">
							Why now
						</p>
						<div className="grid grid-cols-2 gap-3">
							<StatCard number="41%" label="of MCP servers have zero auth" source="Bitsight 2025" />
							<StatCard number="97M" label="monthly MCP SDK downloads" source="npm" />
							<StatCard number="10K+" label="MCP servers deployed" source="Linux Foundation" />
							<StatCard number="Aug 2026" label="EU AI Act enforcement" source="Article 12" />
						</div>
					</div>

					{/* 4. Comparison */}
					<div className="border-t border-fd-border px-6 py-6 sm:px-10 lg:px-12">
						<p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/50">
							Comparison
						</p>
						<div className="overflow-hidden rounded-lg border border-fd-border">
							<table className="w-full text-[12px]">
								<thead>
									<tr className="border-b border-fd-border bg-fd-secondary/30">
										<th className="px-3 py-2.5 text-left font-medium text-fd-muted-foreground/60" />
										<th className="px-3 py-2.5 text-center font-heading font-semibold text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
											KavachOS
										</th>
										<th className="px-3 py-2.5 text-center font-medium text-fd-muted-foreground/50">
											better-auth
										</th>
										<th className="px-3 py-2.5 text-center font-medium text-fd-muted-foreground/50">
											DIY
										</th>
									</tr>
								</thead>
								<tbody className="text-fd-muted-foreground/70">
									<CompRow feature="Agent-first identity" ba={false} diy="depends" />
									<CompRow feature="Wildcard permissions" ba={false} diy="depends" />
									<CompRow feature="Delegation chains" ba={false} diy={false} />
									<CompRow feature="MCP OAuth 2.1" ba={false} diy={false} />
									<CompRow feature="Immutable audit" ba="partial" diy={false} />
									<CompRow feature="Token rotation" ba={false} diy={false} />
									<CompRow feature="Framework agnostic" ba diy />
								</tbody>
							</table>
						</div>
					</div>

					{/* 5. CTA */}
					<div className="border-t border-fd-border px-6 py-10 text-center sm:px-10 lg:px-12">
						<h2 className="text-2xl font-bold tracking-tight text-lift sm:text-3xl">
							Armor for every identity
						</h2>
						<p className="mx-auto mt-3 max-w-md text-sm font-light text-fd-muted-foreground/60 leading-relaxed">
							TypeScript, MIT licensed, works with any auth provider.
						</p>
						<div className="mt-8 flex flex-wrap justify-center gap-3">
							<Button href="/docs/quickstart" variant="gold" size="lg">
								Read the docs
								<ArrowRight className="h-4 w-4" />
							</Button>
							<Button href="https://github.com/kavachos/kavachos" variant="outline" size="lg" external>
								Star on GitHub
							</Button>
						</div>
					</div>

					<Footer />
				</div>
			</div>
		</div>
	);
}

function StatCard({ number, label, source }: { number: string; label: string; source: string }) {
	return (
		<div className="rounded-lg border border-fd-border bg-fd-card p-4 transition-colors hover:border-[var(--kavach-gold-mid)]/20">
			<p className="font-heading text-xl font-bold tracking-tight text-fd-foreground">
				{number}
			</p>
			<p className="mt-1 text-[11px] font-light text-fd-muted-foreground/60 leading-snug">
				{label}
			</p>
			<p className="mt-2 font-mono text-[9px] text-fd-muted-foreground/30">{source}</p>
		</div>
	);
}

function CompRow({ feature, ba, diy }: { feature: string; ba?: boolean | string; diy?: boolean | string }) {
	const cell = (v: boolean | string | undefined) => {
		if (v === true) return <Check className="mx-auto h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />;
		if (v === false) return <span className="text-fd-muted-foreground/20">&times;</span>;
		if (typeof v === "string") return <span className="text-[10px] text-amber-500">{v}</span>;
		return null;
	};
	return (
		<tr className="border-b border-fd-border last:border-b-0">
			<td className="px-3 py-2 font-medium text-fd-foreground/80">{feature}</td>
			<td className="px-3 py-2 text-center"><Check className="mx-auto h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" /></td>
			<td className="px-3 py-2 text-center">{cell(ba)}</td>
			<td className="px-3 py-2 text-center">{cell(diy)}</td>
		</tr>
	);
}

function FrameworkPill({ icon: Icon, name }: { icon: typeof HonoIcon; name: string }) {
	return (
		<span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-fd-border/50 bg-fd-card/60 px-3 py-1.5 text-xs font-medium text-fd-muted-foreground/60 backdrop-blur-sm">
			<Icon className="h-4 w-4" />
			{name}
		</span>
	);
}
