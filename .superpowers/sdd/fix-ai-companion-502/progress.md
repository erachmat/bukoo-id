# SDD Ledger — Fix AI Companion 502 (Deprecated Model)

Plan: `docs/superpowers/plans/2026-08-19-fix-ai-companion-502.md`
Spec: `docs/superpowers/specs/2026-08-19-fix-ai-companion-502-design.md`
Started: 2026-08-19 · Mode: subagent-driven-development

## Progress

- **Task 1 (model swap)**: complete — `@cf/meta/llama-3-8b-instruct` → `@cf/meta/llama-3.3-70b-instruct-fp8-fast` in all 3 `AI.run` calls (`/v1/ai/chat`, `/v1/ai/companion/summary`, `/v1/ai/summarize`) with a deprecation comment. No prompt/schema/DTO changes. ✅
- **Task 2 (verification)**: complete —
  - API: typecheck ✅, lint 0 errors (4 pre-existing console warnings, incl. 2 in ai.ts), vitest 8/8 ✅.
  - **Live model verification** against the account's remote AI binding via `wrangler dev`: `/v1/ai/chat` → 200 (Indonesian reply), `/v1/ai/summarize` → 200 (structured summary). Pre-fix reproduced the exact error: `5028: @cf/meta/llama-3-8b-instruct was deprecated on 2026-05-30`.
  - Cleanup: temp `.dev.vars` + `/tmp` token removed; no DB rows touched. ✅
  - **Deploy pending**: `bukoo-api` needs `npm run deploy` from `apps/api` for production.

## Root cause (verified 2026-08-19)

`@cf/meta/llama-3-8b-instruct` was **deprecated by Cloudflare on 2026-05-30**.
Every `AI.run('@cf/meta/llama-3-8b-instruct', ...)` throws
`InferenceUpstreamError [AiError] 5028` → route returns 502 → mobile
`aiCompanionService` falls back to its offline reply. The same dead model id was
used in all three AI routes.

## Key notes / decisions
- Replacement `@cf/meta/llama-3.3-70b-instruct-fp8-fast` is the canonical fast Llama-3.3 chat model on Workers AI — confirmed **not deprecated** in the live model catalog (updated 2026-08-12).
- Mobile needs no change: it already handles 200 replies; the honest offline fallback stays for genuine network failures.
- Deprecation comment added in `ai.ts` so the old model id isn't re-introduced.

## Commits
- (pending)
