"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Moon, Sun, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Logo } from "./logo";

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
							<NavLink
								href="https://github.com/kavachos/kavachos"
								external
							>
								GitHub
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
							href="https://www.npmjs.com/package/@kavachos/core"
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
