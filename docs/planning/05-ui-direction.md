# 5. UI direction

**Overall feel:**
> **Decided 19:09:** calm and minimal, with warmth around people. Soft base, near-black text, one accent for "the answer", dense tables over card grids, short human copy with no emoji, friendly initials avatars for experts.

**What sits on the main screen first:**
> Draft (agreed layout 19:08): one screen with the compose box at the centre and an **Ask / Announce** switch above it. Under it, three result rows: already known, experts to tag, where to post plus the rule that applies. A slim side menu opens **Library**, **Experts**, **My posts** and **Growth** in place, so the question stays on screen. New to mock up: the Ask / Announce switch, My posts and Growth.

**Light, dark or both; accent colour:**
> **Decided 19:10:** light and dark, following the system setting (prefers-color-scheme). Needs a dark token set (about 15 min) and AA contrast checked in both themes. Demo mode and the video are pinned to light for the projector.
>
> **Updated 20:29:** light is the default. Dark tokens remain under `:root.dark` as an opt-in; the app does not follow `prefers-color-scheme`.

**Key screens and states:**
> **Decided 19:34 (Mani):** one screen with the compose box and the Ask/Announce switch, three result rows; side menu opens Library, Experts (list and graph), My posts and Growth in place. Loading shows real named steps; "not enough coverage yet" instead of guesses.
>
> **Updated 20:35:** two tabs. **Simple** (default) is the 20-second ask: question, already known, who knows, where to post, copy and open. **Workspace** is the current full screen: Ask/Announce, side menu, in-place Library, Experts, My posts and Growth.
>
> **Updated 20:43:** Simple keeps only the punches: question, knowledge graph (who knows), the known answer snippet, and where to post with copy. Coverage, tagging, channel pickers and the cross-post rule stay in Workspace.

**Desktop only, or mobile too:**
> **Decided 19:10 (agent-recommended):** designed at 1280 px, checked at 390 px. Detailed look choices (fonts, motion, reference image) are made during the build by the frontend-ui-craft skill.

**Visual reference:**
> **Decided 19:34 (Mani):** the earlier mockups, copied fresh and clean into `grapevine/mockup/` as the starting point.
