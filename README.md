# Grapevine

Ask once. See what's known, who knows it, and where to post.

Built for the [Grok Bot Community Engineering London Hackathon](https://luma.com/eveur09a) (22 Oct 2026). Source: [neomatrix369/grapevine](https://github.com/neomatrix369/grapevine). Who built it, and where: [docs/BUILT-WITH.md](docs/BUILT-WITH.md). Log: [PROGRESS.md](PROGRESS.md).

## What it does
Two tabs on localhost: **Ask once** (default: question, graph, known snippet, where to post) and **Workspace** (Ask/Announce, side menu for Library, Experts, My posts, Growth). The UI is filled from typed sample data in [`web/lib/sample-data.ts`](web/lib/sample-data.ts). Live data is the decided target (22 Oct 21:45): Grok Bot loads Slack + Discord into [Supabase](https://supabase.com) and [Cognee](https://www.cognee.ai) Cloud; Cursor wires the app per [`docs/planning/07-live-data-build.md`](docs/planning/07-live-data-build.md). Sample data remains a labelled fallback.

## Run it
```bash
cd web && pnpm install && pnpm dev
```
Localhost only ([http://localhost:3000](http://localhost:3000)). Copy [`.env.example`](.env.example) to `.env.local` (never commit it). App notes: [`web/README.md`](web/README.md). Live ingest: [`reader/live/`](reader/live/).

## Env
Copy [`.env.example`](.env.example) to `.env.local`. Names only below — never commit values. The UI still uses sample data until [`07-live-data-build.md`](docs/planning/07-live-data-build.md) is landed. Do not apply [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) until the Supabase keys are filled.

| Group | Keys | Status |
|---|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` | Public pair readable in the app. Service role and DB URL are server-only (`reader/live`). Migration not applied |
| Cognee Cloud | `COGNEE_API_KEY`, `COGNEE_BASE_URL`, `COGNEE_TENANT_ID`, `COGNEE_DATASET` (`grapevine`) | Server-only. Ingest in `reader/live`. App wiring is the 07 brief |
| LLM | `LLM_API_KEY` | Ingest only; the app does not need it |

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
- [`reader/live/`](reader/live/): read-only Slack/Discord ingest into Supabase and Cognee Cloud
- [`docs/planning/`](docs/planning/): locked interview, [`decisions.md`](docs/planning/decisions.md), [`HANDOFF.md`](docs/planning/HANDOFF.md), [`07-live-data-build.md`](docs/planning/07-live-data-build.md)
- [`mockup/`](mockup/): UI mockups ([`grapevine.html`](mockup/grapevine.html), [`screens.html`](mockup/screens.html), [`layout.md`](mockup/layout.md))
- [`kit/design/tokens.css`](kit/design/tokens.css): design tokens (copied into [`web/app/tokens.css`](web/app/tokens.css))

## Sponsors and stack
[Grok Bot](https://x.ai/bot) holds the context. [Cursor](https://cursor.com) ships the code. [Supabase](https://supabase.com) is the store and search. [Cognee](https://www.cognee.ai) Cloud is the graph. [Zero](https://zero.inc/) is CRM stretch only. App runs with [pnpm](https://pnpm.io). Agent notes: [`AGENTS.md`](AGENTS.md). Evidence folder: [`docs/evidence/grok-bot/`](docs/evidence/grok-bot/).

## Planning (historical)
The interview is finished. Files 00–07 are the decided plan, not a live status board. Start at [`HANDOFF.md`](docs/planning/HANDOFF.md).

1. [`docs/planning/00-event.md`](docs/planning/00-event.md): the event, the schedule and the judging criteria
2. [`docs/planning/01-problem.md`](docs/planning/01-problem.md): who has the problem and why it matters
3. [`docs/planning/02-ideas.md`](docs/planning/02-ideas.md): options, then pick one
4. [`docs/planning/03-users-and-demo.md`](docs/planning/03-users-and-demo.md): who it's for and the moment a judge must see
5. [`docs/planning/04-scope.md`](docs/planning/04-scope.md): must, should, could, won't, and what to cut first
6. [`docs/planning/05-ui-direction.md`](docs/planning/05-ui-direction.md): how it looks and feels
7. [`docs/planning/06-build-and-delivery.md`](docs/planning/06-build-and-delivery.md): how and where it gets built and shown
8. [`docs/planning/07-live-data-build.md`](docs/planning/07-live-data-build.md): Cursor brief to wire the app to live Supabase and Cognee Cloud
9. [`docs/planning/decisions.md`](docs/planning/decisions.md): every decision, with who made it and when

## Licence
[MIT](LICENSE) © 2026 Mani Sarkar and Arkjyoti Saha. Full text: [`LICENSE`](LICENSE).
