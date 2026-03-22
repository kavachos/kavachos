import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  Terminal,
  ChevronRight,
  Shield,
  Zap,
  Globe,
  Package,
  Database,
  Users,
  Key,
  Fingerprint,
  Mail,
  Smartphone,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/button";
import { HighlightedCode } from "@/components/highlighted-code";
import { InteractiveGrid } from "@/components/interactive-grid";
import {
  HonoIcon,
  ExpressIcon,
  NextjsIcon,
  FastifyIcon,
  NuxtIcon,
  SvelteIcon,
  AstroIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "One SDK, every framework. MCP OAuth 2.1, 7 framework adapters, admin dashboard, and a zero-dependency client SDK.",
};

const FRAMEWORKS = [
  { icon: HonoIcon, name: "Hono", fn: "kavachHono()", ready: true },
  { icon: ExpressIcon, name: "Express", fn: "kavachExpress()", ready: true },
  { icon: NextjsIcon, name: "Next.js", fn: "kavachNext()", ready: true },
  { icon: FastifyIcon, name: "Fastify", fn: "kavachFastify()", ready: false },
  { icon: NuxtIcon, name: "Nuxt", fn: "kavachNuxt()", ready: false },
  {
    icon: SvelteIcon,
    name: "SvelteKit",
    fn: "kavachSvelteKit()",
    ready: false,
  },
  { icon: AstroIcon, name: "Astro", fn: "kavachAstro()", ready: false },
] as const;

const RFCS = [
  {
    id: "OAuth 2.1",
    title: "Base authorization framework",
    detail: "Token types, grant flows, security best practices",
  },
  {
    id: "RFC 9728",
    title: "Authorization server discovery",
    detail: "Well-known endpoint for MCP client auto-discovery",
  },
  {
    id: "RFC 8707",
    title: "Resource indicators",
    detail: "Audience binding to prevent token confusion attacks",
  },
  {
    id: "RFC 8414",
    title: "Server metadata",
    detail: "Standardized capability advertisement",
  },
  {
    id: "RFC 7591",
    title: "Dynamic client registration",
    detail: "MCP clients self-register without manual setup",
  },
  {
    id: "PKCE S256",
    title: "Code challenge method",
    detail: "Required for all public clients — no client secrets",
  },
] satisfies { id: string; title: string; detail: string }[];

const DASHBOARD_PAGES = [
  {
    name: "Overview",
    desc: "Active agents, recent denials, trust scores at a glance",
  },
  {
    name: "Agents",
    desc: "List, create, rotate tokens, revoke — full lifecycle",
  },
  { name: "Users", desc: "Attached agents, delegation trees, session history" },
  { name: "Permissions", desc: "Visual editor with conflict detection" },
  { name: "Audit", desc: "Filterable log with CSV/JSON export" },
  { name: "Security", desc: "Anomaly scan results and active alerts" },
  {
    name: "Compliance",
    desc: "Report generation by framework, date range, agent",
  },
  { name: "Budget", desc: "Per-agent cost usage, limits, and throttle status" },
  {
    name: "Settings",
    desc: "Tenant config, log retention, MCP server settings",
  },
] as const;

const HUMAN_AUTH_METHODS = [
  {
    icon: Mail,
    label: "Email and password",
    detail: "Argon2id hashing, configurable complexity",
    category: "password",
  },
  {
    icon: Link2,
    label: "Magic link",
    detail: "One-time token, configurable TTL",
    category: "passwordless",
  },
  {
    icon: Fingerprint,
    label: "Passkey",
    detail: "WebAuthn FIDO2, hardware-backed",
    category: "passwordless",
  },
  {
    icon: Smartphone,
    label: "TOTP 2FA",
    detail: "RFC 6238, any authenticator app",
    category: "mfa",
  },
  {
    icon: Mail,
    label: "Email OTP",
    detail: "6-digit code, 10-minute window",
    category: "mfa",
  },
  {
    icon: Key,
    label: "API keys",
    detail: "Human-issued, scoped, rotatable",
    category: "keys",
  },
  {
    icon: Shield,
    label: "SSO / SAML",
    detail: "Enterprise IdP integration",
    category: "sso",
  },
  {
    icon: Globe,
    label: "OAuth providers",
    detail:
      "9 providers: GitHub, Google, Discord, Apple, Spotify, Twitch, Microsoft, Facebook, GitLab",
    category: "oauth",
  },
] as const;

const OAUTH_PROVIDERS = [
  "GitHub",
  "Google",
  "Discord",
  "Apple",
  "Spotify",
  "Twitch",
  "Microsoft",
  "Facebook",
  "GitLab",
];

const QUICK_START = `// 1. Install
pnpm add kavachos

// 2. Initialize with your database
import { createKavach } from "kavachos";
const kavach = createKavach({ db, secret: process.env.KAVACH_SECRET });

// 3. Mount on your framework
app.use("/kavach", kavachHono(kavach));
// That's it. MCP OAuth, agent API, and dashboard all mounted.`;

