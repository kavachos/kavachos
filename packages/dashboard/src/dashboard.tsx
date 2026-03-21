import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { createApiClient } from "./api/client.js";
import { Layout } from "./components/layout.js";
import { AgentsPage } from "./pages/agents.js";
import { AuditPage } from "./pages/audit.js";
import { PermissionsPage } from "./pages/permissions.js";
import { SettingsPage } from "./pages/settings.js";
import type { DashboardProps, Page } from "./types.js";

// ─── Query Client (module-scoped singleton for library mode) ──────────────────

const defaultQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

// ─── Inner Dashboard (requires QueryClientProvider above) ─────────────────────

interface InnerDashboardProps {
	apiUrl: string;
}

function InnerDashboard({ apiUrl }: InnerDashboardProps) {
	const [currentPage, setCurrentPage] = useState<Page>("agents");
	const client = useMemo(() => createApiClient(apiUrl), [apiUrl]);

	function renderPage() {
		switch (currentPage) {
			case "agents":
				return <AgentsPage client={client} />;
			case "audit":
				return <AuditPage client={client} />;
			case "permissions":
				return <PermissionsPage client={client} />;
			case "settings":
				return <SettingsPage client={client} />;
		}
	}

	return (
		<Layout currentPage={currentPage} onNavigate={setCurrentPage}>
			{renderPage()}
		</Layout>
	);
}

// ─── Public Component ─────────────────────────────────────────────────────────

export function KavachDashboard({ apiUrl, theme = "dark" }: DashboardProps) {
	return (
		<div className={theme === "dark" ? "dark" : ""} data-kavachos-dashboard>
			<QueryClientProvider client={defaultQueryClient}>
				<InnerDashboard apiUrl={apiUrl} />
			</QueryClientProvider>
		</div>
	);
}
