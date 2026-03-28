import type { Metadata } from "next";
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
	Activity,
	Search,
	XCircle,
	Eye,
} from "lucide-react";
import { Button } from "@/components/button";
import { HighlightedCode } from "@/components/highlighted-code";
import { InteractiveGrid } from "@/components/interactive-grid";

export const metadata: Metadata = {
	title: "Security and compliance",
	description:
		"Behavioral trust scoring, real-time anomaly detection, four compliance frameworks, and budget controls. EU AI Act enforcement is August 2, 2026.",
};

// Days until Aug 2, 2026 from March 22, 2026
const DEADLINE = new Date("2026-08-02");
const TODAY = new Date("2026-03-22");
const DAYS_LEFT = Math.ceil((DEADLINE.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));

const TRUST_LEVELS = [
	{
		score: 90,
		level: "Elevated",
		range: "80 – 100",
		color: "bg-blue-500",
		barColor: "bg-blue-500/70",
		desc: "Full autonomy. All approval gates bypassed.",
	},
	{
		score: 70,
		level: "High",
		range: "60 – 79",
		color: "bg-emerald-500",
		barColor: "bg-emerald-500/70",
		desc: "Minimal gates. High-risk ops may require confirmation.",
	},
	{
		score: 50,
		level: "Standard",
		range: "40 – 59",
		color: "bg-yellow-500",
		barColor: "bg-yellow-500/70",
		desc: "Default starting level. Normal approval flow.",
	},
	{
		score: 30,
		level: "Low",
		range: "20 – 39",
		color: "bg-orange-500",
		barColor: "bg-orange-500/70",
		desc: "Restricted access. Most writes require human approval.",
	},
	{
		score: 10,
		level: "Untrusted",
		range: "0 – 19",
		color: "bg-red-500",
		barColor: "bg-red-500/70",
		desc: "Read-only. Automatically flagged for review.",
	},
];

const ANOMALY_TYPES = [
	{
		type: "high_frequency",
		label: "High frequency",
		severity: "medium" as const,
		description:
			"Call rate exceeds configured threshold over the rolling window. Triggers throttle before hard block.",
		example: '{ callRate: 94/min, threshold: 60/min }',
	},
	{
		type: "high_denial_rate",
		label: "High denial rate",
		severity: "high" as const,
		description:
			"Permission denials exceed 50% of recent requests. Usually means misconfigured scope or lateral movement.",
		example: '{ denialRate: 0.73, window: "1h" }',
	},
	{
		type: "off_hours",
		label: "Off-hours activity",
		severity: "low" as const,
		description:
			"Agent operating outside its declared active window. Configurable per agent.",
		example: '{ localTime: "03:42", window: "09:00-18:00" }',
	},
	{
		type: "new_resource",
		label: "New resource patterns",
		severity: "medium" as const,
		description:
			"Access to resource types not seen in the agent's recent history. Could be legitimate, could be probing.",
		example: '{ resource: "mcp:db:*", firstSeen: true }',
	},
	{
		type: "permission_escalation",
		label: "Permission escalation",
		severity: "critical" as const,
		description:
			"Repeated attempts to access scopes beyond declared permissions. Logged, blocked, and alerted.",
		example: '{ scope: "admin:*", attempts: 7 }',
	},
];

const FRAMEWORKS = [
	{
		label: "EU AI Act",
		detail: "Art. 9, 12, 14, 15, 50",
		desc: "Risk management, logging, human oversight, accuracy, transparency.",
	},
	{
		label: "NIST AI RMF",
		detail: "GOVERN · MANAGE · MAP",
		desc: "Governance policies, risk response, system categorization.",
	},
	{
		label: "SOC 2",
		detail: "CC6.1 – CC7.2",
		desc: "Logical access controls, monitoring, incident response.",
	},
	{
		label: "ISO 42001",
		detail: "A.3 · A.7 · A.8",
		desc: "AI system controls, impact assessment, supplier management.",
	},
];

const CHECKLIST = [
	"Immutable audit log per agent, per request",
	"IP allowlists per agent",
	"Per-request rate limits with configurable windows",
	"Time-of-day access windows",
	"Human approval gates (configurable by trust score)",
	"Budget caps (daily cost, monthly cost, call count)",
	"Real-time anomaly scan with 5 detection types",
	"Automated alerts on critical anomalies",
];

