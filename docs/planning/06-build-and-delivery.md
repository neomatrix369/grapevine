# 6. Build and delivery

**Stack:**
> **Decided 19:28 (Mani, kept fallback):** Next.js, TypeScript, Tailwind and shadcn/ui; Supabase (Postgres, keyword + vector search); a force-directed graph library.

**Status (22 Oct 21:19):** Next.js stack is in `web/`. Search is SQL in an unapplied migration. The graph is a static SVG, not a force-directed library and not a Cognee job.

**Live data path (22 Oct 21:45, supersedes sample-only):**
> **Decided 21:33–21:45 (Mani):** the app shows **live** community data. Grok Bot reads Slack and Discord desktop over CDP (ports 9222/9223, loopback only, read-only, public channels, two weeks back, apps restored without the debug flag) and loads the messages into **Supabase** (`supabase/migrations/0001_init.sql`: gte-small 384-d embeddings + FTS, searched by `route_question()`). The app reads Supabase, not sample files; `web/lib/sample-data.ts` is only a fallback when Supabase is empty, and the UI labels which source is shown. **Cognee Cloud** (hosted, sponsor) replaces local Cognee 1.6.5: the ingest sends the messages to Cognee Cloud, which builds the graph behind Experts and the experts graph. Raw text stays out of git (`data/raw/` is git-ignored). Keys only in `.env.local`. Cursor brief: `docs/planning/07-live-data-build.md`.

**Where agents run:**
> **Decided 19:12 (Mani):** all local in Cursor on the Mac (see below).

**Data sources and how we read them:**
> **Decided 19:17 (Mani):** Slack and Discord desktop apps, read-only, public channels only, rules first, **two weeks back** (to save time), one busy channel held back for a live read.

**Demo from localhost or a live link:**
> **Decided 19:16 (Mani):** localhost on the Mac only (see below).

**Sponsors used and how each shows up:**
> **Decided 19:28 (Mani, kept fallback):** Supabase stores and searches everything; Cognee builds the graph offline (**changed 21:45:** Cognee Cloud builds it from the live messages); Grok Bot reads the communities and fills a gap live; Cursor builds it (tagged commits as evidence); Zero only if a prize is announced.

**Video:**
> **Decided 19:21 (Mani, length agent-recommended):** a 20 s promo (Mani, 19:22; allowed 10–30 s) then a narrated walkthrough of about 2:15 following the 9-step demo path. Total under 3 min (target 2:45 or less). It ends on the "how it was built" proof: `docs/BUILT-WITH.md` and tagged commits.

**Submission checklist owner:**
> **Decided 19:28 (Mani, kept fallback):** Mani.

---
## Where the coding agents run
> **Decided 19:12 (Mani):** all local in Cursor on the Mac. No cloud agents, so GitHub isn't needed to build.

## Sponsor proof: shown in the repo docs and the commits
> **Decided 19:15 (Mani):** the proof lives in the git repo, not just in the demo.

**Docs (in the repo)** — this is the decided proof plan, not a claim that every item already exists. Current vs decided is in `docs/BUILT-WITH.md`.
- `docs/BUILT-WITH.md`: one section per sponsor covering what it does in Grapevine, where in the code, and how to see it running.
  - **Grok Bot:** (landed) planning interview, mockups, repo setup; (decided) community ingest and a "Read next" routine.
  - **Cursor:** (landed) local agents built the `web/` app and authored `supabase/migrations/0001_init.sql`; (decided) apply that migration through the Supabase connector once keys exist. It has **not** been applied.
  - **Supabase:** (landed) schema + `route_question()` in the migration file; (decided) live coverage updates against a running project.
  - **Cognee Cloud:** (landed) graph view labelled Cognee; (decided 21:45) the ingest adds live messages to Cognee Cloud and the Experts graph reads it through the Cognee Cloud API (no local Cognee).
  - **Zero:** only if the CRM stretch is built.
- `docs/planning/`: a clean copy of these planning files, so the ideation trail is visible.
- `PROGRESS.md`: a running log where every entry is tagged by who did it (`[grok-bot]`, `[cursor-agent-0]`, `[mani]`).
- Screenshots in `docs/evidence/`: (decided) Grok Bot chat reading a channel, the local agents in Cursor, the Supabase dashboard, the Cognee graph build. **Now:** the mockup contact sheet only.

**Commits**
- Subject prefix by author: `[grok-bot] ...`, `[cursor] ...`, `[mani] ...`
- Trailer lines naming the tools used, e.g. `Built-with: Cursor`, `Built-with: Supabase`, `Context-by: Grok Bot`
- Planning and docs commits by Grok Bot are kept separate from code commits, so the history shows who did what.
- README links to `docs/BUILT-WITH.md` near the top.

## Where the demo runs
> **Decided 19:16 (Mani):** localhost on the Mac only. No public deploy. The video and the repo docs are what judges can check afterwards.

## Live data and Cognee Cloud (decided 21:33–21:45)
| Layer | Who | What |
|---|---|---|
| Read | Grok Bot (`feat/community-read`) | Slack + Discord desktop over CDP on 127.0.0.1:9222/9223; read-only; public channels; two weeks back; apps restored afterwards |
| Store + search | Grok Bot loads, Cursor reads | Supabase tables from `0001_init.sql`; gte-small 384-d embeddings + FTS; `route_question()` hybrid RRF |
| Graph | Grok Bot sends, Cursor reads | Cognee Cloud dataset `grapevine`: `POST /api/v1/add`, `POST /api/v1/cognify`, then `POST /api/v1/search` and the dataset graph endpoint |
| App | Cursor | Supabase-backed data layer, source label (Live / Sample), server-only Cognee Cloud client, Experts graph from Cognee |

Env (`.env.local` only, names in `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `COGNEE_API_KEY`, `COGNEE_BASE_URL`, `COGNEE_TENANT_ID`, `COGNEE_DATASET`, `LLM_API_KEY`.
