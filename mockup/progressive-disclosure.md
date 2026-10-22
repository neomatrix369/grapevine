# Progressive disclosure: Ask screen (Grapevine)
Reference: `mockup/hero-simple.html`, default `hero-simple.png`, everything opened `hero-simple-expanded.png` (sample data, 1440x900). It replaces the "all panels at once" layout in `hero-mockup.png`. Same tokens, same copy rules. Nothing new in `tokens.css`.

**Rule:** the first screen has one focal point: compose box, then one answer. Everything else is one click away and never duplicated on the default view.

## Default (always visible)
| Area | Shown by default | Notes |
| --- | --- | --- |
| Header | `Grapevine`, `SAMPLE DATA` tag, user name, `Details` button, `Play demo` | Nav tabs (Ask/Coverage/Rules/Me) removed; their content lives in the drawer. |
| Title row | H1 + small Ask/Announce toggle | Toggle = 2 real `<button aria-pressed>`. |
| Compose | Question in a real `<textarea>` with a label | "Post in" moved into Start with. |
| Pre-post check | `aria-live="polite"` region under Post in, empty on load. **Only when a rule matches**: one line, `1 rule applies: <rule in 8 words>` + `See rule` | No match = no row. Rules not read = one line "Rules not read yet for <community>". Rules older than 14 days = "Re-read rules". |
| Coverage line | `Based on 4 of 6 channels on this topic fully read, since 24 Sep. 1 partly read, 1 not read yet.` + `Coverage` link (text only, no icon) | Link opens the drawer on Coverage. After the demo read: 5 of 6. |
| Start with | Already answered (quote, snippet, source, Open thread), Best channel (channel, "9 of 20 threads on this topic", one-line norm), Who to tag (max **2** people, each with answers count, last active and its own Draft intro; private "You both know X" line under the top person only), Post in (prefilled with the best channel, `Copy for #channel`, `Open #channel`, "Nothing is posted. You post it yourself.") | Then one footer row `All N channels on this topic`. States: loading (skeleton + "Searching N channels read so far"), not enough evidence (`?state=ne`). |

## On demand
| Trigger | Opens | Pattern |
| --- | --- | --- |
| `See rule` | Full rule quote, community + rule id, `All 5 rules` (drawer Rules tab), suggestion "You ticked N channels in one community; untick N-1. Advisory, you decide." | Inline, `button[aria-expanded][aria-controls]` + `hidden` region. |
| `N more person/people` (only if >2) | Extra people, same row format; label becomes `Show fewer` | Inline disclosure. |
| `All N channels on this topic` | Channel table (sortable, `aria-sort`, bars + numbers) inside the Start with card; label becomes `Hide channels` | Inline disclosure. |
| `Details` (header), `Coverage`, `All 5 rules` | Right drawer, 420px, tabs **Coverage / Topics / People / Rules / Me** (Graph lives inside People; 23:19) | `aside` + `role=tablist`, arrow keys move tabs, Esc closes, focus goes to drawer heading on open and back to the trigger on close, `inert` when closed. At >=1200px it pushes the column left; below it overlays; at 390px it is full width. |
| Drawer: Coverage | Heatmap (toggle to Table), legend, "Biggest gap" + `Read this channel` | Heatmap/Table toggle kept (colour never alone). |
| Drawer: Topics | Topic and sub-topic chips, two-sentence summary with evidence and "summarised from threads up to {date}", top 3 source threads, most-shared links | S13, S14, M11, C3. |
| Drawer: People | Sortable list (answers, last active, `Active`, roles; row detail: shares line, Draft intro, Hide this person, private line); **List / Graph toggle**: the graph (circle = answers, line thickness = shared threads, your links in `--you`, caption instead of a legend) | M5, S11, S12, S16, M12. The old Graph tab is merged here. |
| Drawer: Rules | Per-community rules, matched rule highlighted with `--mark` and captioned | |
| Drawer: Me (private) | You could answer this, closest people, strongest topics | "Only you see this" label stays. |

## Build notes
- Disclosure state is local UI state only (no URL, no store), except `?demo=1`, which opens `See rule` and then the drawer on People (Graph view for 3 s) as captioned steps.
- Disclosures use real `<button>`s with `aria-expanded`; motion is the 200 ms UI tier (chevron rotate, drawer slide), off under reduced motion.
- One fact once: anything in the drawer must not repeat on the default view (e.g. the heatmap does not also show "4 of 5").
- One source for numbers: every count comes from `derive()` in `mockup/derive.js` over `mock-data.js` (built from `kit/data/sample` by `build-mock-data.py`).
- Empty states: no rule match = no check row; 0 extra people = no "more" button; channels not read = "Not read yet", never 0.
- Checked: no console errors, no horizontal overflow at 1280 and 390, keyboard path (tabs, arrows, Esc returns focus).

## Suggested edit to `kit/docs/plan/ui-craft.md` (applied 21 Oct 23:45, updated wording; kept here for the record)
Under "## Rules added for this repo", replace the line
`- Prefer dense sortable tables (`aria-sort`) to card grids. An answer screen opens with a 3-row "Start with" block: label, one counted fact, source link.`
with:
```
- Prefer dense sortable tables (`aria-sort`) to card grids. An answer screen opens with a 3-row "Start with" block: label, one counted fact, source link. Who to tag shows at most 2 people.
- Progressive disclosure: the Ask screen shows only header, compose, the pre-post check (one line, only when a rule matches, with "See rule"), the coverage line and "Start with". The channel table, extra people and full rule open inline on demand; Coverage, Graph, Rules and Me live in a right drawer with tabs. Spec: `mockup/progressive-disclosure.md`. Reference: `design/hero-mockup.png` is superseded by `hero-simple.png` (default) and `hero-simple-expanded.png` (opened) once Mani approves.
```
And in step 1 of "## Working order", change `(`design/hero-mockup.png`, "match it")` to `(`design/hero-simple.png` + `design/hero-simple-expanded.png`, "match it")` after the PNGs are copied into `kit/design/`.
