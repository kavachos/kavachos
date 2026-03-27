"use client";

import { useState } from "react";
import { Bot, Building2, Server } from "lucide-react";

interface UseCase {
	id: string;
	label: string;
	icon: typeof Bot;
	points: string[];
}

const USE_CASES: UseCase[] = [
	{
		id: "agents",
		label: "AI agents",
		icon: Bot,
		points: [
			"Every agent gets a cryptographic bearer token, shown once, rotatable on demand.",
			"Wildcard permissions scope what each agent can access down to individual MCP resources.",
			"Delegation chains let an orchestrator pass a strict subset of permissions to sub-agents.",
			"Full audit trail records every authorize() call with agent ID, action, resource, and outcome.",
		],
	},
	{
		id: "b2b",
		label: "B2B SaaS",
		icon: Building2,
		points: [
			"Multi-tenant by default. Isolate agents and permissions per organization.",
			"14 human auth methods: email/password, OAuth, passkeys, magic links, TOTP, and more.",
			"GDPR data export and deletion built in. EU AI Act audit requirements covered.",
			"Works alongside Clerk, Auth0, or any existing auth provider. No rip-and-replace.",
		],
	},
	{
		id: "mcp",
		label: "MCP servers",
		icon: Server,
		points: [
			"Full OAuth 2.1 authorization server with PKCE S256, compliant with RFC 9728, 8707, and 7591.",
			"Dynamic client registration so new MCP clients can onboard without manual setup.",
			"Resource indicators let you scope tokens to specific MCP server endpoints.",
			"Drop-in Hono adapter gets your MCP server from zero auth to fully authorized in under 50 lines.",
		],
	},
];

export function UseCaseTabs() {
	const [active, setActive] = useState("agents");
	const current = USE_CASES.find((u) => u.id === active) ?? USE_CASES[0];

	return (
		<div>
			{/* Tab buttons */}
			<div className="flex gap-1 rounded-xl border border-fd-border bg-fd-secondary/30 p-1">
				{USE_CASES.map((useCase) => {
					const Icon = useCase.icon;
					const isActive = active === useCase.id;
					return (
						<button
							key={useCase.id}
							type="button"
							onClick={() => setActive(useCase.id)}
							className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
								isActive
									? "bg-fd-card text-fd-foreground shadow-sm"
									: "text-fd-muted-foreground hover:text-fd-foreground"
							}`}
						>
							<Icon className="h-4 w-4 shrink-0" />
							<span className="hidden sm:inline">{useCase.label}</span>
						</button>
					);
				})}
			</div>

			{/* Content */}
			<ul className="mt-6 space-y-4">
				{current.points.map((point) => (
					<li key={point} className="flex gap-3 text-[14px] leading-relaxed text-fd-muted-foreground">
						<span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--kavach-gold-mid)]" />
						{point}
					</li>
				))}
			</ul>
		</div>
	);
}
