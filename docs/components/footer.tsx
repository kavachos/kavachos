import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t border-fd-border">
			<div className="mx-auto max-w-6xl px-6 lg:px-12">
				<div className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-6">
						<span className="font-mono text-xs font-bold tracking-tight text-fd-muted-foreground">
							kavach
							<span className="font-light">OS</span>
						</span>
						<span className="text-xs text-fd-muted-foreground">
							&copy; {new Date().getFullYear()} MIT License
						</span>
					</div>
					<div className="flex items-center gap-6">
						<Link
							href="/docs"
							className="text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground"
						>
							Docs
						</Link>
						<Link
							href="https://github.com/kavachos/kavachos"
							className="text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub
						</Link>
						<Link
							href="https://www.npmjs.com/package/kavachos"
							className="text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground"
							target="_blank"
							rel="noopener noreferrer"
						>
							npm
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
