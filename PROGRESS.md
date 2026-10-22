# Progress log
Newest at the bottom. Tags: `[grok-bot]`, `[cursor-agent-0]`, `[mani]`. Times are BST, 22 Oct 2026.

- 18:36 [mani] Started a fresh project folder for clean planning; the earlier prep is reference only.
- 18:50 [grok-bot] Wrote the planning files (problem, ideas, users and demo, scope, UI, build and delivery) with fallback answers from the earlier plan.
- 18:58–19:34 [grok-bot] Ran the planning interview; Mani decided each answer (see docs/planning/decisions.md).
- 19:08 [mani] Locked the 9-step demo path.
- 19:17 [grok-bot] Re-read the event page and added 00-event.md with the judging criteria mapped to the product.
- 19:36 [grok-bot] Wrote HANDOFF.md; moved planning files into docs/planning/.
- 19:46 [grok-bot] Rendered 13 mockup screens of the agreed layout at 1280 and 390, light and dark.
- 19:45 [grok-bot] Set up git, .gitignore (secrets ignored) and .env.example; wrote the first Cursor build prompt.
- 19:53 [grok-bot] Created the private GitHub repo and pushed main.
- 19:58 [grok-bot] Wrote docs/BUILT-WITH.md and this log.
- 20:02 [grok-bot] Added the branch-and-PR rule for all agents (AGENTS.md, .cursor/rules/git-workflow.mdc).
- 20:05 [cursor-agent-0] Started Step 1 on feat/step1-scaffold: Next.js scaffold in web/, tokens from kit/design/tokens.css, one-screen shell. App is landing on this branch.
- 20:22 [cursor-agent-0] supabase/migrations/0001_init.sql (schema + route_question hybrid RRF) landing on this branch. Not applied; Supabase keys still empty.
- 20:15 [cursor-agent-0] Scaffolded Next.js (App Router, TypeScript, Tailwind v4, shadcn Button) in web/ with pnpm.
- 20:25 [cursor-agent-0] Ported kit/design/tokens.css into the app theme (light/dark via prefers-color-scheme) and built the one-screen shell from mockup/grapevine.html using typed sample data. `pnpm typecheck` and `pnpm build` pass. Migration not applied.
