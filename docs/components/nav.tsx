"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Moon, Sun, Search } from "lucide-react";
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

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		setMobileOpen(false);
	}, [pathname]);

	return (
		<>
			<header className="fixed top-0 z-50 w-full border-b border-fd-border bg-fd-background/80 backdrop-blur-lg">
				<div className="flex h-[var(--nav-height)] items-center justify-between px-4 lg:px-6">
					{/* Left: Logo + Nav links */}
					<div className="flex items-center gap-6">
						<Link href="/" className="flex items-center gap-2">
							<Logo size={24} />
							<span className="font-mono text-sm font-bold tracking-tight">
								kavach
								<span className="font-light text-fd-muted-foreground">OS</span>
							</span>
						</Link>

						{/* Desktop nav links */}
						<nav className="hidden items-center gap-1 md:flex">
							<NavLink href="/docs" active={isDocsPage}>
								Docs
							</NavLink>
						</nav>
					</div>

					{/* Right: Actions */}
					<div className="flex items-center gap-2">
						{/* Search hint */}
						{isDocsPage && (
							<button
								type="button"
								className="hidden items-center gap-2 rounded-md border border-fd-border bg-fd-secondary/50 px-3 py-1.5 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent md:flex"
								onClick={() => {
									// Trigger fumadocs search
									const event = new KeyboardEvent("keydown", {
										key: "k",
										metaKey: true,
									});
									document.dispatchEvent(event);
								}}
							>
								<Search className="h-3 w-3" />
								Search docs...
								<kbd className="rounded border border-fd-border bg-fd-background px-1 text-[10px]">
									⌘K
								</kbd>
							</button>
						)}

						{/* Icon links */}
						<Link
							href="https://github.com/kavachos/kavachos"
							className="hidden rounded-md p-2 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground sm:inline-flex"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="GitHub"
						>
							<GitHubIcon className="h-4 w-4" />
						</Link>
						<Link
							href="https://www.npmjs.com/settings/kavachos/packages"
							className="hidden rounded-md p-2 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground sm:inline-flex"
							target="_blank"
							rel="noopener noreferrer"
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
								className="rounded-md p-2 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
								aria-label="Toggle theme"
							>
								{resolvedTheme === "dark" ? (
									<Sun className="h-4 w-4" />
								) : (
									<Moon className="h-4 w-4" />
								)}
							</button>
						)}

						<div className="mx-0.5 hidden h-5 w-px bg-fd-border sm:block" />

						{/* Get started CTA */}
						<Link
							href="/docs/quickstart"
							className="gradient-gold hidden items-center rounded-md px-3.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 sm:inline-flex"
						>
							Get started
						</Link>

						{/* Mobile menu */}
						<button
							type="button"
							onClick={() => setMobileOpen(!mobileOpen)}
							className="rounded-md p-2 text-fd-muted-foreground transition-colors hover:bg-fd-accent md:hidden"
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
				<div className="fixed inset-0 top-[var(--nav-height)] z-40 overflow-y-auto bg-fd-background md:hidden">
					<nav className="flex flex-col gap-1 p-4">
						<MobileNavLink href="/" active={pathname === "/"}>
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
							href="https://www.npmjs.com/package/kavachos"
							external
						>
							npm
						</MobileNavLink>
						<div className="mt-4 border-t border-fd-border pt-4">
							<Link
								href="/docs/quickstart"
								className="gradient-gold flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-white"
							>
								Get started
							</Link>
						</div>
					</nav>
				</div>
			)}
		</>
	);
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
			className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
				active
					? "text-fd-foreground font-medium"
					: "text-fd-muted-foreground hover:text-fd-foreground"
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
			className={`rounded-md px-3 py-2.5 text-sm transition-colors ${
				active
					? "bg-fd-accent text-fd-foreground font-medium"
					: "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground"
			}`}
			{...(external
				? { target: "_blank", rel: "noopener noreferrer" }
				: {})}
		>
			{children}
		</Link>
	);
}
