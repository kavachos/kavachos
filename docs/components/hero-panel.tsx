"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Workflow } from "lucide-react";
import { CodePreview } from "./code-preview";
import { AuthFlow } from "./auth-flow";

const tabs = [
	{ id: "code", label: "Code", icon: Code2 },
	{ id: "flow", label: "How it works", icon: Workflow },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function HeroPanel() {
	const [active, setActive] = useState<TabId>("code");

	return (
		<div className="flex h-full flex-col">
			{/* Tab bar */}
			<div className="flex items-center gap-1 border-b border-fd-border px-4 py-2">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = active === tab.id;
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActive(tab.id)}
							className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
								isActive
									? "text-fd-foreground"
									: "text-fd-muted-foreground hover:text-fd-foreground"
							}`}
						>
							<Icon className="h-3.5 w-3.5" />
							{tab.label}
							{isActive && (
								<motion.div
									layoutId="hero-tab-indicator"
									className="absolute inset-0 rounded-md bg-fd-accent"
									style={{ zIndex: -1 }}
									transition={{
										type: "spring",
										stiffness: 500,
										damping: 30,
									}}
								/>
							)}
						</button>
					);
				})}
			</div>

			{/* Content */}
			<div className="relative flex-1 overflow-hidden">
				<AnimatePresence mode="wait">
					{active === "code" ? (
						<motion.div
							key="code"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 10 }}
							transition={{ duration: 0.2 }}
							className="p-4"
						>
							<CodePreview />
						</motion.div>
					) : (
						<motion.div
							key="flow"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 10 }}
							transition={{ duration: 0.2 }}
							className="p-4"
						>
							<AuthFlow />
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
