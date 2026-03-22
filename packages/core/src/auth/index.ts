/**
 * Human auth adapter system for KavachOS.
 *
 * Lets KavachOS plug into existing auth providers (better-auth, Auth.js,
 * Clerk, or a custom resolver) so that human user identity can be resolved
 * from an incoming HTTP request before agent operations are performed.
 *
 * @example
 * ```typescript
 * import { createKavach } from 'kavachos';
 * import { bearerAuth } from 'kavachos/auth';
 *
 * const kavach = await createKavach({
 *   database: { provider: 'sqlite', url: 'kavach.db' },
 *   auth: bearerAuth({ secret: process.env.JWT_SECRET }),
 * });
 *
 * const user = await kavach.resolveUser(request);
 * ```
 */

export type { BearerAuthOptions } from "./adapters/bearer.js";

// Built-in adapters
export { bearerAuth } from "./adapters/bearer.js";
export { customAuth } from "./adapters/custom.js";
export type { HeaderAuthOptions } from "./adapters/header.js";
export { headerAuth } from "./adapters/header.js";
export type { AuthAdapter, ResolvedUser } from "./types.js";
