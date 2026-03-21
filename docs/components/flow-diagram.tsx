"use client";

import { motion } from "framer-motion";
import {
	User,
	Bot,
	Server,
	Shield,
	ArrowDown,
	FileText,
	GitBranch,
	X,
	Globe,
	KeyRound,
	AlertTriangle,
	Check,
} from "lucide-react";
import { ClerkIcon, Auth0Icon, FirebaseIcon } from "./icons";

const fadeIn = (delay: number) => ({
	hidden: { opacity: 0, y: 10 },
	show: {
		opacity: 1,
		y: 0,
		transition: { delay, duration: 0.35, ease: "easeOut" as const },
	},
});

const lineGrow = (delay: number) => ({
	hidden: { scaleY: 0, originY: 0 as const },
	show: {
		scaleY: 1,
		transition: { delay, duration: 0.25, ease: "easeOut" as const },
	},
});

export function FlowDiagram() {
	return (
		<motion.div
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-40px" }}
			className="overflow-hidden rounded-xl border border-fd-border bg-fd-card"
		>
			<div className="flex flex-col sm:flex-row">
				{/* ===== LEFT: With KavachOS ===== */}
				<div className="relative flex-1 border-b border-fd-border p-5 sm:border-b-0 sm:border-r sm:p-6">
					{/* Subtle gold ambient glow behind the left pane */}
					<div className="pointer-events-none absolute inset-0 overflow-hidden">
						<div className="absolute left-1/2 top-2/3 h-[200px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--kavach-gold-mid)]/[0.03] blur-3xl" />
					</div>

					<p className="relative mb-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
						With KavachOS
					</p>

					<div className="relative flex flex-col items-center">
						<Node icon={User} label="Human" sub="logs in" color="blue" d={0} />
						<ConnectorLine d={0.08} />
						{/* Auth provider */}
						<motion.div variants={fadeIn(0.15)} className="flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-secondary/20 px-2.5 py-1.5">
							<KeyRound className="h-3 w-3 text-fd-muted-foreground/40" />
							<span className="text-[10px] text-fd-muted-foreground/50">Clerk / Auth.js / etc.</span>
							<div className="ml-1 flex gap-1 text-fd-muted-foreground/20">
								<ClerkIcon className="h-2.5 w-2.5" />
								<Auth0Icon className="h-2.5 w-2.5" />
								<FirebaseIcon className="h-2.5 w-2.5" />
							</div>
						</motion.div>
						<ConnectorLine d={0.22} />
						<Node icon={Globe} label="Your app" sub="session active" color="blue" d={0.28} />

						{/* KavachOS divider */}
						<motion.div variants={fadeIn(0.35)} className="my-2 w-full">
							<div className="flex items-center gap-2">
								<div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--kavach-gold-mid)]/30 to-transparent" />
								<span className="rounded-full border border-[var(--kavach-gold-mid)]/20 bg-[var(--kavach-gold-mid)]/5 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.15em] text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-bright)]">
									kavachos
								</span>
								<div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--kavach-gold-mid)]/30 to-transparent" />
							</div>
						</motion.div>

						<Node icon={Bot} label="AI agent" sub="kv_... token" color="gold" d={0.42} highlight />
						<ConnectorLine d={0.48} gold pulse />
						<motion.div variants={fadeIn(0.52)} className="rounded-md border border-[var(--kavach-gold-mid)]/20 bg-[var(--kavach-gold-mid)]/5 px-2 py-0.5 font-mono text-[8px] text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
							authorize()
						</motion.div>
						<ConnectorLine d={0.56} gold pulse />

						{/* KavachOS core node with glow */}
						<motion.div
							variants={fadeIn(0.6)}
							className="kavach-glow relative flex items-center gap-2 rounded-lg border-2 border-[var(--kavach-gold-mid)]/50 bg-[var(--kavach-gold-mid)]/10 px-3.5 py-2.5 shadow-lg shadow-[var(--kavach-gold-shadow)]/15"
						>
							<Shield className="h-4 w-4 text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-bright)]" />
							<span className="font-heading text-[11px] font-bold text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-bright)]">
								KavachOS
							</span>
						</motion.div>

						{/* Three branches */}
						<motion.div variants={fadeIn(0.7)} className="mt-2 grid w-full grid-cols-3 gap-2">
							<Branch icon={Server} label="MCP" sub="scoped" color="green" d={0.75} />
							<Branch icon={FileText} label="Audit" sub="logged" color="purple" d={0.8} />
							<Branch icon={GitBranch} label="Delegate" sub="chain" color="gold" d={0.85} />
						</motion.div>

						{/* Result badges */}
						<motion.div variants={fadeIn(0.9)} className="mt-3 flex flex-wrap gap-1.5">
							<ResultBadge good>identity</ResultBadge>
							<ResultBadge good>least privilege</ResultBadge>
							<ResultBadge good>audit trail</ResultBadge>
						</motion.div>
					</div>
				</div>

				{/* ===== RIGHT: Without KavachOS ===== */}
				<div className="flex-1 p-5 opacity-60 sm:p-6">
					<p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/30">
						Without
					</p>

					<div className="flex flex-col items-center">
						<Node icon={User} label="Human" sub="logs in" color="neutral" d={0.3} />
						<ConnectorLine d={0.38} />
						<Node icon={Globe} label="Your app" sub="session" color="neutral" d={0.44} />
						<ConnectorLine d={0.5} />
						<Node icon={Bot} label="AI agent" sub="no identity" color="neutral" d={0.56} />
						<ConnectorLine d={0.62} dashed />
						<motion.div variants={fadeIn(0.66)} className="rounded-md border border-dashed border-fd-muted-foreground/15 px-2 py-0.5 text-[8px] text-fd-muted-foreground/30">
							shared .env key
						</motion.div>
						<ConnectorLine d={0.7} dashed />
						<Node icon={Server} label="MCP server" sub="wide open" color="neutral" d={0.76} />

						<motion.div variants={fadeIn(0.85)} className="mt-3 flex flex-wrap gap-1.5">
							<ResultBadge>no identity</ResultBadge>
							<ResultBadge>no scoping</ResultBadge>
							<ResultBadge>no audit</ResultBadge>
						</motion.div>

						<motion.div
							variants={fadeIn(0.92)}
							className="mt-3 flex items-start gap-1.5 rounded-md border border-red-500/10 bg-red-500/5 px-2.5 py-2 text-[10px] text-red-500/60"
						>
							<AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
							<span>Can&apos;t revoke one agent without rotating all keys</span>
						</motion.div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

