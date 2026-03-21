import BetterSqlite3 from "better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

// ──────────────────────────────────────────────────────────────────────────────
// Type definitions
// ──────────────────────────────────────────────────────────────────────────────

/**
 * The fully-typed SQLite Drizzle database.
 * Postgres and MySQL connections are represented as `AnyDatabase` at the
 * adapter boundary because drizzle-orm exposes separate schema builders
 * (pg-core / mysql-core) that are incompatible with the SQLite schema
 * defined in schema.ts. Full multi-dialect Drizzle schema support is
 * planned for v0.2.0.
 */
export type Database = BetterSQLite3Database<typeof schema>;

/**
 * A wider union used internally when the provider is postgres or mysql.
 * Using `unknown` with a discriminated tag keeps `any` contained to a
 * single adapter-boundary cast below.
 */
export type AnyDatabase =
	| { provider: "sqlite"; db: Database }
	| { provider: "postgres"; db: PostgresDatabase }
	| { provider: "mysql"; db: MySQLDatabase };

// Import types lazily so the drivers stay optional peer deps.
// biome-ignore lint/suspicious/noExplicitAny: adapter boundary - drizzle pg/mysql types are not compatible with sqlite schema
type PostgresDatabase = any;
// biome-ignore lint/suspicious/noExplicitAny: adapter boundary - drizzle pg/mysql types are not compatible with sqlite schema
type MySQLDatabase = any;

export interface DatabaseConfig {
	provider: "sqlite" | "postgres" | "mysql";
	url: string;
	/** Skip automatic table creation on init (default: false) */
	skipMigrations?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Factory
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Create a database connection.
 *
 * - **SQLite** – fully typed Drizzle ORM via `better-sqlite3` (current default).
 * - **Postgres** – Drizzle connection via `drizzle-orm/node-postgres` + `pg` (peer dep).
 * - **MySQL** – Drizzle connection via `drizzle-orm/mysql2` + `mysql2` (peer dep).
 *
 * For Postgres and MySQL the return value is typed as `Database` for source
 * compatibility; the underlying Drizzle instance is created against the
 * correct driver. Full pg-core / mysql-core schema typings are planned for v0.2.0.
 */
export async function createDatabase(config: DatabaseConfig): Promise<Database> {
	if (config.provider === "sqlite") {
		const sqlite = new BetterSqlite3(config.url);
		sqlite.pragma("journal_mode = WAL");
		sqlite.pragma("foreign_keys = ON");
		return drizzleSqlite(sqlite, { schema });
	}

	if (config.provider === "postgres") {
		// Dynamic import keeps `pg` an optional peer dep.
		const { Pool } = await import("pg").catch(() => {
			throw new Error(
				'KavachOS: provider "postgres" requires the "pg" package. ' +
					"Install it with: npm install pg",
			);
		});
		const { drizzle } = await import("drizzle-orm/node-postgres");

		const pool = new Pool({ connectionString: config.url });
		// Cast to Database for API compatibility; full pg schema arrives in v0.2.0.
		// biome-ignore lint/suspicious/noExplicitAny: adapter boundary - cast pg drizzle to sqlite-typed Database
		return drizzle(pool) as any as Database;
	}

	if (config.provider === "mysql") {
		// Dynamic import keeps `mysql2` an optional peer dep.
		const mysql2 = await import("mysql2/promise").catch(() => {
			throw new Error(
				'KavachOS: provider "mysql" requires the "mysql2" package. ' +
					"Install it with: npm install mysql2",
			);
		});
		const { drizzle } = await import("drizzle-orm/mysql2");

		const pool = mysql2.createPool(config.url);
		// Cast to Database for API compatibility; full mysql-core schema arrives in v0.2.0.
		// biome-ignore lint/suspicious/noExplicitAny: adapter boundary - cast pg drizzle to sqlite-typed Database
		return drizzle(pool) as any as Database;
	}

	throw new Error(
		`KavachOS: unsupported database provider "${(config as DatabaseConfig).provider}". ` +
			'Valid values are "sqlite", "postgres", "mysql".',
	);
}

/**
 * Synchronous SQLite-only factory kept for backwards compatibility with code
 * that cannot use async initialisation. Throws if a non-SQLite provider is
 * supplied.
 *
 * @deprecated Prefer the async `createDatabase()` which supports all providers.
 */
export function createDatabaseSync(config: DatabaseConfig): Database {
	if (config.provider !== "sqlite") {
		throw new Error(
			`createDatabaseSync() only supports SQLite. ` +
				`Use the async createDatabase() for provider "${config.provider}".`,
		);
	}
	const sqlite = new BetterSqlite3(config.url);
	sqlite.pragma("journal_mode = WAL");
	sqlite.pragma("foreign_keys = ON");
	return drizzleSqlite(sqlite, { schema });
}
