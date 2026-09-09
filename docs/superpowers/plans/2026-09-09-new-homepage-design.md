# New Bukoo Homepage Implementation Plan

> Workflow: `superpowers:subagent-driven-development`

- [x] 1. Add supplied homepage assets under `apps/web/public/homepage-assets/` and verify dimensions/paths.
- [x] 2. Create the new homepage section composition in `apps/web/src/app/(marketing)/page.tsx`, preserving dynamic rendering and existing registration destinations.
- [x] 3. Replace the hero implementation in `apps/web/src/components/marketing/Hero.tsx` with the supplied background, reference copy, and email CTA.
- [x] 4. Add the new feature/product visual sections under `apps/web/src/components/marketing/` using `Group01.png`, `Group02.png`, `Group03.png`, and the supplied icons.
- [x] 5. Restyle `apps/web/src/app/(marketing)/redesign.css` and adapt reusable pricing/FAQ/final CTA styles to the new visual system and breakpoints.
- [x] 6. Preserve and verify `Navbar.tsx` session behavior; homepage uses a minimal header while other marketing routes retain full navigation. Footer now has a homepage-specific variant.
- [x] 7. Update `FAQ.tsx` for accessible accordion state with five requested questions, all collapsed initially.
- [x] 8. Run web typecheck, lint, tests, and build; fix only regressions caused by this work.
- [x] 9. Perform desktop browser QA and update `.superpowers/sdd/new-homepage-design/progress.md` and `task.md`; mobile visual QA remains for the user.
