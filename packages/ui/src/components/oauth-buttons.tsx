import type { ReactNode } from "react";
import type { ButtonSlotProps, OAuthButtonsProps } from "../types.js";
import { cx } from "../utils.js";

function DefaultButton({ loading, children, ...rest }: ButtonSlotProps): ReactNode {
	return (
		<button {...rest} disabled={rest.disabled ?? loading}>
			{children}
		</button>
	);
}

export function OAuthButtons({
	classNames,
	components,
	providers,
	basePath = "/api/kavach",
	mode = "signin",
	layout = "list",
	disabled,
	className,
}: OAuthButtonsProps): ReactNode {
	const base = basePath.replace(/\/$/, "");
	const Btn = components?.Button ?? DefaultButton;

	if (providers.length === 0) return null;

	const handleClick = (providerId: string) => {
		const redirectUri = `${globalThis.location.origin}${base}/auth/${providerId}/callback`;
		globalThis.location.href = `${base}/auth/${providerId}?redirectUri=${encodeURIComponent(redirectUri)}`;
	};

	if (layout === "grid") {
		return (
			<div
				className={cx("kavach-oauth-buttons grid grid-cols-4 gap-2", classNames?.root ?? className)}
			>
				{providers.map((p) => (
					<Btn
						key={p.id}
						type="button"
						disabled={disabled}
						onClick={() => handleClick(p.id)}
						className={cx(
							"kavach-oauth-btn flex items-center justify-center rounded-lg border border-zinc-200 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800",
							classNames?.button,
						)}
					>
						<span
							className={cx(
								"kavach-oauth-icon flex h-5 w-5 items-center justify-center",
								classNames?.icon,
							)}
						>
							{p.icon ?? <FallbackIcon name={p.name} />}
						</span>
					</Btn>
				))}
			</div>
		);
	}

	return (
		<div className={cx("kavach-oauth-buttons flex flex-col gap-2", classNames?.root ?? className)}>
			{providers.map((p) => (
				<Btn
					key={p.id}
					type="button"
					disabled={disabled}
					onClick={() => handleClick(p.id)}
					className={cx(
						"kavach-oauth-btn flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
						classNames?.button,
					)}
				>
					<span
						className={cx(
							"kavach-oauth-icon flex h-5 w-5 items-center justify-center",
							classNames?.icon,
						)}
					>
						{p.icon ?? <FallbackIcon name={p.name} />}
					</span>
					<span className={cx("kavach-oauth-label", classNames?.label)}>
						{mode === "signin" ? `Continue with ${p.name}` : `Sign up with ${p.name}`}
					</span>
				</Btn>
			))}
		</div>
	);
}

function FallbackIcon({ name }: { name: string }): ReactNode {
	return (
		<span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
			{name.charAt(0).toUpperCase()}
		</span>
	);
}
