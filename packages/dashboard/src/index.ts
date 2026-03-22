// Main component export

export type { KavachApiClient } from "./api/client.js";
export type {
	Agent,
	AgentPermission,
	AgentStatus,
	AgentType,
	ApiResult,
	AuditLogEntry,
	AuditLogFilters,
	AuditResult,
	CreateAgentInput,
	CreateAgentResponse,
	CreatePermissionTemplateInput,
	KavachSettings,
	PaginatedAuditLogs,
	PermissionTemplate,
} from "./api/types.js";
export { ToastProvider, useToast } from "./components/toast.js";
export { KavachDashboard } from "./dashboard.js";
// Type exports for consumers
export type { DashboardProps, Page, Theme } from "./types.js";
