import {
	Key,
	Shield,
	GitBranch,
	FileText,
	Server,
	Zap,
	Bot,
	Check,
	X,
	Clock,
	ArrowRight,
} from "lucide-react";

export function FeatureGrid() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
			{/* 01 Agent identity */}
			<div className="border-b border-r border-fd-border p-6 sm:p-8">
				<Label number="01" text="Agent identity" />
				<h3 className="mt-1 font-heading text-base font-semibold tracking-tight">
					Cryptographic bearer tokens.
				</h3>
				<p className="mt-2 text-[13px] font-light text-fd-muted-foreground/60 leading-relaxed">
					SHA-256 hashed, shown once, rotatable. Each agent is a first-class
					identity.
				</p>
				{/* Visual: token preview */}
				<div className="mt-5 overflow-hidden rounded-lg border border-fd-border bg-fd-secondary/30">
					<div className="flex items-center gap-2 px-3 py-2.5">
						<Key className="h-3.5 w-3.5 text-[var(--kavach-gold-primary)]" />
						<code className="font-mono text-[11px] text-fd-muted-foreground/70">
							kv_a3f8c2...e91b
						</code>
					</div>
				</div>
			</div>

			{/* 02 Permission engine */}
			<div className="border-b border-r border-fd-border p-6 sm:p-8">
				<Label number="02" text="Permission engine" />
				<h3 className="mt-1 font-heading text-base font-semibold tracking-tight">
					Wildcard resource matching.
				</h3>
				<p className="mt-2 text-[13px] font-light text-fd-muted-foreground/60 leading-relaxed">
					Rate limits, time windows, IP allowlists, and human-in-the-loop
					approval gates.
				</p>
				{/* Visual: permission badges */}
				<div className="mt-5 flex flex-wrap gap-1.5">
					<PermBadge allowed>mcp:github:*</PermBadge>
					<PermBadge allowed>mcp:slack:read</PermBadge>
					<PermBadge>mcp:deploy:*</PermBadge>
				</div>
			</div>

			{/* 03 Delegation chains */}
			<div className="border-b border-fd-border p-6 sm:p-8">
				<Label number="03" text="Delegation chains" />
				<h3 className="mt-1 font-heading text-base font-semibold tracking-tight">
					Agent-to-agent delegation.
				</h3>
				<p className="mt-2 text-[13px] font-light text-fd-muted-foreground/60 leading-relaxed">
					Pass a strict subset of permissions to a sub-agent. Depth limits and
					expiry built in.
				</p>
				{/* Visual: chain */}
				<div className="mt-5 flex items-center gap-1.5 text-[11px]">
					<ChainNode name="orchestrator" color="text-blue-400" />
					<ArrowRight className="h-3 w-3 text-fd-muted-foreground/50" />
					<ChainNode
						name="sub-agent"
						color="text-[var(--kavach-gold-primary)]"
					/>
					<ArrowRight className="h-3 w-3 text-fd-muted-foreground/50" />
					<ChainNode name="worker" color="text-emerald-400" />
				</div>
			</div>

			{/* 04 Audit trail */}
			<div className="border-b border-r border-fd-border p-6 sm:p-8">
				<Label number="04" text="Audit trail" />
				<h3 className="mt-1 font-heading text-base font-semibold tracking-tight">
					Every call recorded.
				</h3>
				<p className="mt-2 text-[13px] font-light text-fd-muted-foreground/60 leading-relaxed">
					Query by agent, action, or outcome. Export to JSON or CSV for
					compliance.
				</p>
				{/* Visual: log entries */}
				<div className="mt-5 space-y-1.5">
					<LogEntry
						action="read"
						resource="github:repos"
						status="allowed"
						time="2s ago"
					/>
					<LogEntry
						action="write"
						resource="deploy:prod"
						status="denied"
						time="5s ago"
					/>
					<LogEntry
						action="read"
						resource="slack:messages"
						status="allowed"
						time="12s ago"
					/>
				</div>
			</div>

			{/* 05 MCP OAuth 2.1 */}
			<div className="border-b border-r border-fd-border p-6 sm:p-8">
				<Label number="05" text="MCP OAuth 2.1" />
				<h3 className="mt-1 font-heading text-base font-semibold tracking-tight">
					Spec-compliant auth server.
				</h3>
				<p className="mt-2 text-[13px] font-light text-fd-muted-foreground/60 leading-relaxed">
					Full authorization server for Model Context Protocol with PKCE S256.
				</p>
				{/* Visual: RFC badges */}
				<div className="mt-5 flex flex-wrap gap-1.5">
					<RfcBadge>PKCE S256</RfcBadge>
					<RfcBadge>RFC 9728</RfcBadge>
					<RfcBadge>RFC 8707</RfcBadge>
					<RfcBadge>RFC 7591</RfcBadge>
				</div>
			</div>

			{/* 06 Framework adapters */}
			<div className="border-b border-fd-border p-6 sm:p-8">
				<Label number="06" text="Framework adapters" />
				<h3 className="mt-1 font-heading text-base font-semibold tracking-tight">
					Works with your stack.
				</h3>
				<p className="mt-2 text-[13px] font-light text-fd-muted-foreground/60 leading-relaxed">
					Core has zero deps. Adapters for seven frameworks and any JS runtime.
				</p>
				{/* Visual: framework list */}
				<div className="mt-5 flex flex-wrap gap-1.5">
					<FrameworkBadge active>Hono</FrameworkBadge>
					<FrameworkBadge active>Express</FrameworkBadge>
					<FrameworkBadge active>Next.js</FrameworkBadge>
					<FrameworkBadge>Fastify</FrameworkBadge>
					<FrameworkBadge>Nuxt</FrameworkBadge>
					<FrameworkBadge>+2</FrameworkBadge>
				</div>
			</div>
		</div>
	);
}

