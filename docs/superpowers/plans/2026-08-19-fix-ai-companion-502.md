# Implementation Plan: Fix AI Companion 502 (Deprecated Model)

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-fix-ai-companion-502-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/api` (apps/api)
**Ledger**: `.superpowers/sdd/fix-ai-companion-502/progress.md`

---

## Task 1 — `apps/api/src/routes/ai.ts`: swap deprecated model in all 3 `AI.run` calls

- [x] `@cf/meta/llama-3-8b-instruct` → `@cf/meta/llama-3.3-70b-instruct-fp8-fast` in:
  - `POST /v1/ai/chat`
  - `POST /v1/ai/companion/summary`
  - `POST /v1/ai/summarize`
- [x] Add a short comment noting the 2026-05-30 deprecation.
- [x] No prompt/schema/DTO changes — `AI.run(model, { messages })` signature identical.

## Task 2 — Verification

- [x] `npm run typecheck --workspace=@bukoo/api && npm run lint --workspace=@bukoo/api && npm run test --workspace=@bukoo/api` (ai.test.ts 4/4, incl. the 502-on-AI-failure test which still holds).
- [x] Live model verification against remote AI binding via `wrangler dev`: `/v1/ai/chat` → 200 (Indonesian reply), `/v1/ai/summarize` → 200 (structured summary). Pre-fix: exact `5028 @cf/meta/llama-3-8b-instruct was deprecated on 2026-05-30` error reproduced.
- [x] Cleanup: temp `.dev.vars` + `/tmp` token removed; no DB rows touched.
- [ ] **Deploy** `bukoo-api` (`npm run deploy` from `apps/api`) + smoke `/v1/ai/chat` 200 on prod.
- [ ] Update ledger + root `task.md`.

## Files touched
- `apps/api/src/routes/ai.ts`