const DB_BACKENDS = [
  {
    name: "SQLite",
    detail: "libsql / better-sqlite3",
    desc: "Zero-config for local dev. Works in production for single-server setups.",
  },
  {
    name: "PostgreSQL",
    detail: "drizzle-orm / postgres.js",
    desc: "Recommended for multi-tenant production deployments.",
  },
  {
    name: "MySQL",
    detail: "drizzle-orm / mysql2",
    desc: "Full compatibility with MySQL 8+ and PlanetScale.",
  },
];

export default function PlatformPage() {
  return (
    <div className="relative text-fd-foreground">
      <div className="flex flex-col lg:flex-row">
        {/* Left pane: sticky hero */}
        <div className="relative w-full border-b border-fd-border lg:sticky lg:top-[var(--nav-height)] lg:h-[calc(100vh-var(--nav-height))] lg:w-[40%] lg:overflow-hidden lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--kavach-gold-mid)]/[0.06] blur-3xl" />
          <div className="relative flex h-full flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
            <div className="relative z-10">
              <Link
                href="/products"
                className="group mb-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--kavach-gold-mid)]/25 bg-[var(--kavach-gold-mid)]/8 px-3.5 py-1 text-[11px] font-medium text-[var(--kavach-gold-deep)] transition-colors hover:bg-[var(--kavach-gold-mid)]/15 dark:text-[var(--kavach-gold-bright)]"
              >
                <Shield className="h-3 w-3" />
                Platform
                <ChevronRight className="h-3 w-3 opacity-40 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <h1 className="text-3xl font-extrabold tracking-tight text-lift sm:text-4xl xl:text-[2.75rem] xl:leading-[1.15]">
                One SDK.{" "}
                <span className="gradient-gold-text text-lift-gold">
                  Seven frameworks. Every auth method.
                </span>
              </h1>

              <p className="mt-5 max-w-sm text-[15px] font-light leading-relaxed text-fd-muted-foreground">
                Drop kavachos into any TypeScript project. MCP OAuth 2.1 server,
                seven framework adapters, admin dashboard, every human auth
                method, and a zero-dependency client SDK — one package, your
                database.
              </p>

              {/* Quick stats */}
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  { value: "7", label: "adapters" },
                  { value: "9", label: "OAuth providers" },
                  { value: "9", label: "dashboard pages" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-[var(--kavach-border-ghost)] bg-[var(--kavach-surface-low)]/40 px-3 py-2 text-center"
                  >
                    <p className="font-mono text-base font-bold text-[var(--kavach-gold-primary)]">
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-[10px] text-fd-muted-foreground/60">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button href="/docs/quickstart" variant="gold">
                  Get started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button href="/docs" variant="outline">
                  Read docs
                </Button>
              </div>

              <div className="mt-4">
                <code className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-3.5 py-2 font-mono text-xs text-fd-muted-foreground/80">
                  <Terminal className="h-3.5 w-3.5 text-[var(--kavach-gold-deep)] dark:text-[var(--kavach-gold-primary)]" />
                  pnpm add kavachos
                </code>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 z-0 overflow-hidden">
            <InteractiveGrid />
          </div>
        </div>

        {/* Right pane: scrollable sections */}
        <div className="w-full lg:w-[60%]">
          {/* Section: Quick start */}
          <div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
            <div className="mb-1 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
                Quick start
              </p>
            </div>
            <h2 className="section-heading font-heading text-xl font-bold tracking-tight text-fd-foreground">
              Three lines to a working auth server
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground/70">
              Install, initialize, mount. The adapter wires up MCP OAuth
              endpoints, the agent management API, and dashboard routing
              automatically.
            </p>
            <HighlightedCode code={QUICK_START} filename="quickstart.ts" />
          </div>

          {/* Section: Framework adapters */}
          <div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
            <div className="mb-1 flex items-center gap-2">
              <Package className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
                Framework adapters
              </p>
            </div>
            <h2 className="section-heading font-heading text-xl font-bold tracking-tight text-fd-foreground">
              Seven adapters, same API surface
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground/70">
              Every adapter mounts the same routes and exports the same
              middleware. Switch frameworks without touching your kavach config
              or rewriting auth logic.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {FRAMEWORKS.map(({ icon: Icon, name, fn, ready }) => (
                <div
                  key={name}
                  className={`lifted-card flex flex-col gap-2 rounded-xl border bg-fd-card/40 px-4 py-3 transition-colors hover:bg-fd-card/70 ${ready ? "border-[var(--kavach-gold-mid)]/20" : "border-fd-border"}`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-fd-foreground/80" />
                    <span
                      className={`font-mono text-[9px] font-semibold uppercase tracking-wider ${ready ? "text-emerald-500 dark:text-emerald-400" : "text-fd-muted-foreground/40"}`}
                    >
                      {ready ? "ready" : "soon"}
                    </span>
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-fd-foreground">
                      {name}
                    </p>
                    <p className="font-mono text-[10px] text-fd-muted-foreground/50">
                      {fn}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <HighlightedCode
              code={`// Hono
app.use("/auth/*", kavachHono(kavach));

// Express
app.use("/auth", kavachExpress(kavach));

// Next.js — catches all /api/auth/* routes
export const { GET, POST } = kavachNext(kavach);`}
              filename="adapters.ts"
            />
          </div>

          {/* Section: MCP OAuth 2.1 */}
          <div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
            <div className="mb-1 flex items-center gap-2">
              <Globe className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
                MCP OAuth 2.1
              </p>
            </div>
            <h2 className="section-heading font-heading text-xl font-bold tracking-tight text-fd-foreground">
              Full RFC compliance, no shortcuts
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground/70">
              Every RFC the MCP authorization specification references is
              implemented and tested. No custom extensions that break
              interoperability.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {RFCS.map((rfc) => (
                <div
                  key={rfc.id}
                  className="lifted-card rounded-lg border border-fd-border bg-fd-card/40 p-3 transition-colors hover:bg-fd-card/70"
                >
                  <p className="font-mono text-xs font-semibold text-[var(--kavach-gold-primary)]">
                    {rfc.id}
                  </p>
                  <p className="mt-0.5 text-[12px] font-medium text-fd-foreground/80">
                    {rfc.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-fd-muted-foreground/50">
                    {rfc.detail}
                  </p>
                </div>
              ))}
            </div>
            {/* PKCE flow visual */}
            <div className="mt-5 flex items-center gap-2 overflow-x-auto rounded-xl border border-fd-border bg-fd-muted/30 px-4 py-3">
              {[
                "Client",
                "PKCE",
                "Auth server",
                "Token",
                "MCP resource",
              ].flatMap((step, i, arr) =>
                i < arr.length - 1
                  ? [
                      <span
                        key={step}
                        className="shrink-0 rounded-md border border-fd-border bg-fd-card px-2.5 py-1.5 font-mono text-[10px] text-fd-foreground/80"
                      >
                        {step}
                      </span>,
                      <ArrowRight
                        key={`a${i}`}
                        className="h-3 w-3 shrink-0 text-[var(--kavach-gold-mid)]/60"
                      />,
                    ]
                  : [
                      <span
                        key={step}
                        className="shrink-0 rounded-md border border-fd-border bg-fd-card px-2.5 py-1.5 font-mono text-[10px] text-fd-foreground/80"
                      >
                        {step}
                      </span>,
                    ],
              )}
            </div>
          </div>

          {/* Section: Human auth — the big differentiator */}
          <div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
                Human auth
              </p>
            </div>
            <h2 className="section-heading font-heading text-xl font-bold tracking-tight text-fd-foreground">
              Every auth method. One config.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground/70">
              Most agent auth systems treat human auth as an afterthought.
              KavachOS ships with every method you'll ever need — passwordless,
              passkeys, TOTP, SAML, and nine OAuth providers — so you're not
              stitching together five separate libraries.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {HUMAN_AUTH_METHODS.map(({ icon: Icon, label, detail }) => (
                <div
                  key={label}
                  className="lifted-card flex items-start gap-3 rounded-lg border border-fd-border bg-fd-card/40 p-3.5 transition-colors hover:bg-fd-card/70"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--kavach-gold-mid)]/20 bg-[var(--kavach-gold-mid)]/5">
                    <Icon className="h-3.5 w-3.5 text-[var(--kavach-gold-primary)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-fd-foreground">
                      {label}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-fd-muted-foreground/50">
                      {detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* OAuth provider chips */}
            <div className="mt-4">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-fd-muted-foreground/50">
                OAuth providers
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OAUTH_PROVIDERS.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 rounded-md border border-[var(--kavach-gold-mid)]/15 bg-[var(--kavach-gold-mid)]/5 px-2.5 py-1 text-[11px] text-[var(--kavach-gold-primary)]"
                  >
                    <Check className="h-2.5 w-2.5" />
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Admin dashboard */}
          <div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
              Admin dashboard
            </p>
            <h2 className="section-heading font-heading text-xl font-bold tracking-tight text-fd-foreground">
              Nine pages, zero setup
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground/70">
              Embed as a React component or run standalone via CLI. Ships with
              everything from agent management to compliance report generation.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {DASHBOARD_PAGES.map((page) => (
                <div
                  key={page.name}
                  className="lifted-card flex items-start gap-2.5 rounded-lg border border-fd-border bg-fd-card/40 px-3 py-2.5 transition-colors hover:bg-fd-card/70"
                >
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--kavach-gold-mid)]" />
                  <div>
                    <span className="text-xs font-semibold text-fd-foreground">
                      {page.name}
                    </span>
                    <p className="text-[11px] leading-snug text-fd-muted-foreground/50">
                      {page.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Client SDK */}
          <div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
              Client SDK
            </p>
            <h2 className="section-heading font-heading text-xl font-bold tracking-tight text-fd-foreground">
              Zero dependencies, fully typed
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground/70">
              Works in browsers, Node.js, Deno, and Bun without polyfills. Types
              come from your server schema — no codegen step required.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "No runtime deps",
                "Browser + Node + Deno + Bun",
                "Full TypeScript types",
                "No codegen required",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--kavach-gold-mid)]/20 bg-[var(--kavach-gold-mid)]/5 px-2.5 py-1 text-[11px] text-[var(--kavach-gold-primary)]"
                >
                  <Check className="h-3 w-3" />
                  {item}
                </span>
              ))}
            </div>
            <HighlightedCode
              code={`import { createKavachClient } from "kavachos/client";

const kavach = createKavachClient({
  baseUrl: "https://api.yourapp.com/kavach",
});

// Fully typed — no codegen step
const agent = await kavach.agents.create({
  name: "billing-agent",
  permissions: ["invoices:read", "payments:write"],
});

// Token rotation built in
const token = await kavach.agents.rotateToken(agent.id);`}
              filename="client.ts"
            />
          </div>

          {/* Section: Database support */}
          <div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
            <div className="mb-1 flex items-center gap-2">
              <Database className="h-4 w-4 text-[var(--kavach-gold-primary)]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
                Database support
              </p>
            </div>
            <h2 className="section-heading font-heading text-xl font-bold tracking-tight text-fd-foreground">
              Bring your own database
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground/70">
              SQLite for local development and small deployments. Postgres or
              MySQL for production. Schema migrations run automatically on first
              boot.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {DB_BACKENDS.map((db) => (
                <div
                  key={db.name}
                  className="lifted-card rounded-xl border border-fd-border bg-fd-card/40 p-4 transition-colors hover:bg-fd-card/70"
                >
                  <p className="font-heading text-sm font-semibold text-fd-foreground">
                    {db.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-[var(--kavach-gold-primary)]">
                    {db.detail}
                  </p>
                  <p className="mt-2 text-[11px] leading-snug text-fd-muted-foreground/50">
                    {db.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-fd-border bg-fd-muted/30 px-4 py-3">
              <p className="text-[11px] text-fd-muted-foreground/60">
                Pass any Drizzle-compatible connection.{" "}
                <code className="font-mono text-[10px] text-fd-foreground/70">
                  createKavach(&#123; db, secret &#125;)
                </code>{" "}
                handles the rest — tables, indexes, and seed data on first run.
              </p>
            </div>
          </div>

          {/* Section: Multi-tenant */}
          <div className="border-b border-fd-border px-6 py-10 sm:px-10 lg:px-12">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground/70">
              Multi-tenant
            </p>
            <h2 className="section-heading font-heading text-xl font-bold tracking-tight text-fd-foreground">
              Hard tenant isolation, no leakage
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground/70">
              Every agent is scoped to a tenant at creation time. Suspend or
              activate an entire tenant in one call without touching individual
              agents.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {(["acme-corp", "buildco", "startupxyz"] as const).map(
                (tenant, i) => (
                  <div
                    key={tenant}
                    className="lifted-card rounded-xl border border-fd-border bg-fd-card/40 p-4"
                  >
                    <p className="font-mono text-[10px] text-[var(--kavach-gold-primary)]">
                      tenant/{tenant}
                    </p>
                    <div className="mt-3 space-y-1.5">
                      {Array.from({ length: 2 + i }, (_, j) => (
                        <div
                          key={j}
                          className="h-1.5 rounded-full bg-fd-border"
                          style={{ width: `${55 + j * 15}%` }}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] text-fd-muted-foreground/50">
                      {2 + i * 3} agents · isolated
                    </p>
                  </div>
                ),
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                "Per-tenant rate limits",
                "Permission templates",
                "Suspend without agent changes",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-fd-muted-foreground/70"
                >
                  <Check className="h-3 w-3 shrink-0 text-[var(--kavach-gold-mid)]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 py-10 text-center sm:px-10 lg:px-12">
            <h2 className="section-heading text-2xl font-bold tracking-tight text-lift sm:text-3xl">
              One package, full stack
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-light leading-relaxed text-fd-muted-foreground/80">
              Core, adapters, dashboard, and client SDK ship together.
              TypeScript, MIT licensed, works with your existing database.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/docs/quickstart" variant="gold" size="lg">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                href="/products/agent-identity"
                variant="outline"
                size="lg"
              >
                Agent identity
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
