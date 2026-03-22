import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
	return (
		<footer className="relative border-t border-fd-border overflow-hidden">
			{/* Watermark logo in bottom right */}
			<div className="pointer-events-none absolute -bottom-8 -right-8 select-none opacity-[0.03] dark:opacity-[0.04]" aria-hidden="true">
				<Logo size={200} />
			</div>

			<div className="relative px-6 sm:px-10 lg:px-12">
				<div className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<Link href="/" className="flex items-center gap-2">
							<Logo size={20} />
							<span className="font-heading text-xs font-bold tracking-tight text-fd-muted-foreground">
								kavach
								<span className="font-light">OS</span>
							</span>
						</Link>
						<span className="text-[10px] text-fd-muted-foreground/40">
							&copy; {new Date().getFullYear()} MIT License
						</span>
					</div>
					<div className="flex items-center gap-5">
						<Link
							href="/docs"
							className="text-xs text-fd-muted-foreground/50 transition-colors hover:text-fd-foreground"
						>
							Docs
						</Link>
						<Link
							href="https://github.com/kavachos/kavachos"
							className="text-xs text-fd-muted-foreground/50 transition-colors hover:text-fd-foreground"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub
						</Link>
						<Link
							href="https://www.npmjs.com/package/kavachos"
							className="text-xs text-fd-muted-foreground/50 transition-colors hover:text-fd-foreground"
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
