import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<DocsLayout
			tree={source.pageTree}
			nav={{
				enabled: false,
			}}
			sidebar={{
				banner: (
					<div className="mb-1 flex items-center justify-between px-0.5 pb-2 border-b border-fd-border">
						<span className="text-[11px] font-medium text-fd-muted-foreground uppercase tracking-widest">
							Docs
						</span>
						<span className="rounded-full bg-fd-primary/10 px-2 py-0.5 text-[10px] font-medium text-fd-primary">
							v0.0.1
						</span>
					</div>
				),
			}}
			links={[
				{
					text: "GitHub",
					url: "https://github.com/kavachos/kavachos",
					external: true,
				},
			]}
		>
			{children}
		</DocsLayout>
	);
}
