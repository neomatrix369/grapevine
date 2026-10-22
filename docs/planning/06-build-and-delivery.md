# 6. Build and delivery

**Stack:**
> **Decided 19:28 (Mani, kept fallback):** Next.js, TypeScript, Tailwind and shadcn/ui; Supabase (Postgres, keyword + vector search); a force-directed graph library.

**Where agents run:**
> **Decided 19:12 (Mani):** all local in Cursor on the Mac (see below).

**Data sources and how we read them:**
> **Decided 19:17 (Mani):** Slack and Discord desktop apps, read-only, public channels only, rules first, **two weeks back** (to save time), one busy channel held back for a live read.

**Demo from localhost or a live link:**
> **Decided 19:16 (Mani):** localhost on the Mac only (see below).

**Sponsors used and how each shows up:**
> **Decided 19:28 (Mani, kept fallback):** Supabase stores and searches everything; Cognee builds the graph offline; Grok Bot reads the communities and fills a gap live; Cursor builds it (tagged commits as evidence); Zero only if a prize is announced.

**Video:**
> **Decided 19:21 (Mani, length agent-recommended):** a 20 s promo (Mani, 19:22; allowed 10–30 s) then a narrated walkthrough of about 2:15 following the 9-step demo path. Total under 3 min (target 2:45 or less). It ends on the "how it was built" proof: `docs/BUILT-WITH.md` and tagged commits.

**Submission checklist owner:**
> **Decided 19:28 (Mani, kept fallback):** Mani.

---
## Where the coding agents run
> **Decided 19:12 (Mani):** all local in Cursor on the Mac. No cloud agents, so GitHub isn't needed to build.

## Sponsor proof: shown in the repo docs and the commits
> **Decided 19:15 (Mani):** the proof lives in the git repo, not just in the demo.

**Docs (in the repo)**
- `docs/BUILT-WITH.md`: one section per sponsor covering what it does in Grapevine, where in the code, and how to see it running.
  - **Grok Bot:** read the communities and their rules, ran the planning interview (these files plus `decisions.md`), ran the ingest, and powers the "Read next" button through a routine.
  - **Cursor:** built the app with local agents, following the project rules and skills in the repo, and applied the Supabase migrations through its Supabase connector.
  - **Supabase:** schema, search function, live coverage updates.
  - **Cognee:** the local graph job and the graph view.
  - **Zero:** only if the CRM stretch is built.
- `docs/planning/`: a clean copy of these planning files, so the ideation trail is visible.
- `PROGRESS.md`: a running log where every entry is tagged by who did it (`[grok-bot]`, `[cursor-agent-0]`, `[mani]`).
- Screenshots in `docs/evidence/`: Grok Bot chat reading a channel, the local agents in Cursor, the Supabase dashboard, the Cognee graph build.

**Commits**
- Subject prefix by author: `[grok-bot] ...`, `[cursor] ...`, `[mani] ...`
- Trailer lines naming the tools used, e.g. `Built-with: Cursor`, `Built-with: Supabase`, `Context-by: Grok Bot`
- Planning and docs commits by Grok Bot are kept separate from code commits, so the history shows who did what.
- README links to `docs/BUILT-WITH.md` near the top.

## Where the demo runs
> **Decided 19:16 (Mani):** localhost on the Mac only. No public deploy. The video and the repo docs are what judges can check afterwards.
