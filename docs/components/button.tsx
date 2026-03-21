import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "gold" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

interface ButtonProps {
	href: string;
	variant?: ButtonVariant;
	size?: ButtonSize;
	external?: boolean;
	children: ReactNode;
	className?: string;
}

const sizeStyles: Record<ButtonSize, string> = {
	sm: "px-3.5 py-1.5 text-xs gap-1.5",
	default: "px-5 py-2.5 text-sm gap-2",
	lg: "px-7 py-3 text-sm gap-2",
};

const variantStyles: Record<ButtonVariant, string> = {
	gold: [
		"kavach-btn-gold relative overflow-hidden rounded-full font-semibold text-[#1a1000]",
		"shadow-[0_2px_8px_-2px_rgba(154,114,40,0.3),0_4px_20px_-4px_rgba(197,148,58,0.45),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.15)]",
		"hover:-translate-y-0.5 hover:shadow-[0_2px_12px_-2px_rgba(154,114,40,0.4),0_6px_28px_-4px_rgba(197,148,58,0.55),inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(0,0,0,0.15)]",
		"active:translate-y-0 active:scale-[0.98]",
		"transition-all duration-200",
	].join(" "),
	outline: [
		"rounded-full border border-fd-border bg-fd-background font-medium text-fd-foreground",
		"hover:bg-fd-accent hover:border-fd-foreground/15",
		"transition-all duration-200",
	].join(" "),
	ghost: [
		"rounded-full font-medium text-fd-muted-foreground",
		"hover:bg-fd-accent hover:text-fd-foreground",
		"transition-all duration-200",
	].join(" "),
};

export function Button({
	href,
	variant = "gold",
	size = "default",
	external,
	children,
	className,
}: ButtonProps) {
	const styles = `inline-flex items-center justify-center ${sizeStyles[size]} ${variantStyles[variant]} ${className ?? ""}`;

	return (
		<Link
			href={href}
			className={styles}
			{...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
		>
			{children}
		</Link>
	);
}
