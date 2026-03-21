export interface AgentConfig {
	/** Enable agent identity management */
	enabled: boolean;
	/** Maximum agents per user */
	maxPerUser?: number;
	/** Default permissions for new agents */
	defaultPermissions?: string[];
	/** Log all agent actions to audit trail */
	auditAll?: boolean;
	/** Default token expiry duration */
	tokenExpiry?: string;
}
