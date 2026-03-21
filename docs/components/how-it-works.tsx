"use client";

import { motion } from "framer-motion";
import { User, Bot, Shield, FileText } from "lucide-react";

const steps = [
	{
		number: "01",
		icon: User,
		title: "Human logs in",
		description:
			"Your user authenticates with your existing provider. Clerk, Auth.js, better-auth, whatever you already have. KavachOS does not replace it.",
		detail: "Bring your own auth",
		color: "text-blue-500 dark:text-blue-400",
		borderColor: "border-blue-500/20",
	},
	{
		number: "02",
		icon: Bot,
		title: "Agent gets identity",
		description:
			"The user creates an AI agent with scoped permissions. KavachOS issues a cryptographic bearer token and stores only the hash.",
		detail: "kv_... bearer token",
		color: "text-[var(--kavach-gold-primary)]",
		borderColor: "border-[var(--kavach-gold-mid)]/20",
	},
	{
		number: "03",
		icon: Shield,
		title: "Agent calls tools",
		description:
			"Before each action, kavach.authorize() checks the agent's permissions against the requested resource. Rate limits, time windows, and approval gates are enforced at call time.",
		detail: "Least privilege",
		color: "text-emerald-500 dark:text-emerald-400",
		borderColor: "border-emerald-500/20",
	},
	{
		number: "04",
		icon: FileText,
		title: "Everything is recorded",
		description:
			"Every authorization decision, allowed or denied, is written to an immutable audit log. Export to JSON or CSV for your compliance team.",
		detail: "Append-only log",
		color: "text-purple-500 dark:text-purple-400",
		borderColor: "border-purple-500/20",
	},
] as const;

const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.12 } },
};

const item = {
	hidden: { opacity: 0, y: 16 },
	show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function HowItWorks() {
	return (
		<motion.div
			variants={container}
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-100px" }}
			className="grid gap-px overflow-hidden rounded-lg border border-fd-border bg-fd-border sm:grid-cols-2"
		>
			{steps.map((step) => {
				const Icon = step.icon;
				return (
					<motion.div
						key={step.number}
						variants={item}
						className="relative bg-fd-card p-8"
					>
						{/* Step number */}
						<span className="font-mono text-[10px] font-medium text-fd-muted-foreground/40">
							{step.number}
						</span>

						{/* Icon + title */}
						<div className="mt-3 flex items-center gap-3">
							<div
								className={`rounded-md border p-2 ${step.borderColor} ${step.color}`}
							>
								<Icon className="h-4 w-4" />
							</div>
							<h3 className="font-heading text-base font-semibold tracking-tight">
								{step.title}
							</h3>
						</div>

						{/* Description */}
						<p className="mt-3 text-sm font-light text-fd-muted-foreground/70 leading-relaxed">
							{step.description}
						</p>

						{/* Detail tag */}
						<span className="mt-4 inline-block font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-fd-muted-foreground/50">
							{step.detail}
						</span>
					</motion.div>
				);
			})}
		</motion.div>
	);
}
