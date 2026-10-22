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
- 20:30 [cursor-agent-0] Step 1 on feat/step1-scaffold verified (typecheck, lint, build, browser Ask/Announce/panels) and Gate 4 approved. PR next.
- 20:29 [cursor-agent-0] Pinned the default theme to light. Dark tokens remain under `:root.dark` and no longer follow `prefers-color-scheme`.
- 20:35 [cursor-agent-0] Split the UI into Simple (default: ask once, three answers) and Workspace (the current Ask/Announce + side menu).
- 20:42 [cursor-agent-0] browser-ui-qa Simple+Workspace: 1280 OK · 390 OK · console 0 · overflow 0 · keyboard tabs/Announce/Library/Open Workspace 6/6 · vs mockup: Simple is new, Workspace matches.
- 20:43 [cursor-agent-0] Simple now shows only question, knowledge graph, known answer, and where to post. Graph extracted for reuse in Workspace Experts.
- 20:47 [cursor-agent-0] browser-ui-qa Simple graph: 1280 OK · 390 OK · overflow 0 · Workspace Experts graph still opens.
- 20:57 [cursor-agent-0] Renamed the default tab from Simple to Ask once across UI, types, CSS and docs.
- 21:04 [cursor-agent-0] browser-ui-qa Ask once+Workspace: 1280 OK · 390 OK · overflow 0 · tabs Ask once/Workspace + Open Workspace · vs mockup: Ask once is the 20s path, Workspace matches.

## Decision log
Newest at the bottom. Slice ids in backticks.

| Date | Slice | Decision | Why |
|---|---|---|---|
| 22 Oct 2026 | `step1` | Copy `kit/design/tokens.css` into `web/app/tokens.css` instead of importing the kit file from outside the Next app | Turbopack CSS is rooted at `web/`; a copy plus a SSOT comment keeps the app buildable without a monorepo CSS alias |
| 22 Oct 2026 | `step1` | Fill the one-screen shell from typed `SAMPLE` in `web/lib/sample-data.ts`, not from `route_question` | Supabase keys are empty and the migration must not be applied yet; the demo path still has to be visible |
| 22 Oct 2026 | `step1` | Restyle shadcn `Button` with the mockup `.btn` classes | Stack requires shadcn; visual language is the paper-and-ink mockup, not the default zinc theme |
| 22 Oct 2026 | `step1` | Pin the default theme to light; keep dark tokens under `:root.dark` | Demo and projector stay paper-and-ink; OS dark mode should not restyle the app |
| 22 Oct 2026 | `simple-tab` | Name the full UI **Workspace**; land on **Ask once** (first labelled Simple) | Ask once is the 20-second judge moment; Workspace keeps the locked 9-step demo path |
| 22 Oct 2026 | `simple-tab` | Ask once shows graph + known snippet + one channel, nothing else | Graph is the distinctive punch; the snippet is the answer; posting rules belong in Workspace |
| 22 Oct 2026 | `ask-once-name` | Default tab label is **Ask once** | Simple named difficulty; Ask once is the job |
