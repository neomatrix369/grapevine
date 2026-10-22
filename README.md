# Grapevine

Ask once. See what's known, who knows it, and where to post.

Built for the [Grok Bot Community Engineering London Hackathon](https://luma.com/eveur09a) (22 Oct 2026). Source: [neomatrix369/grapevine](https://github.com/neomatrix369/grapevine). Who built it, and where: [docs/BUILT-WITH.md](docs/BUILT-WITH.md). Log: [PROGRESS.md](PROGRESS.md). Licence: [MIT](LICENSE).

## What it does
Two tabs on localhost: **Ask once** (default: question, graph, known snippet, where to post) and **Workspace** (Ask/Announce, side menu for Library, Experts, My posts, Growth). The UI is filled from typed sample data in [`web/lib/sample-data.ts`](web/lib/sample-data.ts). Hybrid search, Cognee, and community ingest are decided, not running yet.

## Run it
```bash
cd web && pnpm install && pnpm dev
```
Localhost only ([http://localhost:3000](http://localhost:3000)). Copy [`.env.example`](.env.example) to `.env.local` (never commit it). Do not apply [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) until keys are filled. App notes: [`web/README.md`](web/README.md).

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
- [`web/`](web/): [Next.js](https://nextjs.org) app (App Router, [TypeScript](https://www.typescriptlang.org), [Tailwind](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com))
- [`supabase/migrations/`](supabase/migrations/): drafted schema; not applied
- [`docs/planning/`](docs/planning/): locked interview, [`decisions.md`](docs/planning/decisions.md) and [`HANDOFF.md`](docs/planning/HANDOFF.md)
- [`mockup/`](mockup/): UI mockups ([`grapevine.html`](mockup/grapevine.html), [`screens.html`](mockup/screens.html), [`layout.md`](mockup/layout.md))
- [`kit/design/tokens.css`](kit/design/tokens.css): design tokens (copied into [`web/app/tokens.css`](web/app/tokens.css))

## Sponsors and stack
[Grok Bot](https://x.ai/bot) holds the context. [Cursor](https://cursor.com) ships the code. [Supabase](https://supabase.com) is the decided store and search (schema drafted, not applied). [Cognee](https://www.cognee.ai) is the decided graph (caption on a static SVG). [Zero](https://zero.inc/) is CRM stretch only. App runs with [pnpm](https://pnpm.io). Agent notes: [`AGENTS.md`](AGENTS.md). Evidence folder: [`docs/evidence/grok-bot/`](docs/evidence/grok-bot/).

## Planning (historical)
The interview is finished. Files 00–06 are the decided plan, not a live status board. Start at [`HANDOFF.md`](docs/planning/HANDOFF.md).

1. [`docs/planning/00-event.md`](docs/planning/00-event.md): the event, the schedule and the judging criteria
2. [`docs/planning/01-problem.md`](docs/planning/01-problem.md): who has the problem and why it matters
3. [`docs/planning/02-ideas.md`](docs/planning/02-ideas.md): options, then pick one
4. [`docs/planning/03-users-and-demo.md`](docs/planning/03-users-and-demo.md): who it's for and the moment a judge must see
5. [`docs/planning/04-scope.md`](docs/planning/04-scope.md): must, should, could, won't, and what to cut first
6. [`docs/planning/05-ui-direction.md`](docs/planning/05-ui-direction.md): how it looks and feels
7. [`docs/planning/06-build-and-delivery.md`](docs/planning/06-build-and-delivery.md): how and where it gets built and shown
8. [`docs/planning/decisions.md`](docs/planning/decisions.md): every decision, with who made it and when