function Label({ number, text }: { number: string; text: string }) {
	return (
		<p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-fd-muted-foreground/60">
			<span className="text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
				{number}
			</span>{" "}
			{text}
		</p>
	);
}

function PermBadge({
	children,
	allowed,
}: {
	children: React.ReactNode;
	allowed?: boolean;
}) {
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] ${
				allowed
					? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
					: "border-red-500/20 bg-red-500/5 text-red-500/60 line-through"
			}`}
		>
			{allowed ? (
				<Check className="h-2.5 w-2.5" />
			) : (
				<X className="h-2.5 w-2.5" />
			)}
			{children}
		</span>
	);
}

function ChainNode({ name, color }: { name: string; color: string }) {
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-md border border-fd-border bg-fd-secondary/30 px-2 py-1 font-mono text-[10px] ${color}`}
		>
			<Bot className="h-2.5 w-2.5" />
			{name}
		</span>
	);
}

function LogEntry({
	action,
	resource,
	status,
	time,
}: {
	action: string;
	resource: string;
	status: "allowed" | "denied";
	time: string;
}) {
	return (
		<div className="flex items-center gap-2 rounded-md border border-fd-border bg-fd-secondary/20 px-2.5 py-1.5 text-[10px]">
			<span
				className={`inline-flex items-center gap-0.5 font-medium ${
					status === "allowed"
						? "text-emerald-600 dark:text-emerald-400"
						: "text-red-500"
				}`}
			>
				{status === "allowed" ? (
					<Check className="h-2.5 w-2.5" />
				) : (
					<X className="h-2.5 w-2.5" />
				)}
				{status}
			</span>
			<span className="font-mono text-fd-muted-foreground/60">
				{action}:{resource}
			</span>
			<span className="ml-auto text-fd-muted-foreground/50">{time}</span>
		</div>
	);
}

function RfcBadge({ children }: { children: React.ReactNode }) {
	return (
		<span className="rounded-md border border-fd-border bg-fd-secondary/30 px-2 py-1 font-mono text-[10px] text-fd-muted-foreground/60">
			{children}
		</span>
	);
}

function FrameworkBadge({
	children,
	active,
}: {
	children: React.ReactNode;
	active?: boolean;
}) {
	return (
		<span
			className={`rounded-md border px-2 py-1 text-[11px] font-medium ${
				active
					? "border-fd-border bg-fd-card text-fd-foreground"
					: "border-fd-border/50 text-fd-muted-foreground/60"
			}`}
		>
			{children}
		</span>
	);
}
