import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Panel */}
			<div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
					<h2 id="modal-title" className="text-base font-semibold text-white">
						{title}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
						aria-label="Close modal"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Body */}
				<div className="flex-1 overflow-auto px-6 py-5">{children}</div>

				{/* Footer */}
				{footer && (
					<div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-end gap-2">
						{footer}
					</div>
				)}
			</div>
		</div>
	);
}
