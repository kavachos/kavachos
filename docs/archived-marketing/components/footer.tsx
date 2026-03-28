import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
	return (
		<footer className="relative overflow-hidden border-t border-[var(--kavach-border-ghost)] bg-[var(--kavach-surface-lowest)]">
			{/* Watermark logo in bottom right */}
			<div className="pointer-events-none absolute -bottom-8 -right-8 select-none opacity-[0.03] dark:opacity-[0.04]" aria-hidden="true">
				<Logo size={200} />
			</div>

			<div className="relative px-6 sm:px-10 lg:px-12">
				<div className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<Link href="/" className="flex items-center gap-2">
							<Logo size={20} />
							<span className="font-heading text-xs font-bold tracking-tight text-[var(--kavach-text)]">
								kavach
								<span className="font-light">OS</span>
							</span>
						</Link>
						<span className="ghost-border rounded-full px-2 py-0.5 text-[10px] text-[var(--kavach-text-muted)]">
							&copy; {new Date().getFullYear()} MIT License
						</span>
					</div>
					<div className="flex items-center gap-8">
						<Link
							href="/docs"
							className="text-xs text-[var(--kavach-text-muted)] transition-colors hover:text-[var(--kavach-gold-primary)]"
						>
							Docs
						</Link>
						<Link
							href="https://github.com/kavachos/kavachos"
							className="text-xs text-[var(--kavach-text-muted)] transition-colors hover:text-[var(--kavach-gold-primary)]"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub
						</Link>
						<Link
							href="https://www.npmjs.com/package/kavachos"
							className="text-xs text-[var(--kavach-text-muted)] transition-colors hover:text-[var(--kavach-gold-primary)]"
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
