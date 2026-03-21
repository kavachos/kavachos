import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
	return (
		<div className="group relative bg-fd-card p-6 transition-colors hover:bg-fd-accent/30">
			<div className="mb-3 inline-flex rounded-md border border-[var(--kavach-gold-mid)]/15 bg-[var(--kavach-gold-mid)]/5 p-2 transition-colors group-hover:border-[var(--kavach-gold-mid)]/30 group-hover:bg-[var(--kavach-gold-mid)]/10">
				<Icon className="h-4 w-4 text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]" />
			</div>
			<h3 className="font-heading text-sm font-semibold tracking-tight">{title}</h3>
			<p className="mt-1.5 text-[13px] font-light text-fd-muted-foreground/70 leading-relaxed">
				{description}
			</p>
		</div>
	);
}
