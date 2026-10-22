# Built with

Grapevine was planned with **Grok Bot**, which holds the context, and built with **Cursor**, which ships the code, on **Supabase** and **Cognee**. Each section covers what the tool does in Grapevine, where to find it in the repo, and how to check it. Commits are tagged by who made them: `[grok-bot]`, `[cursor]` or `[mani]`, with trailer lines `Context-by:` and `Built-with:`. Every action is also logged in [`PROGRESS.md`](../PROGRESS.md).

## Grok Bot (SpaceXAI): the context holder
| What Grok Bot did | Where to see it |
|---|---|
| Ran the planning interview with Mani: one question at a time, each with a fallback answer, alternatives and a recommendation, while Mani made the calls | `docs/planning/01`–`06`; every decision is in [`decisions.md`](planning/decisions.md) with its time, who decided and why |
| Re-read the event page and matched each judging criterion to the product | [`docs/planning/00-event.md`](planning/00-event.md) |
| Designed and rendered the one-screen UI mockups (13 screens at 1280 and 390, light and dark) | `mockup/grapevine.html`, `mockup/screens/`, `mockup/contact-sheet.png` |
| Set up the repo: git, `.gitignore` with secrets ignored, `.env.example`, a private GitHub remote | the `[grok-bot]` commits |
| Wrote the build prompts that Cursor's agent runs | `.cursor-runs/` (local only) and [`docs/planning/HANDOFF.md`](planning/HANDOFF.md) |
| Reads the communities read-only as Mani: each community's rules first, then public channels, two weeks back | `data/rules.jsonl`, `data/channel-selection.json`, `data/coverage.jsonl` (counts only; message text stays out of the repo) |
| Powers the in-app **Read next** button: a Grok Bot routine reads the biggest gap in coverage | see "Read next" below |

How to check: `git log --oneline --grep '\[grok-bot\]'` and `grep '\[grok-bot\]' PROGRESS.md`.

## Cursor: the builder
Cursor's local agent ships the app on the Mac from the prompts above, following the planning docs and the rules in the repo. Step 1 lands on `feat/step1-scaffold`. How to check: `git log --oneline --grep '\[cursor\]'` and the `[cursor-agent-0]` lines in `PROGRESS.md`.

| What Cursor does | Where to see it |
|---|---|
| Next.js (App Router) + TypeScript + Tailwind + shadcn/ui app | `web/` |
| Tagged commits from the local agent | `[cursor]` subjects and `Built-with: Cursor` trailers |
| Design tokens (light default; dark opt-in via `.dark`) | `kit/design/tokens.css`, ported into the `web/` theme |
| Ask once (graph, known answer, where to post) and Workspace (Ask/Announce, side menu) | `web/` |

## Supabase: the store and search
Postgres with keyword plus meaning search (pgvector) combined in one `route_question()` hybrid RRF function, and live updates that drive the coverage view.

| What Supabase holds | Where to see it |
|---|---|
| Initial schema: channels, people, messages (generated `fts` tsvector + GIN, `embedding vector(384)`), rules, coverage, graph_nodes, graph_edges, my_posts | `supabase/migrations/0001_init.sql` |
| Hybrid keyword + meaning search | `route_question(query_text, query_embedding)` in that migration |

The Step 1 migration is **not applied yet**: Supabase keys in `.env.local` are still empty (see `.env.example`). Env is read only via `process.env`. Do not commit `.env.local`.

## Cognee: the knowledge graph
Builds the people, topics, channels and threads graph locally on the Mac; the Experts graph view reads it and is labelled "Knowledge graph by Cognee".

## Zero (stretch)
Only used if the CRM stretch goal is built.
