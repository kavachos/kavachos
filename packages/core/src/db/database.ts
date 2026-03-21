import BetterSqlite3 from "better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

export type Database = BetterSQLite3Database<typeof schema>;

export interface DatabaseConfig {
	provider: "sqlite";
	url: string;
}

/**
 * Create a database connection.
 * Currently supports SQLite via better-sqlite3.
 * Postgres and MySQL adapters will be added in future releases.
 */
export function createDatabase(config: DatabaseConfig): Database {
	if (config.provider === "sqlite") {
		const sqlite = new BetterSqlite3(config.url);
		sqlite.pragma("journal_mode = WAL");
		sqlite.pragma("foreign_keys = ON");
		return drizzle(sqlite, { schema });
	}

	throw new Error(`Unsupported database provider: ${config.provider}`);
}
