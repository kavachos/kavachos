# KavachOS Launch Plan

**Date:** March 29, 2026
**Status:** Ready to publish

---

## Pre-launch (do before posting anywhere)

- [ ] Publish to npm: `pnpm changeset version && pnpm build && pnpm changeset publish`
- [ ] Verify `npm install kavachos` works from a clean project
- [ ] Set GitHub repo description: "Auth for AI agents and humans. Identity, permissions, delegation, audit."
- [ ] Set GitHub topics: `authentication`, `authorization`, `ai-agents`, `mcp`, `oauth2`, `typescript`, `auth`, `identity`
- [ ] Enable GitHub Discussions (Settings > Features > Discussions)
- [ ] Create OpenGraph image (1200x630, dark bg, logo + tagline)
- [ ] Add OG image to repo (Settings > Social preview)
- [ ] Create GLINR STUDIOS Discord with minimal channels
- [ ] Test the quickstart end to end on a fresh machine

## Launch day posts

### Reddit (post one per day, not all at once)

**Day 1 — r/typescript or r/node**

Title: `I built an auth library that gives AI agents their own identity`

```
Most auth libraries handle human sign-in. But when your AI agents need
scoped permissions, delegation chains, and audit trails, you're on your own.

KavachOS handles both. One library.

- Agent identity with cryptographic tokens, permission matching, delegation
- 14 human auth methods (email, passkey, TOTP, OAuth, etc.)
- MCP OAuth 2.1 server (the Model Context Protocol spec)
- 3 runtime deps, runs on Cloudflare Workers/Deno/Bun
- 1,945 passing tests

npm install kavachos

GitHub: [link]
Docs: docs.kavachos.com

Happy to answer questions. This is MIT licensed, self-hostable, no vendor lock.
```

**Day 2 — r/webdev**

Title: `Open source auth with agent identity, MCP OAuth 2.1, and 27 OAuth providers`

Shorter version of the above. Focus on the framework adapters (Next.js, Hono, Express, etc.)

**Day 3 — r/selfhosted**

Title: `Self-hosted auth server with agent permissions and audit trails`

Angle: self-host, no SaaS dependency, SQLite/Postgres, MIT licensed.

### Hacker News

**Show HN: KavachOS — Auth for AI agents and humans**

```
I've been building KavachOS, an open source auth library that handles
both human authentication and AI agent identity.

The problem: auth libraries handle human sign-in, but when you need to
give an AI agent scoped permissions (read from GitHub, deploy only with
approval), track what it did, and let it delegate to sub-agents, there's
nothing off the shelf.

KavachOS adds agent identity on top of standard auth. Cryptographic
bearer tokens, wildcard permission matching, delegation chains with
depth limits, budget policies, and an immutable audit trail.

It also ships MCP OAuth 2.1 (the Model Context Protocol authorization
spec), 14 human auth methods, 27 OAuth providers, and adapters for
10 frameworks.

Three runtime deps (drizzle-orm, jose, zod). Runs on Cloudflare Workers,
Deno, Bun, Node. 1,945 tests passing.

npm install kavachos

GitHub: [link]
Docs: docs.kavachos.com

Would love feedback, especially from anyone building agent systems.
```

### Twitter/X

```
Shipped KavachOS — open source auth for AI agents and humans.

One library for:
→ Agent identity (tokens, permissions, delegation, audit)
→ Human auth (14 methods, 27 OAuth providers)
→ MCP OAuth 2.1
→ 10 framework adapters

3 deps. Edge-compatible. 1,945 tests.

npm install kavachos

[GitHub link]
```

### Dev.to / Hashnode (longer form, post within first week)

Write a "Why I built KavachOS" post. Cover:
- The problem (agents need identity, existing libs don't do it)
- The architecture (plugin system, adapter pattern)
- Code walkthrough (agent create → authorize → audit)
- What's next

## Post-launch (first 2 weeks)

- [ ] Reply to every comment and question within 24 hours
- [ ] Monitor GitHub issues daily
- [ ] Post in relevant threads where people ask about agent auth
- [ ] Submit to:
  - awesome-typescript
  - awesome-nodejs
  - awesome-security
  - awesome-selfhosted
- [ ] Track npm download numbers weekly
- [ ] Write a second blog post based on the most common question you get

## Community setup

**GitHub Discussions** — primary support channel, enable these categories:
- Q&A (for help questions)
- Ideas (for feature requests)
- Show and Tell (for people using kavachos)
- Announcements (for releases)

**GLINR STUDIOS Discord** — secondary, link after you have 10+ real users:
```
GLINR STUDIOS
├── #announcements
├── #general
├── kavachos/
│   ├── #help
│   └── #showcase
├── [other-products]/
└── #off-topic
```

## Metrics to watch

| Metric | Week 1 target | Month 1 target |
| --- | --- | --- |
| npm weekly downloads | 50+ | 500+ |
| GitHub stars | 25+ | 200+ |
| GitHub issues opened | 5+ | 15+ |
| Discord members | skip | 20+ |

These are realistic for a well-executed launch of a niche developer tool. Don't compare to established projects.

## What not to do

- Don't post in 5 subreddits on the same day. You'll get flagged as spam.
- Don't ask friends to star the repo. Fake stars are obvious and hurt credibility.
- Don't argue with critics. Thank them, consider their point, move on.
- Don't promise features you haven't built. Ship what exists, talk about what's next.
- Don't spam Discord servers with unsolicited links.

## One-liner variations (use across platforms)

- "Auth for AI agents and humans"
- "Give your AI agents identity, permissions, and audit trails"
- "The auth library that knows agents aren't users"
- "Human auth + agent identity in one library"

## Links

- npm: https://www.npmjs.com/package/kavachos
- GitHub: https://github.com/kavachos/kavachos
- Docs: https://docs.kavachos.com
- Cloud: https://app.kavachos.com
- GLINR STUDIOS: https://glincker.com
