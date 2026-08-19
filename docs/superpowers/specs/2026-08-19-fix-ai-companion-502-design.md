# Design Spec — Fix AI Companion 502 (Deprecated Model)

- **Date:** 2026-08-19
- **Status:** Draft (awaiting approval)
- **Scope:** `apps/api` (`src/routes/ai.ts`) — no mobile changes needed
- **Related work:** `mobile-feature-hardening` (2026-08-18, AI tab + `/v1/ai/chat`)

## Executive summary

Chatting with the AI Companion fails with repeated:

```
WARN  [aiCompanionService] AI chat failed, using offline fallback: [AxiosError: Request failed with status code 502]
```

The mobile app falls back to an honest offline reply, so the user never gets a
real model answer.

### Root cause (reproduced + verified 2026-08-19)

`POST /v1/ai/chat` calls `c.env.AI.run('@cf/meta/llama-3-8b-instruct', ...)`.
Cloudflare **deprecated `@cf/meta/llama-3-8b-instruct` on 2026-05-30**. Every
call now throws:

```
InferenceUpstreamError [AiError]: 5028: @cf/meta/llama-3-8b-instruct was deprecated
on 2026-05-30. See the model catalog for alternatives: https://developers.cloudflare.com/workers-ai/models/
```

The route catches it and returns `502` → mobile `aiCompanionService` catches the
AxiosError and uses the offline fallback. Reproduced locally against the remote
AI binding (exact `5028` error in `wrangler dev` logs).

The same deprecated model string is used in **all three** AI routes:
`/v1/ai/chat`, `/v1/ai/companion/summary`, `/v1/ai/summarize`.

### Fix

Swap the model to a currently-supported successor, `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
(the canonical, fast Llama-3.3 chat model on Workers AI — confirmed in the live
model catalog as of 2026-08-12 and **not** deprecated).

**Verified working** against the account's remote AI binding via local `wrangler dev`:
- `POST /v1/ai/chat` → 200, proper Indonesian reply.
- `POST /v1/ai/summarize` → 200, structured summary.

## Component specs

### 1. `apps/api/src/routes/ai.ts` — replace model in all 3 `AI.run` calls

- `@cf/meta/llama-3-8b-instruct` → `@cf/meta/llama-3.3-70b-instruct-fp8-fast` in:
  - `POST /v1/ai/chat`
  - `POST /v1/ai/companion/summary`
  - `POST /v1/ai/summarize`
- Add a short comment noting the 2026-05-30 deprecation so nobody re-introduces
  the old model id.
- No prompt, schema, or DTO changes. `AI.run(model, { messages })` signature is
  identical.

### 2. No mobile changes

`aiCompanionService` already handles 200 replies correctly; the 502 was purely a
backend model availability issue. The honest offline fallback stays as-is for
genuine network failures.

## Layout / styling tokens

None — backend-only, no UI.

## Verification plan

1. **API checks:** `npm run typecheck --workspace=@bukoo/api`, `npm run lint --workspace=@bukoo/api`, `npm run test --workspace=@bukoo/api` (ai.test.ts: 4/4, incl. the 502-when-AI-fails test which still holds).
2. **Live model verification (done):** `wrangler dev` + remote AI binding → `/v1/ai/chat` 200 (Indonesian reply), `/v1/ai/summarize` 200 (structured summary). Old model reproduced the exact `5028 deprecated` error pre-fix.
3. **Deploy:** redeploy `bukoo-api` (`npm run deploy` from `apps/api`) so production serves the fixed model; smoke `/v1/ai/chat` via `/health`-style curl with a QA token.
4. Cleanup: temp `.dev.vars`/token already removed; no DB rows touched.

## Out of scope

- Switching to a different provider or a non-Workers-AI model.
- Making the model id configurable via env (nice-to-have; keep the fix minimal).
- Mobile offline-fallback UX changes.
