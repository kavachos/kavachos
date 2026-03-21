import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<DocsLayout
			tree={source.pageTree}
			nav={{
				title: (
					<span className="font-mono font-bold tracking-tight">
						<span className="gradient-gold-text">kavach</span>
						<span className="text-fd-muted-foreground font-light">OS</span>
					</span>
				),
				url: "/",
			}}
			links={[
				{
					text: "GitHub",
					url: "https://github.com/kavachos/kavachos",
					external: true,
				},
				{
					text: "npm",
					url: "https://www.npmjs.com/package/@kavachos/core",
					external: true,
				},
			]}
		>
			{children}
		</DocsLayout>
	);
}
