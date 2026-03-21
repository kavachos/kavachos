"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Moon, Sun, Search, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Logo } from "./logo";

function NpmIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
			<path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
		</svg>
	);
}

function GitHubIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
			<path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
		</svg>
	);
}

export function Nav() {
	const pathname = usePathname();
	const { resolvedTheme, setTheme } = useTheme();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const isDocsPage = pathname.startsWith("/docs");
	const isHome = pathname === "/";

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		setMobileOpen(false);
	}, [pathname]);

	// Nav is shown on all pages for consistent UX

	return (
		<>
			<header className="fixed top-0 z-50 w-full border-b border-neutral-200/60 bg-white/70 backdrop-blur-xl dark:border-white/[0.06] dark:bg-neutral-950/70">
				<div className="mx-auto flex h-[var(--nav-height)] items-center justify-between px-5 lg:px-8">
					{/* Left: Logo + Nav links */}
					<div className="flex items-center gap-1">
						<Link
							href="/"
							className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-fd-accent/50"
						>
							<Logo size={22} />
							<span className="font-heading text-[13px] font-bold tracking-tight">
								kavach
								<span className="font-light text-fd-muted-foreground/60">
									OS
								</span>
							</span>
						</Link>

						<div className="mx-2 hidden h-4 w-px bg-fd-border/50 md:block" />

						{/* Desktop nav links */}
						<nav className="hidden items-center gap-0.5 md:flex">
							<NavLink href="/docs" active={isDocsPage}>
								Docs
							</NavLink>
						</nav>
					</div>

					{/* Right: Actions */}
					<div className="flex items-center gap-1">
						{/* Search trigger (docs pages) */}
						{isDocsPage && (
							<button
								type="button"
								className="hidden items-center gap-2 rounded-lg border border-fd-border/40 bg-fd-secondary/20 px-3 py-1.5 text-xs text-fd-muted-foreground/50 transition-all hover:border-fd-border/60 hover:bg-fd-accent/50 hover:text-fd-muted-foreground md:flex"
								onClick={() => {
									document.dispatchEvent(
										new KeyboardEvent("keydown", {
											key: "k",
											metaKey: true,
										}),
									);
								}}
							>
								<Search className="h-3 w-3" />
								Search docs...
								<kbd className="rounded border border-fd-border/30 bg-fd-background/60 px-1.5 py-0.5 font-mono text-[9px] text-fd-muted-foreground/30">
									⌘K
								</kbd>
							</button>
						)}

						{/* Icon links */}
						<Link
							href="https://github.com/kavachos/kavachos"
							target="_blank"
							rel="noopener noreferrer"
							className="hidden rounded-lg p-2 text-fd-muted-foreground/50 transition-all hover:bg-fd-accent/50 hover:text-fd-foreground sm:block"
							aria-label="GitHub"
						>
							<GitHubIcon className="h-4 w-4" />
						</Link>
						<Link
							href="https://www.npmjs.com/package/kavachos"
							target="_blank"
							rel="noopener noreferrer"
							className="hidden rounded-lg p-2 text-fd-muted-foreground/50 transition-all hover:bg-fd-accent/50 hover:text-fd-foreground sm:block"
							aria-label="npm"
						>
							<NpmIcon className="h-4 w-4" />
						</Link>

						{/* Theme toggle */}
						{mounted && (
							<button
								type="button"
								onClick={() =>
									setTheme(resolvedTheme === "dark" ? "light" : "dark")
								}
								className="rounded-lg p-2 text-fd-muted-foreground/50 transition-all hover:bg-fd-accent/50 hover:text-fd-foreground"
								aria-label="Toggle theme"
							>
								{resolvedTheme === "dark" ? (
									<Sun className="h-3.5 w-3.5" />
								) : (
									<Moon className="h-3.5 w-3.5" />
								)}
							</button>
						)}

						{/* CTA */}
						<Link
							href="/docs/quickstart"
							className="group gradient-gold hidden items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-[var(--kavach-gold-shadow)]/20 transition-all hover:shadow-md hover:shadow-[var(--kavach-gold-shadow)]/30 sm:inline-flex"
						>
							Get started
							<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
						</Link>

						{/* Mobile menu */}
						<button
							type="button"
							onClick={() => setMobileOpen(!mobileOpen)}
							className="rounded-lg p-2 text-fd-muted-foreground/50 transition-all hover:bg-fd-accent/50 md:hidden"
							aria-label="Toggle menu"
						>
							{mobileOpen ? (
								<X className="h-4 w-4" />
							) : (
								<Menu className="h-4 w-4" />
							)}
						</button>
					</div>
				</div>
			</header>

			{/* Mobile menu overlay */}
			{mobileOpen && (
				<div className="fixed inset-0 top-[var(--nav-height)] z-40 overflow-y-auto border-t border-fd-border bg-fd-background/95 backdrop-blur-xl md:hidden">
					<nav className="mx-auto flex max-w-sm flex-col gap-1 p-6">
						<MobileNavLink href="/" active={isHome}>
							Home
						</MobileNavLink>
						<MobileNavLink href="/docs" active={isDocsPage}>
							Documentation
						</MobileNavLink>
						<MobileNavLink
							href="https://github.com/kavachos/kavachos"
							external
						>
							GitHub
						</MobileNavLink>
						<MobileNavLink
							href="https://www.npmjs.com/settings/kavachos/packages"
							external
						>
							npm
						</MobileNavLink>
						<div className="mt-6 border-t border-fd-border pt-6">
							<Link
								href="/docs/quickstart"
								className="gradient-gold flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--kavach-gold-shadow)]/20"
							>
								Get started
								<ArrowRight className="h-4 w-4" />
							</Link>
						</div>
					</nav>
				</div>
			)}
		</>
	);
}

// Spacer to push content below the fixed nav
export function NavSpacer() {
	return <div className="h-[var(--nav-height)]" />;
}

function NavLink({
	href,
	active,
	external,
	children,
}: {
	href: string;
	active?: boolean;
	external?: boolean;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className={`relative rounded-lg px-3 py-1.5 text-[13px] transition-all ${
				active
					? "font-medium text-fd-foreground after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-4 after:rounded-full after:bg-[var(--kavach-gold-mid)]"
					: "text-fd-muted-foreground/60 hover:text-fd-foreground hover:bg-fd-accent/40"
			}`}
			{...(external
				? { target: "_blank", rel: "noopener noreferrer" }
				: {})}
		>
			{children}
		</Link>
	);
}

function MobileNavLink({
	href,
	active,
	external,
	children,
}: {
	href: string;
	active?: boolean;
	external?: boolean;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className={`rounded-xl px-4 py-3 text-sm transition-colors ${
				active
					? "bg-fd-accent/50 font-medium text-fd-foreground"
					: "text-fd-muted-foreground/70 hover:bg-fd-accent/50 hover:text-fd-foreground"
			}`}
			{...(external
				? { target: "_blank", rel: "noopener noreferrer" }
				: {})}
		>
			{children}
		</Link>
	);
}
