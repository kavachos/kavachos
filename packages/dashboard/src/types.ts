export type Page = "overview" | "agents" | "permissions" | "audit" | "settings";

export type Theme = "light" | "dark";

export interface DashboardProps {
	apiUrl: string;
	theme?: Theme;
}
