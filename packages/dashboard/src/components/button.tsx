import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	children: ReactNode;
	loading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
	primary:
		"bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 hover:border-indigo-400",
	secondary:
		"bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-zinc-600",
	ghost:
		"bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-transparent",
	danger:
		"bg-red-950 hover:bg-red-900 text-red-400 hover:text-red-300 border border-red-900 hover:border-red-800",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
	sm: "px-2.5 py-1 text-xs",
	md: "px-3.5 py-1.5 text-sm",
	lg: "px-5 py-2.5 text-sm",
};

export function Button({
	variant = "secondary",
	size = "md",
	children,
	loading = false,
	className = "",
	disabled,
	...props
}: ButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled ?? loading}
			className={[
				"inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-100",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				VARIANT_CLASSES[variant],
				SIZE_CLASSES[size],
				className,
			].join(" ")}
			{...props}
		>
			{loading && (
				<svg
					className="w-3.5 h-3.5 animate-spin"
					fill="none"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					/>
				</svg>
			)}
			{children}
		</button>
	);
}
