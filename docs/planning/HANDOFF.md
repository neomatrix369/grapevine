# Handoff (22 Oct 2026, 19:36 BST)
Planning is finished: every answer in files 00–06 is decided, and `decisions.md` logs who decided each one and when. Code freeze is 21:50.

## Read in this order
`00-event.md` → `01-problem.md` → `02-ideas.md` → `03-users-and-demo.md` (demo path locked) → `04-scope.md` (cut order) → `05-ui-direction.md` → `06-build-and-delivery.md` → `decisions.md`.

## Key decisions at a glance
- Grapevine: library, experts, write once to the right channels (optional expert tags, copy and open, nothing auto-posted), My posts, Growth, plus organiser mode (Announce, find mentors).
- Calm, minimal UI; light by default (dark is opt-in, not system-followed); designed at 1280, checked at 390; demo and video pinned to light.
- Build: all local in Cursor on the Mac. Next.js/TS/Tailwind/shadcn + Supabase; Cognee builds the graph locally. Demo runs on localhost only.
- Data: Slack and Discord desktop apps, read-only, public channels, rules first, two weeks back, one channel held back for a live read.
- Proof: `docs/BUILT-WITH.md`, `PROGRESS.md`, `docs/evidence/`, and commits prefixed `[grok-bot]`/`[cursor]`/`[mani]` with `Built-with:` / `Context-by:` trailers.
- Video: 20 s promo + about 2:15 walkthrough, under 3 min, ending on the build proof.

## Starting material
- `../../mockup/` and `../../kit/design/tokens.css`: earlier mockups (fictional sample data). Updated 19:46 to the agreed layout: `mockup/grapevine.html` (live), `mockup/layout.md`, renders in `mockup/screens/` at 1280 and 390, overview in `mockup/contact-sheet.png`.
- The old prep in `grokbot-community-london-2026-planning/` (next to this project folder) is reference only; copy anything else fresh.

## Next
Set up the app repo, start the build, and follow the `04-scope.md` cut order if it falls behind.
