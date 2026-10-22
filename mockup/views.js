// HTML for each part of the one screen, from the view model that derive() returns (sample data only).
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const chev = '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
const warnIcon = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style="flex:none"><path d="M8 1.5 15 14H1z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 6v3.6M8 11.4v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const tick = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="flex:none"><path d="M2.5 7.5 5.5 10.5 11.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const dot = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="flex:none"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/></svg>';
const firstSentence = s => (s.match(/^[^?.!]*[?.!]/) || [s])[0];
const ws = s => s.replace(' (sample)', '');
const plat = p => p === 'discord' ? 'Discord' : 'Slack';
const V = {
  coverageLine(v) {
    const all = v.allCoverage, read = all.filter(r => r.status === 'read').length;
    return `<span>Based on <b>${read} of ${all.length}</b> channels, since ${v.cutoff}.</span>
      <button class="more" data-panel="growth">Coverage</button>`;
  },
  avatar(p) { return `<span class="av" aria-hidden="true">${esc(p.initials)}</span>`; },
  // Ask: three result rows
  results(v, ui) {
    const a = v.answered, top = v.whoToTag.slice(0, 2);
    const cands = [...new Set([v.best.name, ...v.selected, ...v.channels.filter(c => c.threads).map(c => c.name)])].slice(0, 3);
    const tagged = ui.tagged || [];
    return `
    <div class="rrow"><div class="rh"><span class="label">Already known</span><span class="src">from the Library</span></div>
      <div><div>“${esc(firstSentence(a.title))}”</div>
        <div class="src"><span class="snip">${esc(firstSentence(a.snippet))}</span></div>
        <div class="src">${esc(a.authorName)} · #${esc(a.channel)} · ${v.fmtDate(a.ts)} · ${v.plural(a.replies, 'reply', 'replies')} · <a href="#">Open thread</a></div><div class="src"><button class="more" data-panel="library">Topic note: ${esc(v.topic.label)}</button></div></div></div>
    <div class="rrow"><div class="rh"><span class="label">Experts to tag</span><span class="src">optional, you choose</span></div>
      <div class="people">${top.map(p => `<label class="person">${V.avatar(p)}
          <span><b style="font-weight:500">${esc(p.name)}</b> ${p.active ? '<span class="tag ink">Active</span>' : ''}
          <span class="src" style="display:block">Proof: <a href="#">${esc(p.answersLine)}</a> · last active ${esc(p.lastActive)}</span></span>
          <span class="cb"><input type="checkbox" data-tag="${p.id}" ${tagged.includes(p.id) ? 'checked' : ''}> Tag</span></label>`).join('')}
        <div><button class="more" data-panel="experts">All ${v.experts.length} experts on ${esc(v.topic.label)}</button></div></div></div>
    <div class="rrow"><div class="rh"><span class="label">Where to post</span><span class="src">with the rule that applies</span></div>
      <div><div class="src" style="margin:0 0 8px"><span class="ch">#${esc(v.best.name)}</span> is best: ${v.best.threads} of ${v.topicThreads} threads on this topic${v.bestNorm ? `. Norm: “${esc(v.bestNorm.split('. ').slice(-1)[0])}”` : ''}</div>
        <fieldset style="border:0"><legend class="sr-only">Post in</legend><div class="postin">
        ${cands.map(n => { const c = v.channels.find(x => x.name === n); return `<label class="cb"><input type="checkbox" value="${n}" ${v.selected.includes(n) ? 'checked' : ''}><span class="ch">#${n}</span><span class="muted small">${esc(c.workspace)}</span></label>`; }).join('')}</div></fieldset>
        <div id="check" class="check" aria-live="polite">${V.check(v)}</div>
        <div class="acts"><button class="btn sm">Copy${tagged.length ? ' with ' + v.plural(tagged.length, 'tag') : ''}</button><a class="btn ghost sm" href="#">Open #${esc(v.selected[0])}</a>
          <span class="src" style="margin:0">Nothing is posted for you. You paste and send it yourself.</span></div></div></div>`;
  },
  check(v) {
    const out = [];
    v.matched.forEach(m => out.push(`<div class="check-line">${warnIcon}<span><b>Cross-post flagged.</b> ${m.channels.length} channels in ${esc(ws(m.rule.workspace))}: “${esc(m.rule.text.split('. ')[0])}.” Rule ${esc(m.rule.rule_id)}. Untick ${m.channels.length - 1}, or keep it: you decide.</span></div>`));
    v.rulesRead.forEach(w => out.push(`<div class="check-line">${warnIcon}<span>Rules not read yet for ${esc(ws(w))}.</span></div>`));
    return out.join('');
  },
  loading(v) {
    const read = v.allCoverage.filter(r => r.status === 'read').length, part = v.allCoverage.filter(r => r.status === 'partial').length;
    const steps = [['done', `Searched the Library: ${read} channels read, ${part} partly, keyword and meaning`], ['run', `Ranking experts by answers on ${v.topic.label}`], ['todo', 'Checking channel rules for 2 communities']];
    return `<ol class="steps" role="status" aria-label="Working">${steps.map(([s, t]) => `<li class="${s}">${s === 'done' ? tick : dot}<span>${esc(t)}</span><span class="label">${s === 'done' ? 'Done' : s === 'run' ? 'Running' : 'Next'}</span></li>`).join('')}</ol>
      ${['Already known', 'Experts to tag', 'Where to post'].map(l => `<div class="rrow"><div class="rh"><span class="label">${l}</span></div><div><div class="skel" style="width:80%"></div><div class="skel" style="width:55%;margin-top:8px"></div></div></div>`).join('')}`;
  },
  notEnough(v) {
    const ch = v.channels.filter(c => c.threads).map(c => '#' + c.name).join(', ');
    return `<div class="ne" role="status"><span class="h">Not enough coverage yet</span>
      Only <b>${v.plural(v.topicThreads, 'thread')}</b> on ${esc(v.topic.label)}, in ${esc(ch)}. Grapevine will not guess an expert or a best channel from that.
      <div class="acts"><a class="btn ghost sm" href="#">Open the ${v.topicThreads === 1 ? 'thread' : 'threads'}</a><button class="btn sm" data-read>Read #${esc(v.gap)} next</button></div></div>
      <div class="rrow"><div class="rh"><span class="label">Already known</span></div><div class="src">${v.plural(v.topicThreads, 'thread')}, no topic note yet (needs 3).</div></div>
      <div class="rrow"><div class="rh"><span class="label">Experts to tag</span></div><div class="src">Nobody named. Under 2 answers on this topic, nobody is called an expert.</div></div>
      <div class="rrow"><div class="rh"><span class="label">Where to post</span></div><div class="src">Not stated until more channels are read.</div></div>`;
  },
  announce(v, ui) {
    const a = v.announce, picked = ui.mentors || [];
    return `
    <div class="rrow"><div class="rh"><span class="label">Allowed here</span><span class="src">rule quoted</span></div><div>${a.where.map((w, i) => `<div class="arow${i ? ' sp' : ''}"><span class="ch">#${esc(w.ch)}</span><span class="src" style="margin:0">${esc(w.why)}. <a href="${esc(w.url)}">Rule ${esc(w.rule)}</a></span><button class="btn ghost sm">Copy and open</button></div>`).join('')}</div></div>
    <div class="rrow blocked"><div class="rh"><span class="label" style="color:var(--warn)">Not here</span></div><div>${a.blocked.map(b => `<div><span class="ch">#${esc(b.ch)}</span> · ${esc(b.ws)}</div><blockquote>“${esc(b.quote)}”</blockquote><div class="src">Rule <a href="${esc(b.url)}">${esc(b.rule)}</a></div>`).join('')}</div></div>
    <div class="rrow"><div class="rh"><span class="label">Contact first</span><span class="src">moderators and organisers</span></div><div class="people">${a.contact.filter(c => c.roles.length).map(c => `<div class="person">${V.avatar({ initials: c.name.split(' ').map(w => w[0]).join('') })}<span><b style="font-weight:500">${esc(c.name)}</b> ${c.roles.map(r => `<span class="tag">${esc(r)}</span>`).join(' ')}<span class="src" style="display:block">${esc(c.why)}</span></span><button class="btn ghost sm">Draft note</button></div>`).join('')}</div></div>
    <div class="rrow"><div class="rh"><span class="label">Pick mentors</span><span class="src">${picked.length} of 3 picked</span></div>
      <div class="people">${v.experts.slice(0, 4).map(p => `<label class="person">${V.avatar(p)}<span><b style="font-weight:500">${esc(p.name)}</b> ${p.active ? '<span class="tag ink">Active</span>' : ''}<span class="src" style="display:block">${esc(p.goto)} · <a href="#">${esc(p.answersLine)}</a></span></span><span class="cb"><input type="checkbox" ${picked.includes(p.id) ? 'checked' : ''}> Mentor</span></label>`).join('')}
      <div class="acts"><button class="btn sm">Draft ${picked.length} mentor invites</button><span class="src" style="margin:0">Best time to post: ${String(a.best.start_hour).padStart(2, '0')}:00 to ${a.best.end_hour}:00 London (${a.hoursIn} of ${a.hoursTotal} messages).</span></div></div></div>`;
  },
  // Side menu panels
  library(v) {
    const s = v.summaryLine;
    return `<div class="search"><label for="lib-q" class="sr-only">Search the library</label><input id="lib-q" placeholder="Search the library" value="golden set"></div>
    <div class="sec"><span class="label">Topics</span>
      <div class="chips" role="group" aria-label="Topic filter"><button class="chip" aria-pressed="true">${esc(v.topic.label)} · ${v.topic.thread_count}</button>
        ${v.subs.map(t => `<button class="chip" aria-pressed="false">${esc(t.label)} · ${t.thread_count}</button>`).join('')}</div></div>
    <div class="sec"><span class="label">Note: ${esc(v.topic.label)}</span><p class="summary">${esc(v.topic.summary)}</p>
      <p class="src">From <a href="#">${s.threads} threads, ${s.messages} messages</a> in ${s.channels} public channels, up to ${s.upTo}.</p></div>
    <div class="sec"><span class="label">Source threads</span><ul class="list">${v.srcThreads.map(t => `<li><span class="grow"><a href="#" class="ell">${esc(firstSentence(t.title))}</a><span class="src">${esc(t.authorName)} · #${esc(t.channel)} · ${v.fmtDate(t.ts)}</span></span><span class="cnt">${v.plural(t.replies, 'reply', 'replies')}</span></li>`).join('')}</ul></div>
    <div class="sec"><span class="label">Most shared links</span><ul class="list">${v.cheat.map(c => `<li><span class="grow"><a href="#" class="ell">${esc(c.label)}</a><span class="src">shared ${c.times === 1 ? 'once' : c.times + ' times'}, first by ${esc(c.first)}</span></span><span class="cnt">${v.plural(c.replies, 'reply', 'replies')}</span></li>`).join('')}</ul></div>`;
  },
  experts(v) {
    const rows = v.experts.slice(0, 6);
    return `<div class="tp-h"><div class="chips" role="group" aria-label="Filter"><button class="chip" aria-pressed="true">${esc(v.topic.label)}</button><button class="chip" aria-pressed="false">All communities</button></div>
      <span class="seg" role="group" aria-label="View"><button aria-pressed="true" data-view="ex-list">List</button><button aria-pressed="false" data-view="ex-graph">Graph</button></span></div>
    <div id="ex-list"><table><thead><tr><th scope="col"><span class="label">Person</span></th><th scope="col"><span class="label">Proof</span></th><th scope="col" aria-sort="descending" class="num"><span class="label">Answers</span></th></tr></thead><tbody>
      ${rows.map(p => `<tr><td><div class="pcell">${V.avatar(p)}<span><b style="font-weight:500">${esc(p.name)}</b>${p.active || p.roles.length ? `<span class="badges">${p.active ? '<span class="tag ink">Active</span>' : ''}${p.roles.map(r => `<span class="tag">${esc(r)}</span>`).join('')}</span>` : ''}</span></div></td>
        <td><a href="#">${esc(p.answersLine.replace(/^\d+ answers? in /, ''))}</a><span class="src" style="display:block">last active ${esc(p.lastActive)}</span></td><td class="num">${p.answers}</td></tr>`).join('')}</tbody></table>
      <p class="caption">Public channels only. Answers are replies in threads someone else started. Under 2 answers, nobody is called an expert.</p></div>
    <div id="ex-graph" hidden>${V.graph(v)}</div>`;
  },
  graph(v) {
    const ps = v.graphPeople, cx = 200, cy = 150, R = 110;
    const pos = ps.map((p, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / ps.length + 0.4; return { p, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) * 0.9 }; });
    const me = { x: cx, y: 285 }; let edges = '';
    for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) { const w = v.shared(pos[i].p.id, pos[j].p.id); if (w) edges += `<line x1="${pos[i].x}" y1="${pos[i].y}" x2="${pos[j].x}" y2="${pos[j].y}" stroke="var(--ink-muted)" stroke-width="${w}"/>`; }
    pos.forEach(q => { const w = v.shared(q.p.id, v.me.id); if (w) edges += `<line x1="${q.x}" y1="${q.y}" x2="${me.x}" y2="${me.y}" stroke="var(--you)" stroke-width="${w}"/>`; });
    const spokes = pos.map(q => `<line x1="${cx}" y1="${cy}" x2="${q.x}" y2="${q.y}" stroke="var(--signal)" stroke-width="1.2" stroke-dasharray="3 3"/>`).join('');
    return `<svg class="graph" width="100%" viewBox="0 0 400 310" role="img" aria-label="Graph of ${ps.length} experts on ${esc(v.topic.label)}. List view available.">
      ${spokes}${edges}<circle cx="${cx}" cy="${cy}" r="14" fill="var(--signal)"/><text x="${cx}" y="${cy + 30}" text-anchor="middle" class="mono" stroke="var(--card)" stroke-width="4" paint-order="stroke">${esc(v.topic.label)}</text>
      ${pos.map(q => `<circle cx="${q.x}" cy="${q.y}" r="${6 + q.p.answers}" fill="var(--signal-soft)" stroke="var(--signal-ink)" stroke-width="1.5"/><text x="${q.x}" y="${q.y - 12 - q.p.answers}" text-anchor="middle" stroke="var(--card)" stroke-width="4" paint-order="stroke">${esc(q.p.name)} · ${q.p.answers}</text>`).join('')}
      <circle cx="${me.x}" cy="${me.y}" r="8" fill="var(--you)"/><text x="${me.x + 14}" y="${me.y + 4}" style="fill:var(--you)">You</text></svg>
      <p class="caption">Knowledge graph by Cognee. Circle size and number are answers on this topic; line thickness is shared threads. Blue lines are your own links, only you see them.</p>`;
  },
  myPosts(v, posts) {
    const st = { awaiting: 'Awaiting replies', answered: 'Answered', replied: 'Replies', 'no-reply': 'No reply in 7 days' };
    return `<div class="tp-h"><span class="label">Private · only you see this</span></div>
    <ul class="list posts">${posts.map(p => `<li><span class="grow"><span class="ell">${p.kind === 'announce' ? '<span class="tag">Announce</span> ' : ''}${esc(p.text)}</span>
        <span class="src">#${esc(p.channel)} · ${esc(p.workspace)} · ${v.fmtDate(p.at)}${p.tagged.length ? ' · tagged ' + p.tagged.map(v.name).map(esc).join(', ') : ''}${p.answeredBy ? ' · answered by ' + esc(v.name(p.answeredBy)) : ''}${p.reactions ? ' · ' + p.reactions + ' reactions' : ''}</span>
        <span class="src">${p.source === 'grapevine' ? 'Started here, posted by you' : 'Found in channels read'}</span></span>
        <span class="pstat ${p.status}">${p.status === 'awaiting' ? dot : p.status === 'answered' ? tick : ''}${st[p.status]}${p.replies && p.status !== 'awaiting' ? ' · ' + p.replies : ''}</span></li>`).join('')}</ul>
    <p class="caption">Status comes from the next read of each channel. Nothing here is visible to anyone else.</p>`;
  },
  growth(v, g) {
    const max = Math.max(...g.weeks.map(w => w.n));
    return `<div class="kpis">${g.kpis.map(k => `<div class="kpi"><span class="label">${esc(k.label)}</span><span class="big">${k.value}</span><span class="src">${k.delta ? `<span class="up">+${k.delta}</span> since you read #${esc(v.heldName)}` : esc(k.note || '')}</span></div>`).join('')}</div>
    <div class="sec"><span class="label">Threads in the library, running total by week</span>
      <div class="wk-bars">${g.weeks.map(w => `<div class="wkb"><span class="n">${w.n}</span><i style="height:${Math.max(4, w.n / max * 72)}px"></i><span class="label">${esc(w.label)}</span></div>`).join('')}</div></div>
    <div class="sec"><span class="label">Coverage, since ${v.cutoff}</span><ul class="list">${v.allCoverage.map(r => `<li><span class="grow"><span class="ch">#${esc(r.channel_name)}</span> <span class="muted small">${esc(ws(r.workspace))}</span></span><span class="cnt">${r.status === 'unread' ? 'Not read yet' : r.status === 'partial' ? `Partly read · ${r.threads_read} threads` : `${r.threads_read} threads`}</span></li>`).join('')}</ul>
      ${v.gap ? `<div class="gap"><span>Biggest gap: <span class="ch">#${esc(v.gap)}</span></span><button class="btn sm" data-read>Read next</button></div>` : ''}</div>
    <div class="sec"><span class="label">New experts</span>${g.newExperts.length ? `<ul class="list">${g.newExperts.map(p => `<li>${V.avatar(p)}<span class="grow"><b style="font-weight:500">${esc(p.name)}</b> <span class="tag ink">New</span><span class="src" style="display:block">${esc(p.why)}</span></span></li>`).join('')}</ul>` : '<p class="src">None since your last visit.</p>'}</div>`;
  },
  endCard(v) {
    const rows = [['Grok Bot', 'Context', `Read ${v.allCoverage.filter(r => r.status !== 'unread').length} public channels (${v.allCoverage.filter(r => r.status === 'partial').length} partly) and each community's rules, read-only, and wrote the plan.`],
      ['Cursor', 'Build', 'Local agents built the app. Every commit is tagged [cursor], [grok-bot] or [mani].'],
      ['Supabase', 'Search', 'Keyword plus meaning search finds who to ask and where to post; live updates drive Growth.'],
      ['Cognee', 'Graph', 'Builds the experts and topics graph locally.']];
    return `<div class="endcard"><span class="brand big">Grapevine</span>
      <p class="pitch">Ask once. See what's known, who knows it, and where to post.</p>
      <div class="panel built"><div class="ph"><span class="label">How it was built</span></div>
      ${rows.map(r => `<div class="rrow"><div class="rh"><b style="font-weight:500">${r[0]}</b><span class="label">${r[1]}</span></div><div class="src" style="margin:0">${esc(r[2])}</div></div>`).join('')}
      <div class="foot src">Proof in the repo: <span class="ch">docs/BUILT-WITH.md</span>, <span class="ch">PROGRESS.md</span>, <span class="ch">docs/evidence/</span> and the tagged commits.</div></div></div>`;
  }
};
function autosize(t) { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }
if (typeof module !== 'undefined') module.exports = { V };
