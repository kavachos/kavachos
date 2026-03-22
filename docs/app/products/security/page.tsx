import type { Metadata } from "next";
import Link from "next/link";
import {
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

export const metadata: Metadata = {
	title: "Security and compliance",
	description:
		"Anomaly detection, trust scoring, compliance reports, and budget controls. Built for the EU AI Act deadline.",
};

interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	items: string[];
}

function FeatureCard({ icon, title, items }: FeatureCardProps) {
	return (
		<div className="group rounded-xl border border-fd-border bg-fd-card/40 p-6 transition-colors hover:bg-fd-card/70">
			<div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-fd-border bg-fd-secondary/50 text-[var(--kavach-gold-primary)]">
				{icon}
			</div>
			<h3 className="font-heading text-base font-semibold tracking-tight text-fd-foreground">
				{title}
			</h3>
			<ul className="mt-3 space-y-2">
				{items.map((item) => (
					<li key={item} className="flex items-start gap-2 text-sm text-fd-muted-foreground/70">
						<Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--kavach-gold-mid)]" />
						<span>{item}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

interface ComplianceRowProps {
	framework: string;
	controls: string;
	description: string;
}

function ComplianceRow({ framework, controls, description }: ComplianceRowProps) {
	return (
		<div className="flex items-start gap-4 border-b border-fd-border py-4 last:border-0">
			<div className="w-32 shrink-0">
				<span className="font-mono text-xs font-semibold text-[var(--kavach-gold-primary)]">
					{framework}
				</span>
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-fd-foreground">{controls}</p>
				<p className="mt-0.5 text-xs text-fd-muted-foreground/60">{description}</p>
			</div>
			<div className="shrink-0">
				<span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
					<Check className="h-2.5 w-2.5" />
					Covered
				</span>
			</div>
		</div>
	);
}

interface TrustLevelProps {
	level: string;
	range: string;
	description: string;
	color: string;
}

function TrustLevel({ level, range, description, color }: TrustLevelProps) {
	return (
		<div className="flex items-center gap-3 py-2.5">
			<div className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
			<div className="w-24 shrink-0">
				<span className="text-xs font-medium text-fd-foreground">{level}</span>
			</div>
			<span className="w-16 shrink-0 font-mono text-xs text-fd-muted-foreground/50">{range}</span>
			<span className="text-xs text-fd-muted-foreground/60">{description}</span>
		</div>
	);
}

export default function SecurityPage() {
	return (
		<div className="bg-fd-background text-fd-foreground">
			{/* Hero */}
			<section className="relative overflow-hidden border-b border-fd-border bg-grid pb-20 pt-20 lg:pt-28">
				<div
					className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-64 w-[600px] opacity-20 blur-3xl"
					style={{
						background:
							"radial-gradient(ellipse, var(--kavach-gold-mid) 0%, transparent 70%)",
					}}
					aria-hidden="true"
				/>
				<div className="relative mx-auto max-w-5xl px-6 lg:px-8">
					<div className="max-w-3xl">
						<p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--kavach-gold-primary)]">
							KavachOS Products
						</p>
						<h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-fd-foreground lg:text-5xl animate-fade-up">
							Security and compliance
						</h1>
						<p className="mt-4 text-lg text-fd-muted-foreground/70 leading-relaxed animate-fade-up-delay-1">
							Anomaly detection, trust scoring, compliance reports, and budget
							controls. Built for the EU AI Act deadline.
						</p>
						<div className="mt-8 flex flex-wrap gap-3 animate-fade-up-delay-2">
							<Button href="/docs" variant="gold" size="lg">
								Read docs
								<ArrowRight className="h-4 w-4" />
							</Button>
							<Button href="/docs/quickstart" variant="outline" size="lg">
								Get started
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* EU AI Act callout */}
			<section className="border-b border-[var(--kavach-gold-deep)]/30 bg-[var(--kavach-gold-deep)]/5">
				<div className="mx-auto max-w-5xl px-6 py-4 lg:px-8">
					<div className="flex items-center gap-3">
						<Clock className="h-4 w-4 shrink-0 text-[var(--kavach-gold-primary)]" />
						<p className="text-sm text-fd-foreground">
							<span className="font-semibold text-[var(--kavach-gold-primary)]">
								EU AI Act enforcement begins August 2, 2026.
							</span>{" "}
							<span className="text-fd-muted-foreground/70">
								4 months from now. KavachOS generates audit-ready compliance reports for Articles 9, 12, 14, 15, and 50.
							</span>
						</p>
					</div>
				</div>
			</section>

			{/* Feature categories */}
			<section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
				<h2 className="font-heading text-2xl font-semibold tracking-tight text-fd-foreground">
					Security features
				</h2>
				<p className="mt-2 text-sm text-fd-muted-foreground/60">
					Four layers of security on top of the core auth primitives.
				</p>
				<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<FeatureCard
						icon={<AlertTriangle className="h-4 w-4" />}
						title="Anomaly detection"
						items={[
							"5 anomaly types: high frequency, high denial rate, off-hours activity, new resource patterns, permission escalation attempts",
							"Configurable thresholds per anomaly type via environment variables",
							"Four severity levels: low, medium, high, critical",
							"Scanning runs per-agent across a rolling time window",
							"Results returned with matched patterns and context",
						]}
					/>
					<FeatureCard
						icon={<BarChart2 className="h-4 w-4" />}
						title="Trust scoring"
						items={[
							"Behavioral trust score from 0 to 100, recalculated on each check",
							"5 trust levels: untrusted, low, standard, high, elevated",
							"Score factors: success rate, agent age, anomaly count, denial patterns",
							"Graduated autonomy — higher score unlocks fewer approval gates",
							"Score history queryable for trend analysis",
						]}
					/>
					<FeatureCard
						icon={<FileCheck className="h-4 w-4" />}
						title="Compliance reports"
						items={[
							"EU AI Act: Articles 9, 12, 14, 15, 50 — human oversight and logging requirements",
							"NIST AI RMF: GOVERN, MANAGE, and MAP function coverage",
							"SOC 2: CC6.1 through CC7.2 logical access controls",
							"ISO 42001: Annexes A.3, A.7, A.8 — AI management system controls",
							"Reports include control status, evidence pointers, and identified gaps",
						]}
					/>
					<FeatureCard
						icon={<Coins className="h-4 w-4" />}
						title="Budget policies"
						items={[
							"Token cost caps per day and per month, tracked from audit logs",
							"Call count limits as a separate quota from cost limits",
							"Auto-throttle mode slows the agent; auto-revoke cuts access entirely",
							"Policies scoped per agent, per user, or per tenant",
							"Budget status checked inline during authorize() calls",
						]}
					/>
				</div>
			</section>

			{/* Trust levels visual */}
			<section className="border-t border-fd-border bg-fd-muted/20">
				<div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
					<div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
						<div>
							<h2 className="font-heading text-2xl font-semibold tracking-tight text-fd-foreground">
								Trust levels
							</h2>
							<p className="mt-2 text-sm text-fd-muted-foreground/60">
								Agents graduate through trust levels as they build a track record.
								New agents start at &ldquo;low&rdquo; and move up based on behavior.
							</p>
							<div className="mt-6 rounded-xl border border-fd-border bg-fd-card/40 px-4 py-2">
								<TrustLevel
									level="Untrusted"
									range="0 – 19"
									description="All sensitive actions require explicit approval"
									color="bg-red-500"
								/>
								<TrustLevel
									level="Low"
									range="20 – 39"
									description="Reduced rate limits, frequent approval prompts"
									color="bg-orange-500"
								/>
								<TrustLevel
									level="Standard"
									range="40 – 59"
									description="Normal operation within declared permissions"
									color="bg-yellow-500"
								/>
								<TrustLevel
									level="High"
									range="60 – 79"
									description="Elevated rate limits, fewer approval gates"
									color="bg-emerald-500"
								/>
								<TrustLevel
									level="Elevated"
									range="80 – 100"
									description="Near-autonomous within permission scope"
									color="bg-blue-500"
								/>
							</div>
						</div>

						<div>
							<h2 className="font-heading text-2xl font-semibold tracking-tight text-fd-foreground">
								Compliance coverage
							</h2>
							<p className="mt-2 text-sm text-fd-muted-foreground/60">
								One report generation call covers all four frameworks simultaneously.
							</p>
							<div className="mt-6 rounded-xl border border-fd-border bg-fd-card/40 px-4">
								<ComplianceRow
									framework="EU AI Act"
									controls="Art. 9, 12, 14, 15, 50"
									description="Risk management, logging, human oversight, transparency"
								/>
								<ComplianceRow
									framework="NIST AI RMF"
									controls="GOVERN · MANAGE · MAP"
									description="Accountability, risk treatment, context mapping"
								/>
								<ComplianceRow
									framework="SOC 2"
									controls="CC6.1 – CC7.2"
									description="Logical access controls and anomaly detection"
								/>
								<ComplianceRow
									framework="ISO 42001"
									controls="A.3 · A.7 · A.8"
									description="AI system planning, operation, and performance"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Anomaly code example */}
			<section className="border-t border-fd-border">
				<div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
					<h2 className="font-heading text-2xl font-semibold tracking-tight text-fd-foreground">
						Anomaly detection in practice
					</h2>
					<p className="mt-2 text-sm text-fd-muted-foreground/60">
						Scan any agent on demand or run scheduled checks across your fleet.
					</p>
					<pre className="mt-6 overflow-x-auto rounded-xl border border-fd-border bg-fd-muted/50 p-6 font-mono text-xs leading-relaxed text-fd-foreground/80">
						<code>{`const scan = await kavach.security.scanAgent({
  agentId: "agent_abc123",
  windowMs: 3_600_000, // last 1 hour
});

// scan.anomalies is an array of detected issues
for (const anomaly of scan.anomalies) {
  console.log(anomaly.type);     // "high_denial_rate"
  console.log(anomaly.severity); // "high"
  console.log(anomaly.details);  // { denialRate: 0.73, threshold: 0.5 }
}

// Get trust score
const trust = await kavach.security.getTrustScore({ agentId: "agent_abc123" });
console.log(trust.score);  // 34
console.log(trust.level);  // "low"

// Generate EU AI Act report
const report = await kavach.compliance.generate({
  framework: "eu-ai-act",
  agentId: "agent_abc123",
  from: new Date("2026-01-01"),
});`}</code>
					</pre>
				</div>
			</section>

			{/* Bottom CTA */}
			<section className="border-t border-fd-border bg-fd-muted/20">
				<div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
					<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="font-heading text-xl font-semibold text-fd-foreground">
								Compliance ready before the deadline
							</h2>
							<p className="mt-1 text-sm text-fd-muted-foreground/60">
								EU AI Act enforcement starts August 2, 2026. Generate your first report in one call.
							</p>
						</div>
						<div className="flex gap-3 shrink-0">
							<Button href="/docs/security" variant="gold">
								Security docs
								<ArrowRight className="h-4 w-4" />
							</Button>
							<Button href="/products/platform" variant="outline">
								Platform features
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
