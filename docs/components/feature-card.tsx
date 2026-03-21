import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
	return (
		<div className="group rounded-lg border border-fd-border bg-fd-card p-6 transition-colors hover:border-[var(--kavach-gold-mid)]/40">
			<div className="mb-3 inline-flex rounded-md border border-[var(--kavach-gold-mid)]/20 bg-[var(--kavach-gold-mid)]/10 p-2">
				<Icon className="h-5 w-5 text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]" />
			</div>
			<h3 className="text-sm font-semibold">{title}</h3>
			<p className="mt-1.5 text-sm text-fd-muted-foreground leading-relaxed">{description}</p>
		</div>
	);
}
