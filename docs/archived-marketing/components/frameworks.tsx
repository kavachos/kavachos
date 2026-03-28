import {
	HonoIcon,
	ExpressIcon,
	NextjsIcon,
	FastifyIcon,
	NuxtIcon,
	SvelteIcon,
	AstroIcon,
} from "./icons";

const frameworks = [
	{ name: "Hono", icon: HonoIcon, status: "ready" as const },
	{ name: "Express", icon: ExpressIcon, status: "ready" as const },
	{ name: "Next.js", icon: NextjsIcon, status: "ready" as const },
	{ name: "Fastify", icon: FastifyIcon, status: "soon" as const },
	{ name: "Nuxt", icon: NuxtIcon, status: "soon" as const },
	{ name: "SvelteKit", icon: SvelteIcon, status: "soon" as const },
	{ name: "Astro", icon: AstroIcon, status: "soon" as const },
];

const runtimes = [
	{ name: "Node.js" },
	{ name: "Bun" },
	{ name: "Deno" },
	{ name: "Cloudflare Workers" },
];

export function Frameworks() {
	return (
		<div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
			<div>
				<p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-fd-muted-foreground/40">
					Framework adapters
				</p>
				<div className="flex flex-wrap gap-1.5">
					{frameworks.map((f) => {
						const Icon = f.icon;
						return (
							<span
								key={f.name}
								className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:border-fd-foreground/15 ${
									f.status === "ready"
										? "border-fd-border bg-fd-card text-fd-foreground"
										: "border-fd-border/50 text-fd-muted-foreground/40"
								}`}
							>
								<Icon className="h-3.5 w-3.5" />
								{f.name}
								{f.status === "soon" && (
									<span className="text-[8px] font-normal opacity-50">
										soon
									</span>
								)}
							</span>
						);
					})}
				</div>
			</div>
			<div>
				<p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-fd-muted-foreground/40">
					Runs on
				</p>
				<div className="flex flex-wrap gap-1.5">
					{runtimes.map((r) => (
						<span
							key={r.name}
							className="inline-flex items-center rounded-md border border-fd-border bg-fd-card px-2.5 py-1.5 text-[11px] font-medium text-fd-foreground transition-colors hover:border-fd-foreground/15"
						>
							{r.name}
						</span>
					))}
				</div>
			</div>
		</div>
	);
}
