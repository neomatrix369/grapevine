# Grapevine

Ask once. See what's known, who knows it, and where to post.

Who built it, and where: [docs/BUILT-WITH.md](docs/BUILT-WITH.md).

## What it does
Two tabs on localhost: **Ask once** (default: question, graph, known snippet, where to post) and **Workspace** (Ask/Announce, side menu for Library, Experts, My posts, Growth). The UI is filled from typed sample data in `web/lib/sample-data.ts`. Hybrid search, Cognee, and community ingest are decided, not running yet.

## Run it
```bash
cd web && pnpm install && pnpm dev
```
Localhost only (http://localhost:3000). Copy `.env.example` to `.env.local` (never commit it). Do not apply `supabase/migrations/0001_init.sql` until keys are filled.

## Commands
Quick reference. Run from `web/`. Localhost demo only.

### One-off
- `install` (`pnpm install`) - Install app dependencies

### Regular
- `dev` (`pnpm dev`) - Run the localhost demo
- `build` (`pnpm build`) - Production build check
- `start` (`pnpm start`) - Serve the production build locally
- `lint` (`pnpm lint`) - Lint the app
- `typecheck` (`pnpm typecheck`) - TypeScript noEmit check

## Layout
- `web/`: Next.js app (App Router, TypeScript, Tailwind, shadcn)
- `supabase/migrations/`: drafted schema; not applied
- `docs/planning/`: locked interview, `decisions.md` and `HANDOFF.md`
- `mockup/`: UI mockups and rendered screens (`mockup/screens/`)
- `kit/design/tokens.css`: design tokens (copied into `web/app/tokens.css`)

## Planning (historical)
The interview is finished. Files 00–06 are the decided plan, not a live status board.

1. `docs/planning/00-event.md`: the event, the schedule and the judging criteria
2. `docs/planning/01-problem.md`: who has the problem and why it matters
3. `docs/planning/02-ideas.md`: options, then pick one
4. `docs/planning/03-users-and-demo.md`: who it's for and the moment a judge must see
5. `docs/planning/04-scope.md`: must, should, could, won't, and what to cut first
6. `docs/planning/05-ui-direction.md`: how it looks and feels
7. `docs/planning/06-build-and-delivery.md`: how and where it gets built and shown
8. `docs/planning/decisions.md`: every decision, with who made it and when
