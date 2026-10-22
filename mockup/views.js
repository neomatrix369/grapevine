// HTML for each screen, from the view model that derive() returns. Shared by hero-simple.html and screens.html.
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const chev = '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
const warnIcon = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style="flex:none"><path d="M8 1.5 15 14H1z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 6v3.6M8 11.4v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const firstSentence = s => (s.match(/^[^?.!]*[?.!]/) || [s])[0];
const V = {
  coverageLine(v) {
    const c = v.coverageLine, extra = [c.partial.length && `${c.partial.length} partly read`, c.unread.length && `${c.unread.length} not read yet`].filter(Boolean).join(', ');
    return `<span>Based on <b>${c.fullyRead} of ${c.relevant}</b> channels on this topic fully read, since ${v.cutoff}${extra ? '. ' + extra : ''}.</span>
      <button class="more" data-open-tab="coverage" aria-controls="drawer">Coverage</button>`;
  },
  person(p, v, opts = {}) {
    const badges = [p.active && '<span class="tag ink">Active</span>', ...p.roles.map(r => `<span class="tag">${esc(r)}</span>`)].filter(Boolean).join(' ');
    const priv = opts.private && (p.sharedWithMe ? `You share ${v.plural(p.sharedWithMe, 'thread')}.` : p.via ? `No shared threads with you yet. You both know ${esc(p.via.name)}.` : 'No shared threads with you yet.');
    return `<div class="person"><span class="av" aria-hidden="true">${esc(p.initials)}</span>
      <span><b style="font-weight:500">${esc(p.name)}</b> ${badges}</span>
      <span class="src"><a href="#" data-open-tab="people">${esc(p.answersLine)}</a> · last active ${esc(p.lastActive)}</span>
      <button class="btn ghost sm act" data-draft="${p.id}">Draft intro<span class="sr-only"> to ${esc(p.name)}</span></button>
      ${priv ? `<span class="priv"><span class="sr-only">Private: </span>${priv} <span class="tag you">Only you</span></span>` : ''}</div>`;
  },
  startWith(v, ui) {
    const shown = v.whoToTag.slice(0, 2), extra = v.whoToTag.slice(2);
    const cands = [v.best.name, ...v.channels.filter(c => c.name !== v.best.name && c.threads).slice(0, 2).map(c => c.name)];
    return `<div class="ph"><span class="label" id="sw-h">Start with</span></div>
    <div class="row"><span class="label">Already answered</span>
      <div><div class="clamp2">“${esc(firstSentence(v.answered.title))}”</div>
        <div class="src"><span class="snip">${esc(firstSentence(v.answered.snippet))}</span> ${esc(v.answered.authorName)} · #${esc(v.answered.channel)} · ${v.fmtDate(v.answered.ts)} · ${v.plural(v.answered.replies, 'reply', 'replies')}</div></div>
      <a href="#" class="small" data-preview>Open thread</a></div>
    <div class="row"><span class="label">Best channel</span>
      <div><div><span class="ch">#${esc(v.best.name)}</span> · ${esc(v.best.workspace)}, ${v.best.platform === 'discord' ? 'Discord' : 'Slack'}</div>
        <div class="src">${v.best.threads} of ${v.topicThreads} threads on this topic${v.bestNorm ? `. Norm: “${esc(v.bestNorm.split('. ').slice(-1)[0])}”` : '. Channel norms not read yet'}</div></div><span></span></div>
    <div class="row"><span class="label">Who to tag</span>
      <div class="people">${shown.map((p, i) => V.person(p, v, { private: i === 0 })).join('')}
        ${extra.length ? `<div id="more-people" hidden class="people">${extra.map(p => V.person(p, v)).join('')}</div>
        <div><button class="more" aria-expanded="false" aria-controls="more-people" data-disclose data-label-open="Show fewer">${v.plural(extra.length, 'more person', 'more people')} ${chev}</button></div>` : ''}</div><span></span></div>
    <div class="row"><span class="label">Post in</span>
      <div><fieldset style="border:0"><legend class="sr-only">Post in</legend><div class="postin">
        ${cands.map(n => `<label class="cb"><input type="checkbox" value="${n}" ${ui.selected.includes(n) ? 'checked' : ''}><span class="ch">#${n}</span></label>`).join('')}</div></fieldset>
        <div id="check" class="check" aria-live="polite"></div>
        <div class="acts"><button class="btn sm" data-copy>Copy for #${esc(ui.selected[0] || v.best.name)}</button><a class="btn ghost sm" href="#" data-opench>Open #${esc(ui.selected[0] || v.best.name)}</a>
          <span class="src" style="margin:0">Nothing is posted. You post it yourself.</span></div></div><span></span></div>
    <div class="foot"><button class="more" aria-expanded="false" aria-controls="ch-table" data-disclose data-label-open="Hide channels">All ${v.channels.length} channels on this topic ${chev}</button></div>
    <div class="ch-table" id="ch-table" hidden><table><caption class="sr-only">Channels on this topic</caption>
      <thead><tr><th scope="col"><span class="label">Channel</span></th><th scope="col" class="hide-sm"><span class="label">Community</span></th><th scope="col" aria-sort="descending" class="num"><span class="label">Threads on topic</span></th><th scope="col"><span class="label">Coverage</span></th></tr></thead>
      <tbody>${v.channels.map(c => `<tr><td class="ch">#${esc(c.name)}</td><td class="hide-sm">${esc(c.workspace)} · ${c.platform === 'discord' ? 'Discord' : 'Slack'}</td>
        <td class="num">${c.threads == null ? '<span class="muted">Not read yet</span>' : `<span class="bar" style="width:${Math.round(c.threads / v.best.threads * 90)}px" aria-hidden="true"></span>${c.threads}`}</td>
        <td class="status">${c.status === 'unread' ? 'Unread' : c.status === 'partial' ? 'Partial' : 'Read'}</td></tr>`).join('')}</tbody></table></div>`;
  },
  check(v) {
    const out = [];
    v.matched.forEach(m => out.push(`<div class="check-line">${warnIcon}<span><b>1 rule applies:</b> post each question in one channel only.</span>
      <button class="more" aria-expanded="false" aria-controls="rule-body" data-disclose>See rule ${chev}</button></div>
      <div class="check-body" id="rule-body" hidden><blockquote>“${esc(m.rule.text)}”</blockquote>
      <span class="muted">${esc(m.rule.workspace.replace(' (sample)', ''))}, rule ${esc(m.rule.rule_id)} · <a href="#" data-open-tab="rules">All ${v.communityRules(m.rule.workspace.split(' (')[0]).length} rules</a> · You ticked ${m.channels.length} channels in one community; untick ${m.channels.length - 1}. Advisory, you decide.</span></div>`));
    v.rulesRead.forEach(ws => out.push(`<div class="check-line">${warnIcon}<span>Rules not read yet for ${esc(ws)}.</span></div>`));
    if (v.stale.length) out.push(`<div class="check-line">${warnIcon}<span>${v.stale.length} rules were read more than 14 days ago. Re-read rules.</span></div>`);
    return out.join('');
  },
  loading(v) {
    return `<div class="ph"><span class="label">Start with</span></div>
      <p class="src" role="status" style="padding:12px 18px 0">Searching ${v.allCoverage.filter(r => r.status !== 'unread').length} channels read so far…</p>
      ${['Already answered', 'Best channel', 'Who to tag'].map(l => `<div class="row"><span class="label">${l}</span><div><div class="skel" style="width:80%"></div><div class="skel" style="width:55%;margin-top:8px"></div></div><span></span></div>`).join('')}`;
  },
  notEnough(v) {
    const ch = v.channels.filter(c => c.threads).map(c => '#' + c.name).join(', ');
    return `<div class="ph"><span class="label">Start with</span></div><div style="padding:16px 18px">
      <div class="ne" role="status"><span class="h">Not enough evidence yet</span>
      Only <b>${v.plural(v.topicThreads, 'thread')}</b> on ${esc(v.topic.label)}, in ${esc(ch)}. We won't name a best channel or a go-to person from that.
      <div class="acts"><a class="btn ghost sm" href="#">Open the thread</a><button class="btn sm" data-open-tab="coverage">Read #${esc(v.gap)}</button></div></div></div>`;
  },
  announce(v) {
    const a = v.announce;
    return `<div class="ph"><span class="label">Before you post</span></div>
      <div class="row"><span class="label">Where to post</span><div>${a.where.map((w, i) => `<div${i ? ' style="margin-top:8px"' : ''}><span class="ch">#${esc(w.ch)}</span></div><div class="src">${esc(w.why)}. <a href="${esc(w.url)}">Rule ${esc(w.rule)}</a></div>`).join('')}<div class="src" style="margin-top:8px">Nothing is posted. You post it yourself.</div></div>
        <button class="btn ghost sm">Copy for #${esc(a.where[0].ch)}</button></div>
      <div class="row arow blocked"><span class="label" style="color:var(--warn)">Not here</span><div>${a.blocked.map(b => `<div><span class="ch">#${esc(b.ch)}</span></div><blockquote>“${esc(b.quote)}”</blockquote><div class="src">${esc(b.ws)}, <a href="${esc(b.url)}">rule ${esc(b.rule)}</a></div>`).join('')}</div><span></span></div>
      <div class="row"><span class="label">Contact first</span><div>${a.contact.map((c, i) => `<div${i ? ' style="margin-top:6px"' : ''}>${esc(c.name)}</div><div class="src">${esc(c.why)}</div>`).join('')}</div><span></span></div>
      <div class="row"><span class="label">Best time</span><div><div>${String(a.best.start_hour).padStart(2, '0')}:00 to ${a.best.end_hour}:00 London</div>
        <div class="src">${a.hoursIn} of ${a.hoursTotal} Example Makers messages fall in this window.</div>
        <div class="hours" role="img" aria-label="Messages per hour of day, peak ${a.best.start_hour}:00 to ${a.best.end_hour}:00.">${a.hours.map((n, i) => `<i class="${i >= a.best.start_hour && i < a.best.end_hour ? 'in' : ''}" style="height:${Math.max(4, n / Math.max(...a.hours) * 100)}%"></i>`).join('')}</div>
        <div class="hlab" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div></div><span></span></div>`;
  },
  coverage(v) {
    const cell = (r, w) => r.status === 'read' ? 'r' : r.status === 'partial' ? (w >= 2 ? 'p' : 'u') : 'u';
    return `<div class="tp-h"><span class="label">Since ${v.cutoff}</span><span class="seg" role="group" aria-label="View"><button aria-pressed="true" data-view="hm">Heatmap</button><button aria-pressed="false" data-view="cov-table">Table</button></span></div>
    <div id="hm"><div class="hm" role="img" aria-label="Coverage by channel and week. Table view available.">
      <span></span><span class="wk" style="grid-column:span 2">wk of ${v.cutoff}</span><span class="wk" style="grid-column:span 2;text-align:right">15 Oct</span><span></span>
      ${v.allCoverage.map(r => `<span class="n">#${esc(r.channel_name)}</span>${[0, 1, 2, 3].map(w => `<i class="c ${cell(r, w)}"></i>`).join('')}<span class="s">${r.status === 'unread' ? 'Unread' : r.status === 'partial' ? 'Partial' : 'Read'}</span>`).join('')}</div>
      <div class="legend"><span><i style="background:var(--cov-read)"></i>read</span><span><i style="background:repeating-linear-gradient(135deg,var(--cov-partial) 0 3px,var(--card) 3px 5px)"></i>partial</span><span><i style="background:var(--cov-unread);outline:1px dashed var(--rule)"></i>not read</span></div></div>
    <table id="cov-table" hidden><thead><tr><th scope="col"><span class="label">Channel</span></th><th scope="col"><span class="label">Weeks read</span></th><th scope="col" class="num"><span class="label">Messages</span></th></tr></thead>
      <tbody>${v.allCoverage.map(r => `<tr><td class="ch">#${esc(r.channel_name)}</td><td>${r.status === 'unread' ? '<span class="muted">Not read yet</span>' : `${r.weeksRead} of 4${r.status === 'partial' ? `, ${r.threads_skipped} threads skipped` : ''}`}</td><td class="num">${r.status === 'unread' ? '' : r.messages_read}</td></tr>`).join('')}</tbody></table>
    ${v.gap ? `<div class="gap"><span>Biggest gap: <span class="ch">#${esc(v.gap)}</span></span><button class="btn sm" data-read>Read this channel</button></div>` : `<p class="caption">#${esc(v.heldName)} read: ${v.allCoverage.find(r => r.channel_name === v.heldName).messages_read} messages.</p>`}`;
  },
  topics(v) {
    const s = v.summaryLine;
    return `<div class="sec"><span class="label">Topic of this question</span>
      <div class="chips" role="group" aria-label="Sub-topic filter"><button class="chip" aria-pressed="true">${esc(v.topic.label)} · ${v.topic.thread_count}</button>
        ${v.subs.map(t => `<button class="chip" aria-pressed="false">${esc(t.label)} · ${t.thread_count}</button>`).join('')}</div></div>
    <div class="sec"><span class="label">Summary</span><p class="summary">${esc(v.topic.summary)}</p>
      <p class="src">Evidence: <a href="#">${s.threads} threads, ${s.messages} messages</a> in ${s.channels} public channels. Summarised from threads up to ${s.upTo}.</p></div>
    <div class="sec"><span class="label">Source threads</span><ul class="list">${v.srcThreads.map(t => `<li><span class="grow"><a href="#" class="ell">${esc(firstSentence(t.title))}</a><span class="src">${esc(t.authorName)} · #${esc(t.channel)} · ${v.fmtDate(t.ts)}</span></span><span class="cnt">${v.plural(t.replies, 'reply', 'replies')}</span></li>`).join('')}</ul>
      <button class="more" aria-expanded="false">All ${v.topic.thread_count} threads</button></div>
    <div class="sec"><span class="label">Most shared on this topic</span><ul class="list">${v.cheat.map(c => `<li><span class="grow"><a href="#" class="ell">${esc(c.label)}</a><span class="src">shared ${c.times === 1 ? 'once' : c.times + ' times'}, first by ${esc(c.first)}</span></span><span class="cnt">${v.plural(c.replies, 'reply', 'replies')}</span></li>`).join('')}</ul></div>
    ${v.subs.filter(t => t.thread_count < 3).slice(0, 1).map(t => `<div class="sec"><div class="ne"><b>Too few threads to summarise ${esc(t.label)}:</b> ${v.plural(t.thread_count, 'thread')}. Showing the thread only.</div></div>`).join('')}`;
  },
  peopleList(v) {
    const rows = v.experts.slice(0, 5);
    return `<table><thead><tr><th scope="col"><span class="label">Person</span></th><th scope="col" aria-sort="descending" class="num"><span class="label">Answers</span></th></tr></thead><tbody>
      ${rows.map((p, i) => `<tr><td><details${i === 0 ? ' open' : ''}><summary><b style="font-weight:500">${esc(p.name)}</b> ${p.active ? '<span class="tag ink">Active</span>' : ''} ${p.roles.map(r => `<span class="tag">${esc(r)}</span>`).join(' ')}
          <span class="src" style="display:block">${esc(p.goto)} · last active ${esc(p.lastActive)}</span></summary>
          <div class="src">${p.sharesLine ? esc(p.sharesLine) + ' · ' : ''}<a href="#" data-draft="${p.id}">Draft intro</a> · <button class="more" data-hide="${p.id}">Hide this person</button></div>
          <div class="priv" style="margin-top:4px">${p.sharedWithMe ? `You share ${v.plural(p.sharedWithMe, 'thread')}.` : p.via ? `No shared threads with you yet. You both know ${esc(p.via.name)} (${p.via.a} threads with ${esc(p.name.split(' ')[0])}, ${p.via.b} with you).` : 'No shared threads with you yet.'} <span class="tag you">Only you</span></div></details></td>
        <td class="num"><a href="#">${p.answers}</a></td></tr>`).join('')}</tbody></table>
      ${v.experts.length > 5 ? `<button class="more" style="margin-top:8px" aria-expanded="false">${v.plural(v.experts.length - 5, 'more person', 'more people')}</button>` : ''}
      <p class="caption">Public channels only. Answers = replies in threads someone else started on ${esc(v.topic.label)}. Active = top ${Math.round(v.activeRule.share * 100)}% by messages since ${v.cutoff} (top ${v.activeRule.top_n} of ${v.activeRule.people_ranked}). Under 2 answers, nobody is called go-to.</p>`;
  },
  graph(v) {
    const ps = v.graphPeople, cx = 190, cy = 150, R = 105;
    const pos = ps.map((p, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / ps.length + 0.4; return { p, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) * 0.9 }; });
    const me = { x: cx, y: 280 };
    let edges = '';
    for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) { const w = v.shared(pos[i].p.id, pos[j].p.id); if (w) edges += `<line x1="${pos[i].x}" y1="${pos[i].y}" x2="${pos[j].x}" y2="${pos[j].y}" stroke="var(--ink-muted)" stroke-width="${w}"/>`; }
    pos.forEach(q => { const w = v.shared(q.p.id, v.me.id); if (w) edges += `<line x1="${q.x}" y1="${q.y}" x2="${me.x}" y2="${me.y}" stroke="var(--you)" stroke-width="${w}"/>`; });
    const spokes = pos.map(q => `<line x1="${cx}" y1="${cy}" x2="${q.x}" y2="${q.y}" stroke="var(--signal)" stroke-width="1.2" stroke-dasharray="3 3"/>`).join('');
    return `<svg class="graph" width="100%" viewBox="0 0 380 310" role="img" aria-label="Graph of ${ps.length} people on ${esc(v.topic.label)}; line thickness is shared threads. List view available.">
      ${spokes}${edges}<circle cx="${cx}" cy="${cy}" r="14" fill="var(--signal)"/><text x="${cx}" y="${cy + 30}" text-anchor="middle" class="mono" stroke="var(--card)" stroke-width="4" paint-order="stroke">${esc(v.topic.label)}</text>
      ${pos.map(q => `<circle cx="${q.x}" cy="${q.y}" r="${6 + q.p.answers}" fill="var(--signal-soft)" stroke="var(--signal-ink)" stroke-width="1.5"/><text x="${q.x}" y="${q.y - 12 - q.p.answers}" text-anchor="middle" stroke="var(--card)" stroke-width="4" paint-order="stroke">${esc(q.p.name)} · ${q.p.answers}</text>`).join('')}
      <circle cx="${me.x}" cy="${me.y}" r="8" fill="var(--you)"/><text x="${me.x + 14}" y="${me.y + 4}" style="fill:var(--you)">You</text></svg>
      <p class="caption">Circle size and number = answers on this topic. Line thickness = shared threads (1 to 5). Blue lines are your own links, only you see them.</p>`;
  },
  rules(v) {
    const ws = 'Example Makers', hit = v.matched.map(m => m.rule.rule_id);
    const rs = v.communityRules(ws);
    return `<div class="tp-h"><span class="label">${ws} · read ${v.fmtDate(rs[0].read_at)}</span></div><ul class="rules">
      ${rs.map(r => `<li><span class="id">${esc(r.rule_id)}</span><span>${hit.includes(r.rule_id) ? `<span class="hl">${esc(r.text)}</span>` : esc(r.text)}</span></li>`).join('')}</ul>
      <p class="caption">${hit.length ? 'Highlighted: the rule your choice of channels matches. ' : ''}<a href="#">Example Agents Guild rules (${v.communityRules('Example Agents Guild').length})</a></p>`;
  },
  me(v) {
    const m = v.me;
    return `<div class="tp-h"><span class="label">Private · only you see this</span></div>
      <div class="sec"><div style="display:flex;align-items:center;gap:8px"><span class="av me" aria-hidden="true">${esc(m.initials)}</span><span class="you">${esc(m.name)}</span></div></div>
      <div class="sec"><span class="label">You could answer this</span>${m.could.map(c => `<p class="small">${esc(c.authorName)}: “${esc(c.title)}”</p><p class="caption" style="margin-top:2px">#${esc(c.channel)} · ${v.plural(c.replies, 'reply', 'replies')}, none accepted · <a href="#">Open thread</a></p>`).join('')}</div>
      <div class="sec"><span class="label">Closest people</span><ul class="list">${m.close.map(c => `<li><span class="av" aria-hidden="true">${esc(c.initials)}</span><span class="grow">${esc(c.name)} ${c.active ? '<span class="tag ink">Active</span>' : ''}</span><span class="cnt">${v.plural(c.w, 'shared thread')}</span></li>`).join('')}</ul></div>
      <div class="sec"><span class="label">Your strongest topics</span><ul class="list">${m.strongest.map(s => `<li><span class="grow">${esc(s.split(' · ')[1])}</span><span class="cnt">${esc(s.split(' · ')[0])}</span></li>`).join('')}</ul></div>`;
  }
};
function autosize(t) { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }
if (typeof module !== 'undefined') module.exports = { V };
