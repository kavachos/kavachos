import type { Metadata } from "next";
import Link from "next/link";
import {
	Shield,
	AlertTriangle,
	BarChart2,
	FileCheck,
	Coins,
	ArrowRight,
	Check,
	ChevronRight,
	Clock,
} from "lucide-react";
import { Button } from "@/components/button";
import { NavSpacer } from "@/components/nav";
import { InteractiveGrid } from "@/components/interactive-grid";

export const metadata: Metadata = {
	title: "Security and compliance",
	description:
		"Anomaly detection, trust scoring, compliance reports, and budget controls. Built for the EU AI Act deadline.",
};

export default function SecurityPage() {
	return (
		<div className="relative text-fd-foreground">
			<NavSpacer />
			<div className="flex flex-col lg:flex-row">
				{/* Left pane: sticky hero */}
				<div className="relative w-full border-b border-fd-border lg:sticky lg:top-[var(--nav-height)] lg:h-[calc(100vh-var(--nav-height))] lg:w-[40%] lg:border-b-0 lg:border-r lg:overflow-hidden">
					<div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--kavach-gold-mid)]/[0.06] blur-3xl" />

					<div className="relative flex h-full flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
						<div className="relative z-10">
							<span className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--kavach-gold-mid)]/25 bg-[var(--kavach-gold-mid)]/8 px-3.5 py-1 text-[11px] font-medium text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-bright)]">
								<Shield className="h-3 w-3" />
								Security
							</span>

							<h1 className="text-3xl font-extrabold tracking-tight text-lift sm:text-4xl xl:text-[2.75rem] xl:leading-[1.15]">
								Security that adapts to{" "}
								<span className="gradient-gold-text text-lift-gold">
									agent behavior
								</span>
							</h1>

							<p className="mt-5 max-w-sm text-[15px] font-light text-fd-muted-foreground leading-relaxed">
								Behavioral trust scoring, real-time anomaly detection, four
								compliance frameworks, and budget controls. All evaluated per
								agent, per request.
							</p>

							<div className="mt-8 flex flex-wrap items-center gap-3">
								<Button href="/docs/security" variant="gold">
									Security docs
									<ArrowRight className="h-3.5 w-3.5" />
								</Button>
								<Button href="/docs/quickstart" variant="outline">
									Get started
								</Button>
							</div>

							<div className="mt-8 hidden lg:block">
								<div className="flex items-center gap-2 rounded-lg border border-[var(--kavach-gold-deep)]/30 bg-[var(--kavach-gold-deep)]/5 px-4 py-3">
									<Clock className="h-3.5 w-3.5 shrink-0 text-[var(--kavach-gold-primary)]" />
									<p className="text-[11px] text-fd-muted-foreground/80 leading-snug">
										<span className="font-semibold text-[var(--kavach-gold-primary)]">
											EU AI Act: Aug 2, 2026.
										</span>{" "}
										KavachOS generates audit-ready reports for Articles 9, 12,
										14, 15, and 50.
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="absolute inset-0 z-0 overflow-hidden">
						<InteractiveGrid />
					</div>
				</div>

				{/* Right pane: scrollable sections */}
				<div className="w-full lg:w-[60%]">
					{/* Section 1: Trust scoring */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<div className="mb-1 flex items-center gap-2">
							<BarChart2 className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
								Trust scoring
							</p>
						</div>
						<h2 className="mt-2 font-heading text-lg font-semibold tracking-tight text-fd-foreground">
							Graduated autonomy based on behavior
						</h2>
						<p className="mt-1 text-sm text-fd-muted-foreground/60">
							Agents start at 0 and earn trust through successful, legitimate
							operations. Higher scores unlock fewer approval gates.
						</p>

						<div className="mt-5 space-y-1 rounded-xl border border-fd-border bg-fd-card/40 px-4 py-2">
							<TrustBar score={90} level="Elevated" range="80 – 100" color="bg-blue-500" barColor="bg-blue-500/70" />
							<TrustBar score={70} level="High" range="60 – 79" color="bg-emerald-500" barColor="bg-emerald-500/70" />
							<TrustBar score={50} level="Standard" range="40 – 59" color="bg-yellow-500" barColor="bg-yellow-500/70" />
							<TrustBar score={30} level="Low" range="20 – 39" color="bg-orange-500" barColor="bg-orange-500/70" />
							<TrustBar score={10} level="Untrusted" range="0 – 19" color="bg-red-500" barColor="bg-red-500/70" />
						</div>
					</div>

					{/* Section 2: Anomaly detection */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<div className="mb-1 flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
								Anomaly detection
							</p>
						</div>
						<h2 className="mt-2 font-heading text-lg font-semibold tracking-tight text-fd-foreground">
							Five anomaly types, configurable thresholds
						</h2>
						<p className="mt-1 text-sm text-fd-muted-foreground/60">
							Scans run per agent over a rolling time window. Results include
							matched patterns and full context.
						</p>

						<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
							<AnomalyCard
								type="high_frequency"
								label="High frequency"
								severity="medium"
								description="Call rate exceeds the configured threshold for the rolling window."
							/>
							<AnomalyCard
								type="high_denial_rate"
								label="High denial rate"
								severity="high"
								description="Permission denials represent more than 50% of recent requests."
							/>
							<AnomalyCard
								type="off_hours"
								label="Off-hours activity"
								severity="low"
								description="Agent operating outside its declared active window."
							/>
							<AnomalyCard
								type="new_resource"
								label="New resource patterns"
								severity="medium"
								description="Access to resource types not seen in the agent's history."
							/>
							<AnomalyCard
								type="permission_escalation"
								label="Permission escalation"
								severity="critical"
								description="Repeated attempts to access scopes beyond declared permissions."
							/>
						</div>
					</div>

					{/* Section 3: Compliance */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<div className="mb-1 flex items-center gap-2">
							<FileCheck className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
								Compliance
							</p>
						</div>
						<h2 className="mt-2 font-heading text-lg font-semibold tracking-tight text-fd-foreground">
							Four frameworks, one report call
						</h2>

						<div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--kavach-gold-deep)]/30 bg-[var(--kavach-gold-deep)]/5 px-4 py-3">
							<Clock className="h-4 w-4 shrink-0 text-[var(--kavach-gold-primary)]" />
							<div>
								<p className="text-xs font-semibold text-[var(--kavach-gold-primary)]">
									EU AI Act enforcement begins August 2, 2026
								</p>
								<p className="text-[11px] text-fd-muted-foreground/60">
									4 months. Articles 9, 12, 14, 15, 50 covered out of the box.
								</p>
							</div>
						</div>

						<div className="mt-4 grid grid-cols-2 gap-3">
							<FrameworkBadge label="EU AI Act" detail="Art. 9, 12, 14, 15, 50" />
							<FrameworkBadge label="NIST AI RMF" detail="GOVERN · MANAGE · MAP" />
							<FrameworkBadge label="SOC 2" detail="CC6.1 – CC7.2" />
							<FrameworkBadge label="ISO 42001" detail="A.3 · A.7 · A.8" />
						</div>
					</div>

					{/* Section 4: Budget controls */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<div className="mb-1 flex items-center gap-2">
							<Coins className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
								Budget controls
							</p>
						</div>
						<h2 className="mt-2 font-heading text-lg font-semibold tracking-tight text-fd-foreground">
							Cost caps and call limits per agent
						</h2>
						<p className="mt-1 text-sm text-fd-muted-foreground/60">
							Budget status is checked inline during{" "}
							<code className="font-mono text-[11px] text-fd-foreground/80">
								authorize()
							</code>{" "}
							calls. No separate polling required.
						</p>

						<div className="mt-5 space-y-2">
							<BudgetRow label="Daily token cost cap" value="$2.00 / day" used={68} />
							<BudgetRow label="Monthly token cost cap" value="$40.00 / mo" used={31} />
							<BudgetRow label="Call count limit" value="5,000 / day" used={84} />
						</div>

						<div className="mt-4 flex flex-wrap gap-2">
							<span className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-secondary/40 px-2.5 py-1 text-[11px] text-fd-muted-foreground/70">
								<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
								Auto-throttle above 80%
							</span>
							<span className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-secondary/40 px-2.5 py-1 text-[11px] text-fd-muted-foreground/70">
								<span className="h-1.5 w-1.5 rounded-full bg-red-500" />
								Auto-revoke at limit
							</span>
							<span className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-secondary/40 px-2.5 py-1 text-[11px] text-fd-muted-foreground/70">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								Per agent, user, or tenant
							</span>
						</div>
					</div>

					{/* Section 5: Code example */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
							API
						</p>
						<h2 className="mt-2 font-heading text-lg font-semibold tracking-tight text-fd-foreground">
							Three calls. Full security picture.
						</h2>
						<pre className="mt-4 overflow-x-auto rounded-xl border border-fd-border bg-fd-muted/50 p-5 font-mono text-xs leading-relaxed text-fd-foreground/80">
							<code>{`const scan = await kavach.security.scanAgent({
  agentId: "agent_abc123",
  windowMs: 3_600_000,
});

for (const anomaly of scan.anomalies) {
  console.log(anomaly.type);     // "high_denial_rate"
  console.log(anomaly.severity); // "high"
  console.log(anomaly.details);  // { denialRate: 0.73 }
}

const trust = await kavach.security.getTrustScore({
  agentId: "agent_abc123",
});
console.log(trust.score); // 34
console.log(trust.level); // "low"

const report = await kavach.compliance.generate({
  framework: "eu-ai-act",
  agentId: "agent_abc123",
  from: new Date("2026-01-01"),
});`}</code>
						</pre>
					</div>

					{/* Bottom CTA */}
					<div className="px-6 py-10 text-center sm:px-10 lg:px-12">
						<h2 className="text-2xl font-bold tracking-tight text-lift sm:text-3xl">
							Compliance before the deadline
						</h2>
						<p className="mx-auto mt-3 max-w-md text-sm font-light text-fd-muted-foreground/80 leading-relaxed">
							EU AI Act enforcement starts August 2, 2026. Generate your first
							report in one call.
						</p>
						<div className="mt-8 flex flex-wrap justify-center gap-3">
							<Button href="/docs/security" variant="gold" size="lg">
								Read the security docs
								<ArrowRight className="h-4 w-4" />
							</Button>
							<Button href="/products/platform" variant="outline" size="lg">
								Platform features
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function TrustBar({
	score,
	level,
	range,
	color,
	barColor,
}: {
	score: number;
	level: string;
	range: string;
	color: string;
	barColor: string;
}) {
	return (
		<div className="flex items-center gap-3 py-2">
			<div className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
			<span className="w-20 shrink-0 text-xs font-medium text-fd-foreground">{level}</span>
			<span className="w-14 shrink-0 font-mono text-[10px] text-fd-muted-foreground/50">{range}</span>
			<div className="flex-1 rounded-full bg-fd-secondary/60 h-1.5 overflow-hidden">
				<div
					className={`h-full rounded-full ${barColor}`}
					style={{ width: `${score}%` }}
				/>
			</div>
			<span className="w-8 text-right font-mono text-[10px] text-fd-muted-foreground/50">{score}</span>
		</div>
	);
}

function AnomalyCard({
	label,
	severity,
	description,
}: {
	type: string;
	label: string;
	severity: "low" | "medium" | "high" | "critical";
	description: string;
}) {
	const severityStyles: Record<string, string> = {
		low: "border-blue-500/20 bg-blue-500/5 text-blue-500 dark:text-blue-400",
		medium: "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400",
		high: "border-orange-500/20 bg-orange-500/5 text-orange-600 dark:text-orange-400",
		critical: "border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400",
	};
	return (
		<div className="rounded-lg border border-fd-border bg-fd-card/40 p-4 transition-colors hover:bg-fd-card/70">
			<div className="flex items-center justify-between gap-2">
				<span className="text-xs font-semibold text-fd-foreground">{label}</span>
				<span
					className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize ${severityStyles[severity]}`}
				>
					{severity}
				</span>
			</div>
			<p className="mt-2 text-[11px] text-fd-muted-foreground/60 leading-snug">
				{description}
			</p>
		</div>
	);
}

function FrameworkBadge({ label, detail }: { label: string; detail: string }) {
	return (
		<div className="flex flex-col gap-1 rounded-lg border border-fd-border bg-fd-card/40 p-4 transition-colors hover:bg-fd-card/70">
			<div className="flex items-center gap-2">
				<Check className="h-3 w-3 text-emerald-500" />
				<span className="text-xs font-semibold text-fd-foreground">{label}</span>
			</div>
			<span className="font-mono text-[10px] text-fd-muted-foreground/50">{detail}</span>
		</div>
	);
}

function BudgetRow({
	label,
	value,
	used,
}: {
	label: string;
	value: string;
	used: number;
}) {
	const barColor =
		used >= 80 ? "bg-red-500/70" : used >= 60 ? "bg-amber-500/70" : "bg-emerald-500/70";
	return (
		<div className="rounded-lg border border-fd-border bg-fd-card/40 px-4 py-3">
			<div className="flex items-center justify-between">
				<span className="text-[11px] font-medium text-fd-foreground">{label}</span>
				<span className="font-mono text-[10px] text-fd-muted-foreground/60">{value}</span>
			</div>
			<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-fd-secondary/60">
				<div className={`h-full rounded-full ${barColor}`} style={{ width: `${used}%` }} />
			</div>
			<p className="mt-1 text-right font-mono text-[9px] text-fd-muted-foreground/40">{used}% used</p>
		</div>
	);
}
