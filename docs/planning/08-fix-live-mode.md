# 08: Fix Live mode (plan for Cursor)

Written by Grok Bot, 23 Oct 2026 01:55 BST, from Mani's Live-mode screenshots (22 Oct 22:37 BST) and the data load results. Builds on `07-live-data-build.md`. Cursor executes this; Grok Bot owns the loader (`~/hackathon-smoke/gv-load-rest.mjs`, PR #6) and data fixes.

## Paste-ready prompt for Cursor
> Pull main, create branch `fix/live-mode`, and work through `docs/planning/08-fix-live-mode.md` top to bottom. For each item: find the root cause in `web/`, fix it, and meet its acceptance check in both Live and Sample mode at 1280 and 390 px. Use `[cursor]` commits (one per item, `Built-with: Cursor` trailer), keep secrets server-side only, append a `[cursor]` line to PROGRESS.md, and open a PR into main with a checklist of the items and screenshots.

## Current state
- Supabase (live, Discord only, since 8 Oct): channels 3, people 34, messages 156 (all with 384-d embeddings), coverage 3, graph_nodes 37, graph_edges 38, rules 0, my_posts 0. `route_question` works (20 results: vector 20, FTS 0).
- Cognee Cloud: dataset `grapevine`, cognified; the graph renders in the app.
- Slack: no data yet (reader issue, Grok Bot's side).
- App: Sample/Live toggle exists on `feat/live-data`.

## Items (priority order)

### P0: data shown makes sense
1. **Question box prefilled with a raw chat message.** In Live mode the Ask once and Compose box defaults to the latest message text, and "Already known" echoes it back.
   - Fix: never derive the question from messages. Default to an empty box with a placeholder and 2-3 suggested real questions (e.g. "Who can help with Supabase vector search?"). "Already known" must come from `route_question(question)` results for the typed question.
   - Accept: typing a question and pressing Ask shows ranked matching messages with author, channel, date and an "Open thread" link; an empty box shows suggestions, not a message.
2. **Expert names show "unknown" and odd handles.** "unknown" has 43 messages.
   - Fix: join messages to `people` by author id; display `display_name`, falling back to handle, never "unknown". Group experts by person id, not name. Exclude bots and system messages.
   - Accept: no "unknown" in Experts or Experts to tag; counts per person add up to the messages in that topic.
3. **"121 of 0 threads".**
   - Fix: compute the numerator and denominator from the same source (messages or threads in that channel for the topic). If threads aren't stored, say "121 messages" instead.
   - Accept: the sentence is arithmetically true and matches `coverage`.
4. **Channel chips show the same ID** (1562206257241128973) for #general, #team-up, #coupon-codes.
   - Fix: show channel name only (ID in a tooltip if needed), using each row's own `id`. Check the map key isn't the server/guild id.
   - Accept: each chip shows its own channel; Open #channel opens that channel's own link.
5. **Header says "Slack + Discord"** when only Discord has data.
   - Fix: derive the source label from distinct `channels.platform` present in Supabase.
   - Accept: shows "Discord" now; shows "Slack + Discord" only once Slack rows exist.
6. **Cognee graph noise.** Shows DocumentChunk IDs, timestamps, TextDocument nodes; disconnected nodes; overlapping or clipped labels.
   - Fix: filter server-side to entity nodes (people and topics), drop nodes whose label looks like an id/uuid/timestamp, drop isolated nodes, truncate labels with ellipsis plus full label in a tooltip, and lay out with enough spacing (or force layout) so labels don't overlap.
   - Accept: only readable people/topic names; no clipped text at 1280 or 390 px.

### P1: every control works
7. Test and fix each control in Live and Sample mode; record the result in the PR checklist:
   - Header: Sample/Live toggle, Ask once/Workspace tabs, Play demo.
   - Compose: Ask/Announce toggle, Ask button, Coverage link, Open thread, Topic note, "All N experts on <topic>".
   - Experts to tag: Tag checkboxes update the copy text and the "Copy with N tags" count.
   - Where to post: channel checkboxes, "Copy with N tags" (writes the composed post plus tags to the clipboard and shows a toast), "Open #channel" (opens the channel URL in a new tab; nothing is posted).
   - Side menu: Library, Experts, My posts, Growth each render live data (or an honest empty state, e.g. My posts 0 and rules 0).
   - Accept: no console errors and no 4xx/5xx on any click; every control has a visible effect.
8. **Play demo** only remounts the view.
   - Fix: run the script in `03-users-and-demo.md` as a timed walkthrough (type a question, loading, results with evidence, Workspace pages, end card), about 3 s per step, with Stop, pinned to light theme, using whichever data source is selected.
   - Accept: one click plays end to end; Stop halts it.

### P2: proof and polish
9. Empty and error states for Live: Supabase unreachable, Cognee unreachable, no matches. Never fall back silently; show which source is on screen.
10. Update `docs/BUILT-WITH.md` (Cursor section) with what was fixed and the PR link.

## Out of scope for Cursor (Grok Bot will do)
- Slack read and reload; people display-name and channel-name fixes in the loader if the data itself is wrong; adding the schema push and load to PR #6 and BUILT-WITH; merging PR #6.

## Rules
- Read-only towards communities: nothing is ever posted for the user.
- Service role and Cognee keys stay server-side; only NEXT_PUBLIC values in the client.
- No message text in git (fixtures must be synthetic).
