"use client";

import { Check, Copy, FileCode } from "lucide-react";
import { useState, useCallback } from "react";

interface CodeBlockProps {
	/** Pre-rendered HTML from Shiki (set by CodeBlockServer) */
	html?: string;
	/** Raw code string (fallback if no html) */
	code: string;
	filename?: string;
	language?: string;
}

export function CodeBlock({ html, code, filename }: CodeBlockProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		void navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [code]);

	return (
		<div className="code-block group relative mt-4 overflow-hidden rounded-xl border border-neutral-200 dark:border-[var(--kavach-border-ghost)]">
			{/* Header with filename */}
			{filename && (
				<div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-[var(--kavach-border-ghost)] dark:bg-[#0c0c0c]">
					<FileCode className="h-3 w-3 text-neutral-400 dark:text-[var(--kavach-text-muted)]" />
					<span className="font-mono text-[11px] text-neutral-500 dark:text-[var(--kavach-text-muted)]">
						{filename}
					</span>
				</div>
			)}

			{/* Copy button */}
			<button
				type="button"
				onClick={handleCopy}
				className="absolute right-3 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-400 opacity-0 transition-all hover:bg-neutral-50 hover:text-neutral-600 group-hover:opacity-100 dark:border-white/10 dark:bg-white/5 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white/70"
				aria-label="Copy code"
			>
				{copied ? (
					<Check className="h-3.5 w-3.5 text-emerald-500" />
				) : (
					<Copy className="h-3.5 w-3.5" />
				)}
			</button>

			{/* Code content */}
			{html ? (
				<div
					className="shiki-wrapper overflow-x-auto [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[12.5px] [&_pre]:leading-[1.7] [&_code]:!bg-transparent [&_.line.highlighted]:bg-[var(--kavach-gold-mid)]/[0.08] [&_.line.highlighted]:border-l-2 [&_.line.highlighted]:border-[var(--kavach-gold-primary)] [&_.line.highlighted]:pl-[14px] [&_.line.highlighted]:-ml-[16px] [&_.line.highlighted]:pr-4"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			) : (
				<pre className="overflow-x-auto bg-neutral-50 p-4 font-mono text-[12.5px] leading-[1.7] text-neutral-800 dark:bg-[#09090b] dark:text-[#e5e2e1]">
					<code>{code}</code>
				</pre>
			)}
		</div>
	);
}
