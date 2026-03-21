import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
	return (
		<div className="group bg-fd-card p-6 transition-colors hover:bg-fd-accent/50">
			<div className="mb-3 inline-flex rounded-md border border-[var(--kavach-gold-mid)]/20 bg-[var(--kavach-gold-mid)]/10 p-2 transition-colors group-hover:border-[var(--kavach-gold-mid)]/40">
				<Icon className="h-4 w-4 text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]" />
			</div>
			<h3 className="text-sm font-semibold">{title}</h3>
			<p className="mt-1.5 text-sm text-fd-muted-foreground leading-relaxed">
				{description}
			</p>
		</div>
	);
}