const PRIVILEGE_FINDINGS = [
	{
		type: "wildcard",
		label: "Wildcard permissions",
		severity: "high" as const,
		example: '"resource": "mcp:*"',
		desc: "Agent can access every resource under the MCP namespace. Narrow to the specific resources it actually uses.",
	},
	{
		type: "unused",
		label: "Unused permissions",
		severity: "medium" as const,
		example: '"action": "delete" — 0 uses in 30d',
		desc: "Permission granted but never exercised. Remove it to reduce blast radius if the agent is compromised.",
	},
	{
		type: "no_expiry",
		label: "No expiry set",
		severity: "low" as const,
		example: '"expiresAt": null',
		desc: "Long-lived tokens without expiry are common in service agents. Flag them for review on a set schedule.",
	},
	{
		type: "no_constraints",
		label: "No constraints",
		severity: "medium" as const,
		example: '"constraints": {}',
		desc: "Agent has no rate limits, time windows, or budget caps. Any constraint is better than none.",
	},
	{
		type: "overly_broad",
		label: "Overly broad actions",
		severity: "high" as const,
		example: '"actions": ["read", "write", "delete", "admin"]',
		desc: 'Agent granted every action type on a resource. The principle of least privilege applies here.',
	},
];

export default function SecurityPage() {
	return (
		<div className="relative text-fd-foreground">
			<div className="flex flex-col lg:flex-row">
				{/* Left pane: sticky hero */}
				<div className="relative w-full border-b border-fd-border lg:sticky lg:top-[var(--nav-height)] lg:h-[calc(100vh-var(--nav-height))] lg:w-[40%] lg:overflow-hidden lg:border-b-0 lg:border-r">
					<div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--kavach-gold-mid)]/[0.06] blur-3xl" />

					<div className="relative flex h-full flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
						<div className="relative z-10">
							<span className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--kavach-gold-mid)]/25 bg-[var(--kavach-gold-mid)]/8 px-3.5 py-1 text-[11px] font-medium text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-bright)]">
								<Shield className="h-3 w-3" />
								Security
							</span>

							<h1 className="text-3xl font-extrabold tracking-tight text-lift sm:text-4xl xl:text-[2.75rem] xl:leading-[1.15]">
								Know what your agents are doing.{" "}
								<span className="gradient-gold-text text-lift-gold">
									Stop what they shouldn&apos;t.
								</span>
							</h1>

							<p className="mt-5 max-w-sm text-[15px] font-light leading-relaxed text-fd-muted-foreground">
								Agents fail in subtle ways. They call things they shouldn't. They run at
								3am. They accumulate permissions nobody audited. KavachOS watches every
								request so you don't have to.
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

							{/* Compliance deadline callout */}
							<div className="mt-8 rounded-lg border border-[var(--kavach-gold-mid)]/30 bg-[var(--kavach-gold-mid)]/8 px-4 py-3">
								<div className="flex items-start gap-3">
									<Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--kavach-gold-primary)]" />
									<div>
										<p className="text-[12px] font-bold text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
											EU AI Act enforcement: August 2, 2026
										</p>
										<p className="mt-0.5 text-[11px] leading-snug text-fd-muted-foreground/70">
											<span className="font-semibold text-[var(--kavach-gold-primary)]">
												{DAYS_LEFT} days away.
											</span>{" "}
											Articles 9, 12, 14, 15, and 50 covered out of the box. Generate
											audit-ready reports in one call.
										</p>
									</div>
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
					{/* Section: Trust scoring */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<div className="mb-1 flex items-center gap-2">
							<BarChart2 className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
								Trust scoring
							</p>
						</div>
						<h2 className="section-heading mt-2 font-heading text-lg font-semibold tracking-tight text-fd-foreground">
							Five trust levels, graduated autonomy
						</h2>
						<p className="mt-2 text-sm text-fd-muted-foreground/60">
							Agents start at 0 and earn trust through successful operations. Higher
							scores unlock fewer approval gates. The score adjusts automatically based on
							behavior — no manual configuration required.
						</p>

						<div className="mt-5 overflow-hidden rounded-xl border border-fd-border bg-fd-card/40">
							{TRUST_LEVELS.map((t) => (
								<div
									key={t.level}
									className="group flex items-center gap-3 border-b border-fd-border px-4 py-2.5 last:border-b-0 transition-colors hover:bg-fd-card/70"
								>
									<div className={`h-2 w-2 shrink-0 rounded-full ${t.color}`} />
									<span className="w-20 shrink-0 text-xs font-medium text-fd-foreground">
										{t.level}
									</span>
									<span className="w-14 shrink-0 font-mono text-[10px] text-fd-muted-foreground/50">
										{t.range}
									</span>
									<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-fd-secondary/60">
										<div
											className={`h-full rounded-full ${t.barColor}`}
											style={{ width: `${t.score}%` }}
										/>
									</div>
									<span className="w-8 text-right font-mono text-[10px] text-fd-muted-foreground/50">
										{t.score}
									</span>
								</div>
							))}
						</div>

						<div className="mt-4 space-y-1.5">
							{TRUST_LEVELS.map((t) => (
								<div key={t.level} className="flex items-start gap-2">
									<div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${t.color}`} />
									<p className="text-[11px] text-fd-muted-foreground/60">
										<span className="font-medium text-fd-foreground/70">{t.level}:</span>{" "}
										{t.desc}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* Section: Anomaly detection */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<div className="mb-1 flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
								Anomaly detection
							</p>
						</div>
						<h2 className="section-heading mt-2 font-heading text-lg font-semibold tracking-tight text-fd-foreground">
							Five anomaly types, configurable thresholds
						</h2>
						<p className="mt-2 text-sm text-fd-muted-foreground/60">
							Scans run per agent over a rolling time window. Each result includes the
							anomaly type, severity, matched patterns, and the full context object.
						</p>

						<div className="mt-5 space-y-2.5">
							{ANOMALY_TYPES.map((a) => (
								<AnomalyCard key={a.type} {...a} />
							))}
						</div>

						<HighlightedCode code={`const scan = await kavach.security.scanAgent({
  agentId: "agent_abc123",
  windowMs: 3_600_000,       // 1 hour rolling window
});

scan.anomalies[0];
// {
//   type: "high_denial_rate",
//   severity: "high",
//   details: { denialRate: 0.73, window: "1h" }
// }`} filename="anomaly-scan.ts" />
					</div>

					{/* Section: Privilege analyzer */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<div className="mb-1 flex items-center gap-2">
							<Search className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
								Privilege analyzer
							</p>
						</div>
						<h2 className="section-heading mt-2 font-heading text-lg font-semibold tracking-tight text-fd-foreground">
							Find over-provisioned agents before they cause problems
						</h2>
						<p className="mt-2 text-sm text-fd-muted-foreground/60">
							Run against any agent to get a list of findings. Each finding includes a
							severity level and a remediation suggestion. Good for regular reviews and
							pre-audit cleanup.
						</p>

						<div className="mt-5 space-y-2.5">
							{PRIVILEGE_FINDINGS.map((f) => (
								<PrivilegeFinding key={f.type} {...f} />
							))}
						</div>

						<HighlightedCode code={`const findings = await kavach.security.analyzePrivileges({
  agentId: "agent_abc123",
});

findings[0];
// {
//   type: "wildcard_permissions",
//   severity: "high",
//   resource: "mcp:*",
//   suggestion: "Narrow to mcp:github:issues"
// }`} filename="privilege-check.ts" />
					</div>

					{/* Section: Compliance */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<div className="mb-1 flex items-center gap-2">
							<FileCheck className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
								Compliance
							</p>
						</div>
						<h2 className="section-heading mt-2 font-heading text-lg font-semibold tracking-tight text-fd-foreground">
							Four frameworks, one report call
						</h2>
						<p className="mt-2 text-sm text-fd-muted-foreground/60">
							Reports pull from the immutable audit log. No manual data assembly. Every
							action was already recorded at request time.
						</p>

						<div className="mt-4 flex items-start gap-3 rounded-lg border border-[var(--kavach-gold-mid)]/25 bg-[var(--kavach-gold-mid)]/8 px-4 py-3">
							<Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--kavach-gold-primary)]" />
							<div>
								<p className="text-xs font-bold text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]">
									EU AI Act enforcement begins August 2, 2026 — {DAYS_LEFT} days away
								</p>
								<p className="mt-0.5 text-[11px] text-fd-muted-foreground/60">
									Articles 9 (risk management), 12 (logging), 14 (human oversight), 15
									(accuracy), and 50 (transparency) are covered out of the box.
								</p>
							</div>
						</div>

						<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
							{FRAMEWORKS.map((f) => (
								<div
									key={f.label}
									className="lifted-card rounded-lg border border-fd-border bg-fd-card/40 p-4 transition-colors hover:bg-fd-card/70"
								>
									<div className="flex items-center gap-2">
										<Check className="h-3 w-3 shrink-0 text-emerald-500" />
										<span className="text-sm font-semibold text-fd-foreground">{f.label}</span>
									</div>
									<span className="mt-1 block font-mono text-[10px] text-[var(--kavach-gold-primary)]">
										{f.detail}
									</span>
									<p className="mt-2 text-[11px] leading-snug text-fd-muted-foreground/60">
										{f.desc}
									</p>
								</div>
							))}
						</div>

						<HighlightedCode code={`const report = await kavach.compliance.generate({
  framework: "eu-ai-act",     // or "nist-ai-rmf" | "soc2" | "iso-42001"
  agentId: "agent_abc123",
  from: new Date("2026-01-01"),
});
// Returns structured JSON + human-readable PDF export`} filename="compliance-report.ts" />
					</div>

					{/* Section: Budget controls */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<div className="mb-1 flex items-center gap-2">
							<Coins className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
								Budget controls
							</p>
						</div>
						<h2 className="section-heading mt-2 font-heading text-lg font-semibold tracking-tight text-fd-foreground">
							Cost caps and call limits per agent
						</h2>
						<p className="mt-2 text-sm text-fd-muted-foreground/60">
							Budget status is checked inline during{" "}
							<code className="font-mono text-[11px] text-fd-foreground/80">
								authorize()
							</code>{" "}
							— no polling, no separate service. Set it at agent creation and forget it.
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

					{/* Section: What you get checklist */}
					<div className="border-b border-fd-border px-6 py-8 sm:px-10 lg:px-12">
						<div className="mb-1 flex items-center gap-2">
							<Activity className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
								What you get
							</p>
						</div>
						<h2 className="section-heading mt-2 font-heading text-lg font-semibold tracking-tight text-fd-foreground">
							Everything included, nothing to configure
						</h2>
						<div className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
							{CHECKLIST.map((item) => (
								<div
									key={item}
									className="flex items-center gap-2.5 rounded-lg border border-fd-border bg-fd-card/30 px-3 py-2.5"
								>
									<Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
									<span className="text-[12px] text-fd-muted-foreground/80">{item}</span>
								</div>
							))}
						</div>
					</div>

					{/* Bottom CTA */}
					<div className="px-6 py-10 text-center sm:px-10 lg:px-12">
						<h2 className="section-heading text-2xl font-bold tracking-tight text-lift sm:text-3xl">
							Compliance before the deadline
						</h2>
						<p className="mx-auto mt-3 max-w-md text-sm font-light leading-relaxed text-fd-muted-foreground/80">
							EU AI Act enforcement starts August 2, 2026 — {DAYS_LEFT} days away.
							Generate your first audit report in one call.
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

function AnomalyCard({
	label,
	severity,
	description,
	example,
}: {
	type: string;
	label: string;
	severity: "low" | "medium" | "high" | "critical";
	description: string;
	example: string;
}) {
	const severityStyles: Record<string, string> = {
		low: "border-blue-500/20 bg-blue-500/5 text-blue-500 dark:text-blue-400",
		medium: "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400",
		high: "border-orange-500/20 bg-orange-500/5 text-orange-600 dark:text-orange-400",
		critical: "border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400",
	};
	return (
		<div className="lifted-card rounded-lg border border-fd-border bg-fd-card/40 p-4 transition-colors hover:bg-fd-card/70">
			<div className="flex items-center justify-between gap-2">
				<span className="text-xs font-semibold text-fd-foreground">{label}</span>
				<span
					className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize ${severityStyles[severity]}`}
				>
					{severity}
				</span>
			</div>
			<p className="mt-2 text-[11px] leading-snug text-fd-muted-foreground/60">{description}</p>
			<code className="mt-2 block rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 font-mono text-[10px] text-neutral-600 dark:border-[var(--kavach-border-ghost)] dark:bg-[#09090b] dark:text-[var(--kavach-text-muted)]">
				{example}
			</code>
		</div>
	);
}

function PrivilegeFinding({
	label,
	severity,
	example,
	desc,
}: {
	type: string;
	label: string;
	severity: "low" | "medium" | "high";
	example: string;
	desc: string;
}) {
	const severityStyles: Record<string, string> = {
		low: "border-blue-500/20 bg-blue-500/5 text-blue-500 dark:text-blue-400",
		medium: "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400",
		high: "border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400",
	};
	const iconStyles: Record<string, string> = {
		low: "text-blue-400",
		medium: "text-amber-400",
		high: "text-red-400",
	};
	return (
		<div className="lifted-card rounded-lg border border-fd-border bg-fd-card/40 p-4 transition-colors hover:bg-fd-card/70">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Eye className={`h-3.5 w-3.5 shrink-0 ${iconStyles[severity]}`} />
					<span className="text-xs font-semibold text-fd-foreground">{label}</span>
				</div>
				<span
					className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize ${severityStyles[severity]}`}
				>
					{severity}
				</span>
			</div>
			<p className="mt-2 text-[11px] leading-snug text-fd-muted-foreground/60">{desc}</p>
			<code className="mt-2 block rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 font-mono text-[10px] text-neutral-600 dark:border-[var(--kavach-border-ghost)] dark:bg-[#09090b] dark:text-[var(--kavach-text-muted)]">
				{example}
			</code>
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
		<div className="lifted-card rounded-lg border border-fd-border bg-fd-card/40 px-4 py-3">
			<div className="flex items-center justify-between">
				<span className="text-[11px] font-medium text-fd-foreground">{label}</span>
				<span className="font-mono text-[10px] text-fd-muted-foreground/60">{value}</span>
			</div>
			<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-fd-secondary/60">
				<div className={`h-full rounded-full ${barColor}`} style={{ width: `${used}%` }} />
			</div>
			<p className="mt-1 text-right font-mono text-[9px] text-fd-muted-foreground/40">
				{used}% used
			</p>
		</div>
	);
}
