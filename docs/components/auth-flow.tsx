"use client";

import { motion } from "framer-motion";
import { Shield, User, Bot, Server, FileText, ArrowRight } from "lucide-react";

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.15, delayChildren: 0.3 },
	},
};

const item = {
	hidden: { opacity: 0, y: 12 },
	show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function AuthFlow() {
	return (
		<motion.div
			variants={container}
			initial="hidden"
			animate="show"
			className="relative w-full"
		>
			{/* Flow steps */}
			<div className="flex flex-col gap-3">
				{/* Step 1: Human owns agent */}
				<FlowStep
					icon={User}
					label="Human user"
					detail="Authenticated via your existing provider"
					color="text-blue-400"
					bgColor="bg-blue-400/10 border-blue-400/20"
				/>

				<FlowArrow label="creates & owns" />

				{/* Step 2: Agent gets identity */}
				<FlowStep
					icon={Bot}
					label="AI agent"
					detail="Cryptographic identity · kv_... bearer token"
					color="text-[var(--kavach-gold-primary)]"
					bgColor="bg-[var(--kavach-gold-mid)]/10 border-[var(--kavach-gold-mid)]/20"
					highlight
				/>

				<FlowArrow label="scoped permissions" />

				{/* Step 3: Agent calls MCP */}
				<FlowStep
					icon={Server}
					label="MCP server"
					detail="OAuth 2.1 · PKCE · Resource indicators"
					color="text-emerald-400"
					bgColor="bg-emerald-400/10 border-emerald-400/20"
				/>

				<FlowArrow label="every call logged" />

				{/* Step 4: Audit trail */}
				<FlowStep
					icon={FileText}
					label="Audit trail"
					detail="Immutable · Exportable · Compliance-ready"
					color="text-purple-400"
					bgColor="bg-purple-400/10 border-purple-400/20"
				/>
			</div>

			{/* Shield overlay */}
			<motion.div
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 1.2, duration: 0.5 }}
				className="absolute -right-3 top-1/2 -translate-y-1/2 hidden xl:block"
			>
				<div className="relative">
					<Shield className="h-20 w-20 text-[var(--kavach-gold-mid)]/10" strokeWidth={0.5} />
					<Shield className="absolute inset-0 h-20 w-20 text-[var(--kavach-gold-mid)]/20 animate-pulse-gold" strokeWidth={1} />
				</div>
			</motion.div>
		</motion.div>
	);
}

function FlowStep({
	icon: Icon,
	label,
	detail,
	color,
	bgColor,
	highlight,
}: {
	icon: typeof User;
	label: string;
	detail: string;
	color: string;
	bgColor: string;
	highlight?: boolean;
}) {
	return (
		<motion.div
			variants={item}
			className={`flex items-center gap-3 rounded-lg border p-3 ${bgColor} ${
				highlight ? "ring-1 ring-[var(--kavach-gold-mid)]/30" : ""
			}`}
		>
			<div className={`rounded-md p-1.5 ${color}`}>
				<Icon className="h-4 w-4" />
			</div>
			<div className="min-w-0">
				<p className="text-sm font-medium">{label}</p>
				<p className="text-xs text-fd-muted-foreground">{detail}</p>
			</div>
		</motion.div>
	);
}

function FlowArrow({ label }: { label: string }) {
	return (
		<motion.div variants={item} className="flex items-center gap-2 pl-6">
			<div className="h-4 w-px bg-fd-border" />
			<ArrowRight className="h-3 w-3 text-fd-muted-foreground/50" />
			<span className="text-[10px] font-medium uppercase tracking-wider text-fd-muted-foreground/60">
				{label}
			</span>
		</motion.div>
	);
}
