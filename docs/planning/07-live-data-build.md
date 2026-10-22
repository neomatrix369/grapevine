# 7. Live data build (Cursor brief)
> **Decided 21:33–21:45 BST, 22 Oct (Mani).** Written by Grok Bot for Cursor's local agent.

## Goal
Grapevine shows **live** Slack and Discord knowledge, not sample data. Grok Bot reads the communities and loads Supabase and Cognee Cloud (`feat/community-read`). Cursor makes the app read them.

## Data flow
1. **Read (Grok Bot):** Slack + Discord desktop over CDP on 127.0.0.1:9222 / 9223. Read-only, public channels, two weeks back, apps restored afterwards. Raw text goes to `data/raw/` (git-ignored), never into git.
2. **Store (Grok Bot loads):** Supabase tables from `supabase/migrations/0001_init.sql` (channels, people, messages with `fts` + `embedding vector(384)` from gte-small, rules, coverage, graph_nodes, graph_edges, my_posts). Search is `route_question(query_text, query_embedding)` (hybrid RRF).
3. **Graph (Grok Bot sends):** Cognee **Cloud** dataset `grapevine` via `POST /api/v1/add` and `POST /api/v1/cognify`.
4. **App (Cursor):** reads Supabase and Cognee Cloud server-side.

## Files to touch under `web/`
| File | Change |
|---|---|
| `web/lib/env.ts` | Add `COGNEE_API_KEY`, `COGNEE_BASE_URL`, `COGNEE_TENANT_ID`, `COGNEE_DATASET`; server-only getters |
| `web/lib/supabase/server.ts` (new) | `import 'server-only'`; client with `SUPABASE_SERVICE_ROLE_KEY` |
| `web/lib/data/source.ts` (new) | `getCommunityData()` → `{ source: 'live' \| 'sample', channels, people, messages, rules, coverage, posts }`. Supabase first; `SAMPLE` from `web/lib/sample-data.ts` only if Supabase is empty or unreachable |
| `web/app/api/ask/route.ts` (new) | Embed the question server-side with gte-small (384-d, same model as ingest, e.g. `Supabase/gte-small` via transformers.js), call `route_question()`; keyword-only if embedding fails |
| `web/lib/cognee/client.ts` (new) | `import 'server-only'`; `fetch(COGNEE_BASE_URL + '/api/v1/...')` with `X-Api-Key` (+ `X-Tenant-Id` if set) |
| `web/app/api/experts/graph/route.ts` (new) | Returns `{ nodes, edges }` from Cognee Cloud; falls back to `graph_nodes`/`graph_edges`, then sample |
| `web/components/knowledge-graph.tsx` | Render nodes/edges from the API instead of the static SVG; caption "Knowledge graph by Cognee Cloud" |
| `web/components/source-badge.tsx` (new) | Visible **Live · Slack + Discord, last 14 days** or **Sample data** label in Ask once and Workspace |
| Pages/panels using `SAMPLE` | Take data from `getCommunityData()` (server components) |

## Cognee Cloud API (docs.cognee.ai/cognee-cloud/http-api)
- Base URL: your tenant host, e.g. `https://<tenant>.aws.cognee.ai` (Cognee Cloud → API Keys → Connection Details). Every path is under `/api/v1`.
- Auth: `X-Api-Key: $COGNEE_API_KEY` (and `X-Tenant-Id` where the API Keys page shows it). No bearer login on Cloud.
- Ingest side: `POST /api/v1/add` (multipart: `datasetName`, `raw_data`), then `POST /api/v1/cognify` `{ "datasets": ["grapevine"] }`.
- `POST /api/v1/search` `{ "query": "...", "search_type": "GRAPH_COMPLETION", "datasets": ["grapevine"], "top_k": 15 }` for "who knows X" answers in Experts.
- `GET /api/v1/datasets` to find the dataset id, then `GET /api/v1/datasets/{dataset_id}/graph` for nodes and edges (check the shape in the tenant's API playground before mapping).

## Env vars (`.env.local` only; names in `.env.example`)
| Var | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client allowed |
| `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` | Server only |
| `COGNEE_API_KEY`, `COGNEE_BASE_URL`, `COGNEE_TENANT_ID`, `COGNEE_DATASET` (`grapevine`) | Server only |
| `LLM_API_KEY` | Ingest side only; the app does not need it |

## Acceptance criteria
- [ ] With Supabase loaded, the app shows live rows (channels, messages, people) from Supabase, not `sample-data.ts`.
- [ ] The Experts view and experts graph come from Cognee Cloud (with a visible Cognee Cloud caption).
- [ ] A source label (Live / Sample) is visible on Ask once and Workspace; Sample appears only when Supabase is empty.
- [ ] No secrets in client code: only `NEXT_PUBLIC_*` reach the browser. Service role and Cognee keys are used only in `server-only` modules and route handlers.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build` pass; no raw message text or `.env.local` committed.

## Git workflow (AGENTS.md, `.cursor/rules/git-workflow.mdc`)
- Pull `main`, then branch `feat/live-data` (don't touch `feat/community-read`).
- `[cursor] ...` commit subjects with `Built-with: Cursor` (add `Built-with: Supabase` / `Built-with: Cognee Cloud` where used).
- One `[cursor-agent-0]` line per step in `PROGRESS.md`.
- Open a PR into `main`; Mani merges.
