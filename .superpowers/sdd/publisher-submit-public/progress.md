# SDD Ledger — publisher-submit-public

Plan: docs/superpowers/plans/2026-08-30-publisher-submit-public.md

- Task 1 (middleware gate removal): complete (middleware.ts gate block removed, comment added)
- Task 2 (submit page auth branch + CTA band): complete (force-dynamic + auth() + SubmitSignupBand)
- Task 3 (showcase CTA link): complete (Submit Judul btn-ghost link added)
- Task 4 (verification + bookkeeping): complete (typecheck PASS, lint PASS 0 errors/29 pre-existing warnings, test 60/60 PASS 9 files; manual checks DONE on prod deploy 4684943c: submit page+alias 200 w/ CTA band, /submit 307->submit, /publisher/books still 307->login, bukoo.id 200; task.md ticked)
