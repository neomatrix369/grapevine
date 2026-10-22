# Agents working in this repo
- Read `docs/planning/HANDOFF.md` first. The app lives in `web/` (`pnpm dev` on localhost:3000). The UI is typed sample data; do not apply `supabase/migrations/0001_init.sql` until keys are filled. Commands: root `README.md`.
- Git: follow `.cursor/rules/git-workflow.mdc`. Use a branch and a PR for every change; nothing is committed straight to `main`.
- Log each step as one line in `PROGRESS.md` with your tag (`[cursor-agent-0]`, `[grok-bot]`, `[mani]`).
- Secrets live only in `.env.local`, which is git-ignored. Never print, log or commit them.
