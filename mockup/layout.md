# Grapevine layout note (mockup, sample data)
Mockup: `mockup/grapevine.html` (open in a browser; URL params below). Renders: `mockup/screens/*-1280.png` and `*-390.png`, index in `screens.html`, overview in `contact-sheet.png`. Tokens only from `kit/design/tokens.css` (light default, dark via `prefers-color-scheme`; demo and video stay light).

**Rule:** one screen. The compose box is the focal point; everything else opens in place next to it, so the question never leaves the screen.

## The one screen
| Area | What it shows | Notes |
| --- | --- | --- |
| Header | `Grapevine`, `Sample data` tag, user name, `Play demo` | |
| Side menu | Compose, Library, Experts, My posts (count of posts awaiting replies), Growth | `nav` with `aria-current`. At 390 px it becomes a scrolling row under the header. |
| Title + switch | H1 and an **Ask / Announce** switch | Two real `<button aria-pressed>`. |
| Compose | One `<textarea>` with a label | Empty state has a one-line placeholder, no results panel. |
| Coverage line | `Based on N of M channels, since {date}.` + `Coverage` (opens Growth) | N counts fully read channels only, the same count Growth uses. |
| Result rows (Ask) | **Already known** (Library thread, highlighted snippet, source, topic note link) · **Experts to tag** (max 2, proof link "N answers in #channel", last active, opt-in `Tag` checkbox) · **Where to post** (best channel + norm, channel checkboxes, rules check, `Copy`, `Open #channel`, "Nothing is posted for you") | Cross-post across channels in one community is flagged with the quoted rule and rule id. Advisory: the user decides. |
| Result rows (Announce) | **Allowed here** (rule quoted, `Copy and open` per channel) · **Not here** (blocked channel, rule quote) · **Contact first** (moderators and organisers) · **Pick mentors** (experts by topic, 3 picked, `Draft 3 mentor invites`, best time to post) | Same compose box. |

## Opens in place (right column at 1280, below compose at 390)
| Menu item | Contents |
| --- | --- |
| Library | Search box, topic chips with counts, topic note with evidence ("From N threads, N messages in N public channels, up to {date}"), source threads, most shared links |
| Experts | Filter chips (topic, community), List / Graph switch. List: person, proof, answers, Active and role tags. Graph: "Knowledge graph by Cognee", caption instead of a legend, your own links in `--you` |
| My posts | Private list: question or announcement, channel, date, tagged people, status (`Awaiting replies`, `Answered`, `Replies`, `No reply in 7 days`), and whether it started here or was found in channels read |
| Growth | Counts (channels read, threads read, experts on topic, topics) with `+N since you read #channel`, running total of threads by week (a `Today` bar after the live read), coverage per channel, biggest gap + `Read next`, new experts |

## Honest states
- Loading: three named steps that map to real calls (library search, expert ranking, rules check), each marked Done, Running or Next, with skeleton rows.
- Not enough coverage yet: a loud box with the thread count and `Read #channel next`; each row says why it is empty ("Nobody named. Under 2 answers..."). No guessed channel or person.
- Under 2 answers nobody is listed as an expert (Experts list, Pick mentors, counts).

## End card
Name, one-line pitch, "How it was built": Grok Bot (context), Cursor (build, tagged commits), Supabase (search, live updates), Cognee (graph); proof in `docs/BUILT-WITH.md`, `PROGRESS.md`, `docs/evidence/` and the tagged commits.

## Mockup URLs (`grapevine.html?...`)
`state=empty|loading|ne` · `mode=announce` · `panel=library|experts|graph|posts|growth` · `read=1` (after the live channel read, demo step 7) · `end=1`.

## Files
`grapevine.html` (page and state), `views.js` (HTML per part), `mock.css` (styles, tokens only), `derive.js` + `mock-data.js` (every number), `my-posts.js` (sample My posts), `render.mjs` (screens), `contact-sheet.py` (overview PNG). All names and data are fictional.
