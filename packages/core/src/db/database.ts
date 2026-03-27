import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema.js";

// ──────────────────────────────────────────────────────────────────────────────
// Cloudflare D1 minimal interfaces
// (avoids a hard dep on @cloudflare/workers-types)
// ──────────────────────────────────────────────────────────────────────────────

/** Minimal Cloudflare D1 interface for type compatibility */
export interface D1DatabaseBinding {
	prepare(query: string): D1PreparedStatement;
	batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
	exec(query: string): Promise<D1ExecResult>;
}
interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement;
	first<T = unknown>(colName?: string): Promise<T | null>;
	run<T = unknown>(): Promise<D1Result<T>>;
	all<T = unknown>(): Promise<D1Result<T>>;
	raw<T = unknown>(): Promise<T[]>;
}
interface D1Result<T = unknown> {
	results: T[];
	success: boolean;
	meta: Record<string, unknown>;
}
interface D1ExecResult {
	count: number;
	duration: number;
}

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
export type Database = BaseSQLiteDatabase<"sync" | "async", Record<string, unknown>, typeof schema>;

/**
 * A wider union used internally when the provider is postgres or mysql.
 * Using `unknown` with a discriminated tag keeps `any` contained to a
 * single adapter-boundary cast below.
 */
export type AnyDatabase =
	| { provider: "sqlite"; db: Database }
	| { provider: "postgres"; db: PostgresDatabase }
	| { provider: "mysql"; db: MySQLDatabase }
	| { provider: "d1"; db: D1DrizzleDatabase };

// Import types lazily so the drivers stay optional peer deps.
// biome-ignore lint/suspicious/noExplicitAny: adapter boundary - drizzle pg/mysql types are not compatible with sqlite schema
type PostgresDatabase = any;
// biome-ignore lint/suspicious/noExplicitAny: adapter boundary - drizzle pg/mysql types are not compatible with sqlite schema
type MySQLDatabase = any;
// biome-ignore lint/suspicious/noExplicitAny: adapter boundary - D1 drizzle types differ from SQLite
type D1DrizzleDatabase = any;

export type DatabaseConfig =
	| {
			provider: "sqlite" | "postgres" | "mysql";
			/** Connection URL. Required for sqlite, postgres, and mysql. */
			url: string;
			/** Skip automatic table creation on init (default: false) */
			skipMigrations?: boolean;
	  }
	| {
			provider: "d1";
			/** Cloudflare D1 binding from the Worker environment. Required when provider is "d1". */
			binding: D1DatabaseBinding;
			/** Skip automatic table creation on init (default: false) */
			skipMigrations?: boolean;
	  };

// ──────────────────────────────────────────────────────────────────────────────
// Factory
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Create a database connection.
 *
 * - **SQLite** – fully typed Drizzle ORM via `better-sqlite3` (current default).
 * - **Postgres** – Drizzle connection via `drizzle-orm/node-postgres` + `pg` (peer dep).
 * - **MySQL** – Drizzle connection via `drizzle-orm/mysql2` + `mysql2` (peer dep).
 * - **D1** – Drizzle connection via `drizzle-orm/d1` for Cloudflare Workers (peer dep).
 *
 * For Postgres, MySQL, and D1 the return value is typed as `Database` for source
 * compatibility; the underlying Drizzle instance is created against the
 * correct driver. Full pg-core / mysql-core schema typings are planned for v0.2.0.
 */
export async function createDatabase(config: DatabaseConfig): Promise<Database> {
	if (config.provider === "sqlite") {
		const BetterSqlite3 = (
			await import("better-sqlite3").catch(() => {
				throw new Error(
					'KavachOS: provider "sqlite" requires the "better-sqlite3" package. ' +
						"Install it with: npm install better-sqlite3",
				);
			})
		).default;
		const { drizzle: drizzleSqlite } = await import("drizzle-orm/better-sqlite3");

		const sqlite = new BetterSqlite3(config.url);
		sqlite.pragma("journal_mode = WAL");
		sqlite.pragma("foreign_keys = ON");
		return drizzleSqlite(sqlite, { schema }) as unknown as Database;
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
		// biome-ignore lint/suspicious/noExplicitAny: adapter boundary - cast mysql drizzle to sqlite-typed Database
		return drizzle(pool) as any as Database;
	}

	if (config.provider === "d1") {
		const { drizzle } = await import("drizzle-orm/d1");
		// biome-ignore lint/suspicious/noExplicitAny: adapter boundary - D1 drizzle types differ from SQLite
		return drizzle(config.binding as any, { schema }) as unknown as Database;
	}

	throw new Error(
		`KavachOS: unsupported database provider "${(config as DatabaseConfig).provider}". ` +
			'Valid values are "sqlite", "postgres", "mysql", "d1".',
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
	// Sync path: use createRequire for Node.js-only sync loading.
	// This function is deprecated; prefer the async createDatabase().
	// biome-ignore lint/suspicious/noExplicitAny: sync require bridge for deprecated API
	const { createRequire } = require("node:module") as any;
	const req = createRequire(import.meta.url);
	const BetterSqlite3Mod = req("better-sqlite3");
	const { drizzle: drizzleSqliteMod } = req("drizzle-orm/better-sqlite3");

	const sqlite = new BetterSqlite3Mod(config.url);
	sqlite.pragma("journal_mode = WAL");
	sqlite.pragma("foreign_keys = ON");
	return drizzleSqliteMod(sqlite, { schema }) as unknown as Database;
}
