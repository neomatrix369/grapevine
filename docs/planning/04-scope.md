# 4. Scope

**Time available:**
> **Decided 19:34 (Mani):** about 2 h 15 min from 19:35 to build, record and submit; code freeze 21:50. Use the cut order early if behind.

**Status (22 Oct 21:19, after Step 1):** Ask once + Workspace UI is implemented on typed sample data. Hybrid search, Cognee, ingest, live read, working copy-and-open, and video are still the decided target. Owner and Done when in the table overlay current main as of 22 Oct 2026 ~21:19 BST; item wording is the historical plan.

| Priority | Item (draft fallback) | Owner | Done when |
|---|---|---|---|
| Must | Compose box: best channel, who to tag, already answered | Cursor | IMPLEMENTED (sample) in Workspace Ask results |
| Must | Knowledge library (Topics tab with notes and source threads) | Cursor | IMPLEMENTED (sample) Library panel |
| Must | Experts directory (by topic, with proof) | Cursor | IMPLEMENTED (sample) list + static graph |
| Must | Write once to chosen channels: rules check, opt-in tags, copy and open | Cursor | PARTIAL: buttons exist; they do not copy or open a client |
| Must | Search over messages (keyword + meaning) | Cursor | DECIDED: route_question() in unapplied supabase/migrations/0001_init.sql; UI does not search |
| Must | Community rules in context, with a pre-post check | Cursor | IMPLEMENTED (sample) cross-post flag in Workspace |
| Must | Coverage heatmap and confidence line | Cursor | PARTIAL: coverage line + channel list in Growth; not a heatmap |
| Must | Knowledge graph of people, topics and channels (with a list version) | Cursor | PARTIAL: static SVG labelled Cognee; no Cognee job, no force-directed lib |
| Must | Private "Me" panel with My posts (status: answered, awaiting) | Cursor | IMPLEMENTED (sample) My posts panel |
| Should | Knowledge growth view (counts per week as more is read) | Cursor | IMPLEMENTED (sample) Growth panel; Read next is inert |
| Must | Evidence on every claim; people privacy (public channels only, hide a person) | Cursor | PARTIAL: proof links are #anchors; people.hidden exists in SQL only |
| Must | Play demo mode; accessible UI; real data; one live end-to-end run; video; submit | Cursor | PARTIAL: Play demo remounts sample; 1280/390 checked; no real data, no video in git |
| Should | Offline graph build, live "read next" for a gap, background backfill, polish pass, topics tab and cheat sheet, measured time saved, fair tagging | | DECIDED (Read next button inert) |
| Should | Organiser mode: announce once (O1), find mentors and judges (O2) | Cursor | IMPLEMENTED (sample) Announce mode |
| Could | Community pulse (O3), draft intro, copy-and-open posting, learn next, freshness labels | | DECIDED / not built |
| Won't (tonight) | Organiser dashboard, automatic identity matching, posting or DMs, CRM stretch unless a prize is announced | | OUT |

**Cut order if behind (first to go at the top):**
1. CRM stretch
2. Organiser mode (O3 first, then O2, then O1)
3. Draft intro
4. Background backfill
5. Freshness labels
