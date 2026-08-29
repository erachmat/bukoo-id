# SDD Ledger — web-auth-hardening (2026-08-29)

Spec: `docs/superpowers/specs/2026-08-29-web-auth-hardening-design.md`
Plan: `docs/superpowers/plans/2026-08-29-web-auth-hardening.md`

## Task 1: SDD artifacts
- [ ] 1.1 Design spec written — done as `...design.md`
- [ ] 1.2 Plan written + ledger created
- [ ] 1.3 task.md updated

## Task 2: authAttempts table + migration
- [ ] 2.1 schema.ts
- [ ] 2.2 migration generated
- [ ] 2.3 build @bukoo/db
- [ ] 2.4 local D1 migration applied

## Task 3: rate-limit.ts
- [ ] 3.1 pure core
- [ ] 3.2 D1 storage
- [ ] 3.3 policies
- [ ] 3.4 getRequestIp

## Task 4: mail dual-header
- [ ] 4.1 api mail.ts
- [ ] 4.2 web mail.ts

## Task 5: OTP actions
- [ ] 5.1 requestPasswordReset
- [ ] 5.2 verifyPasswordReset
- [ ] 5.3 signIn limiter
- [ ] 5.4 signUp/signUpPublisher limiter
- [ ] 5.5 signInWithGoogle limiter
- [ ] 5.6 authorize() block check
- [ ] 5.7 otp.ts helpers

## Task 6: forgot-password UI + errors
- [ ] 6.1 two-step page
- [ ] 6.2 error keys

## Task 7: docs/config
- [ ] 7.1 AGENTS.md
- [ ] 7.2 .env.example/.dev.vars
- [ ] 7.3 task.md

## Task 8: tests
- [ ] 8.1 rate-limit.test.ts
- [ ] 8.2 otp.test.ts

## Task 9: verify
- [ ] 9.1 packages/db checks
- [ ] 9.2 apps/web checks
- [ ] 9.3 apps/api checks
- [ ] 9.4 wrangler dev QA
- [ ] 9.5 deploy notes

## Task 10: bookkeeping
- [ ] 10.1 ledger + task.md
- [ ] 10.2 rotate MailChannels key (user action)