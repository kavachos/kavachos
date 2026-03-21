import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
	return (
		<footer className="border-t border-fd-border bg-fd-card/50">
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<Link href="/" className="flex items-center gap-2.5">
							<Logo size={24} />
							<span className="font-mono text-sm font-bold tracking-tight">
								kavach
								<span className="font-light text-fd-muted-foreground">OS</span>
							</span>
						</Link>
						<p className="mt-2 max-w-xs text-sm text-fd-muted-foreground">
							Auth for humans and AI agents. Open source, TypeScript, zero framework lock-in.
						</p>
					</div>

					<div className="flex gap-16">
						<div>
							<h4 className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
								Product
							</h4>
							<ul className="mt-3 space-y-2">
								<li>
									<Link
										href="/docs"
										className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
									>
										Documentation
									</Link>
								</li>
								<li>
									<Link
										href="/docs/quickstart"
										className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
									>
										Quickstart
									</Link>
								</li>
								<li>
									<Link
										href="/docs/mcp"
										className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
									>
										MCP OAuth
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
								Community
							</h4>
							<ul className="mt-3 space-y-2">
								<li>
									<Link
										href="https://github.com/kavachos/kavachos"
										className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
										target="_blank"
										rel="noopener noreferrer"
									>
										GitHub
									</Link>
								</li>
								<li>
									<Link
										href="https://www.npmjs.com/package/@kavachos/core"
										className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
										target="_blank"
										rel="noopener noreferrer"
									>
										npm
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="mt-8 border-t border-fd-border pt-6">
					<p className="text-xs text-fd-muted-foreground">
						&copy; {new Date().getFullYear()} KavachOS. MIT License.
					</p>
				</div>
			</div>
		</footer>
	);
}