function Node({
	icon: Icon,
	label,
	sub,
	color,
	d,
	highlight,
}: {
	icon: typeof User;
	label: string;
	sub: string;
	color: "blue" | "neutral" | "gold" | "green" | "purple";
	d: number;
	highlight?: boolean;
}) {
	const colors = {
		blue: "border-blue-400/30 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
		neutral: "border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-fd-border dark:bg-fd-secondary/20 dark:text-fd-muted-foreground/50",
		gold: "border-[var(--kavach-gold-mid)]/40 bg-amber-50 text-[var(--kavach-gold-deep)] dark:border-[var(--kavach-gold-mid)]/25 dark:bg-[var(--kavach-gold-mid)]/10 dark:text-[var(--kavach-gold-bright)]",
		green: "border-emerald-400/30 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
		purple: "border-purple-400/30 bg-purple-50 text-purple-600 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400",
	};

	return (
		<motion.div
			variants={fadeIn(d)}
			className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${colors[color]} ${
				highlight
					? "ring-1 ring-[var(--kavach-gold-mid)]/20 shadow-md shadow-[var(--kavach-gold-shadow)]/10"
					: ""
			}`}
		>
			<Icon className="h-3 w-3 shrink-0" />
			<div>
				<p className="text-[11px] font-medium leading-none">{label}</p>
				<p className="mt-0.5 text-[8px] opacity-50">{sub}</p>
			</div>
		</motion.div>
	);
}

function Branch({
	icon: Icon,
	label,
	sub,
	color,
	d,
}: {
	icon: typeof Server;
	label: string;
	sub: string;
	color: "green" | "purple" | "gold";
	d: number;
}) {
	const colors = {
		green: "text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50 dark:border-emerald-500/15 dark:bg-emerald-500/5",
		purple: "text-purple-600 dark:text-purple-400 border-purple-200 bg-purple-50 dark:border-purple-500/15 dark:bg-purple-500/5",
		gold: "text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)] border-amber-200 bg-amber-50 dark:border-[var(--kavach-gold-mid)]/15 dark:bg-[var(--kavach-gold-mid)]/5",
	};

	return (
		<motion.div variants={fadeIn(d)} className="flex flex-col items-center gap-1">
			<div className="h-3 w-px bg-[var(--kavach-gold-mid)]/20" />
			<div className={`flex flex-col items-center rounded-lg border bg-fd-secondary/20 px-2 py-1.5 ${colors[color]}`}>
				<Icon className="h-3 w-3" />
				<span className="mt-0.5 text-[8px] font-medium">{label}</span>
				<span className="text-[7px] opacity-40">{sub}</span>
			</div>
		</motion.div>
	);
}

function ConnectorLine({ d, gold, dashed, pulse }: { d: number; gold?: boolean; dashed?: boolean; pulse?: boolean }) {
	return (
		<motion.div variants={lineGrow(d)} className="relative flex flex-col items-center">
			<div
				className={`my-0.5 h-4 w-px ${
					dashed
						? "border-l border-dashed border-fd-muted-foreground/15"
						: gold
							? "bg-[var(--kavach-gold-mid)]/30"
							: "bg-fd-muted-foreground/10"
				}`}
			/>
			{/* Flowing data dot */}
			{pulse && (
				<div className="absolute inset-0 flex items-center justify-center">
					<motion.div
						className="h-1.5 w-1.5 rounded-full bg-[var(--kavach-gold-primary)]"
						animate={{
							y: [-6, 6],
							opacity: [0, 1, 0],
						}}
						transition={{
							duration: 1.5,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					/>
				</div>
			)}
			<ArrowDown
				className={`h-2 w-2 ${
					gold ? "text-[var(--kavach-gold-mid)]/50" : "text-fd-muted-foreground/15"
				}`}
			/>
		</motion.div>
	);
}

function ResultBadge({ children, good }: { children: React.ReactNode; good?: boolean }) {
	return (
		<span
			className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[8px] font-medium ${
				good
					? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
					: "border-red-200 bg-red-50 text-red-500 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
			}`}
		>
			{good ? <Check className="h-2 w-2" /> : <X className="h-2 w-2" />}
			{children}
		</span>
	);
}
