---
name: no-small-commits
description: Do not commit frequently - batch changes into large commits, only commit when user explicitly asks
type: feedback
---

Do not commit after every feature. Batch all changes and only commit when the user explicitly asks.

**Why:** Each push triggers Vercel deployments which cost money. Small frequent commits waste deployment credits.

**How to apply:** Build features locally, verify they work (build + test), but do NOT run git add/commit/push unless the user says "commit" or "push". When they do ask, squash into a single commit.
