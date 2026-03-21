import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<DocsLayout
			tree={source.pageTree}
			className="docs-layout"
			nav={{
				enabled: false,
			}}
			sidebar={{
				banner: (
					<div className="mb-2 border-b border-fd-border pb-3">
						<p className="text-xs font-medium text-fd-muted-foreground">
							Documentation
						</p>
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
