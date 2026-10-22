// derive(D, state): the ONE place every number on the mockups comes from (sample data in mock-data.js).
// state = { read: bool (held-back channel read), selected: [channel names ticked in "Post in"], hidden: [person ids], topic: topic id }
// Mirrors the app's lib/search + lib/people rules; nothing here is a constant except labels.
function derive(D, state) {
  state = Object.assign({ read: false, selected: null, hidden: [], topic: 't-rag-eval' }, state || {});
  const DAY = 864e5, today = new Date(D.today + 'T12:00:00Z');
  const name = id => D.names[id] || id;
  const initials = id => name(id).split(' ').map(w => w[0]).join('').slice(0, 2);
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmtDate = iso => { const d = new Date(new Date(iso).toLocaleString('en-US', { timeZone: 'Europe/London' })); return d.getDate() + ' ' + MON[d.getMonth()]; };
  const daysAgo = iso => Math.round((today - new Date(iso.slice(0, 10) + 'T12:00:00Z')) / DAY);
  const ago = n => n === 0 ? 'today' : n === 1 ? '1 day ago' : `${n} days ago`;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + 's')}`;
  const topics = D.topics, T = topics.find(t => t.topic_id === state.topic);
  const heldName = D.coverage_after_read[0].channel_name;
  // coverage rows (after the demo read, the held-back row is replaced)
  const cov = D.coverage.map(r => state.read && r.channel_name === heldName ? D.coverage_after_read[0] : r);
  const covBy = Object.fromEntries(cov.map(r => [r.channel_name, r]));
  // channels on this topic: from topics.json, plus channels not read yet (they may cover it), plus the held-back read
  const heldThreads = (D.held_topic_threads[state.topic] || 0);
  let chans = T.channels.map(c => ({ name: c.channel_name, platform: c.platform, channel_id: c.channel_id, threads: c.threads }));
  cov.filter(r => !chans.some(c => c.name === r.channel_name) && (r.status === 'unread' || (state.read && r.channel_name === heldName)))
     .forEach(r => chans.push({ name: r.channel_name, platform: r.platform, channel_id: r.channel_id, threads: r.status === 'unread' ? null : heldThreads }));
  chans = chans.map(c => Object.assign(c, { status: covBy[c.name].status, workspace: covBy[c.name].workspace.replace(' (sample)', '') }))
               .sort((a, b) => (b.threads ?? -1) - (a.threads ?? -1));
  const relevant = chans.length, fullyRead = chans.filter(c => c.status === 'read').length;
  const partial = chans.filter(c => c.status === 'partial').map(c => c.name), unread = chans.filter(c => c.status === 'unread').map(c => c.name);
  const topicThreads = chans.reduce((s, c) => s + (c.threads || 0), 0);
  const topicChannels = chans.filter(c => c.threads).length;
  const best = chans[0];
  const rulesFor = (platform, workspace) => D.rules.filter(r => r.platform === platform && r.workspace.startsWith(workspace));
  const norm = c => { const r = D.rules.find(r => r.scope === 'channel' && r.channel_id === c.channel_id && r.tags.includes('on-topic') && !r.tags.includes('no-self-promo'));
                      return r ? r.text : null; };
  // people evidence on the topic (raw) + held-back answers after the read
  const held = state.read ? (D.held_answers[state.topic] || {}) : {};
  const shared = (a, b) => (D.connections.find(e => (e.src === a && e.dst === b) || (e.src === b && e.dst === a)) || {}).weight || 0;
  const people = D.people.filter(p => p.person_id !== D.me).map(p => {
    const ex = p.expertise.find(e => e.topic_id === state.topic);
    const nRaw = ex ? parseInt(ex.count_line, 10) : 0, nHeld = held[p.person_id] || 0, n = nRaw + nHeld;
    let chansLine = ex ? ex.count_line.replace(/^\d+ answers? in /, '') : '';
    if (nHeld) chansLine = '#' + heldName + (chansLine ? ', ' + chansLine : '');
    const last = [p.last_active_at, state.read ? D.held_last_active[p.person_id] : null].filter(Boolean).sort().pop();
    const sw = shared(p.person_id, D.me);
    let via = null;
    if (!sw) { D.people.forEach(q => { const a = shared(p.person_id, q.person_id), b = shared(q.person_id, D.me);
      if (q.person_id !== D.me && a && b && (!via || a > via.a)) via = { id: q.person_id, name: name(q.person_id), a, b }; }); }
    return { id: p.person_id, name: name(p.person_id), initials: initials(p.person_id), answers: n, answersLine: n ? `${plural(n, 'answer')} in ${chansLine}` : '',
             goto: n >= 2 ? `go-to for ${T.label}` : (n === 1 ? '1 answer, not enough to call go-to' : ''),
             lastActive: ago(daysAgo(last)), active: p.active, links: p.links_shared, linkReplies: p.link_replies,
             sharesLine: p.links_shared ? `Shared ${plural(p.links_shared, 'link')} · ${plural(p.link_replies, 'reply', 'replies')}` : '',
             roles: (D.roles[p.person_id] || []).map(r => r.role), sharedWithMe: sw, via, messages: p.messages_4w,
             evidence: ex ? ex.evidence : [] };
  }).filter(p => !state.hidden.includes(p.id));
  const experts = people.filter(p => p.answers > 0).sort((a, b) => b.answers - a.answers || a.name.localeCompare(b.name));
  const fbStart = state.read ? Object.assign({}, D.fallbacks.start_with.q1, D.fallbacks.start_with_after_read.q1) : D.fallbacks.start_with.q1;
  const byId = Object.fromEntries(people.map(p => [p.id, p]));
  const whoToTag = fbStart.who_to_tag.map(id => byId[id]).filter(Boolean);
  const answered = D.threads[D.fallbacks.start_with.q1.answered.message_url];
  answered.snippet = D.fallbacks.start_with.q1.answered.snippet;
  answered.authorName = name(answered.first_reply_author);
  // pre-post check: more than one channel ticked in one community -> its no-crosspost rule
  const selected = state.selected || [best.name];
  const selCov = selected.map(n => covBy[n]).filter(Boolean);
  const byWs = {}; selCov.forEach(r => (byWs[r.workspace] = byWs[r.workspace] || []).push(r.channel_name));
  const matched = [];
  Object.entries(byWs).forEach(([ws, list]) => { if (list.length > 1) { const r = D.rules.find(r => r.workspace === ws && r.tags.includes('no-crosspost')); if (r) matched.push({ rule: r, channels: list }); } });
  const rulesRead = Object.keys(byWs).filter(ws => !D.rules.some(r => r.workspace === ws));
  const stale = D.rules.filter(r => daysAgo(r.read_at) > D.stale_rule_days);
  // Me (private)
  const close = D.connections.filter(e => e.src === D.me || e.dst === D.me).map(e => ({ id: e.src === D.me ? e.dst : e.src, w: e.weight }))
    .filter(x => !state.hidden.includes(x.id)).sort((a, b) => b.w - a.w || name(a.id).localeCompare(name(b.id))).slice(0, 3)
    .map(x => Object.assign({ name: name(x.id), initials: initials(x.id), active: (D.people.find(p => p.person_id === x.id) || {}).active, roles: (D.roles[x.id] || []).map(r => r.role) }, x));
  const meSig = D.people.find(p => p.person_id === D.me);
  const could = D.fallbacks.me.could_answer.map(c => Object.assign({ why: c.why }, D.threads[c.message_url], { authorName: name(D.threads[c.message_url].author) }));
  // topics tab
  const subs = topics.filter(t => t.parent_id === T.topic_id);
  const srcThreads = T.source_thread_urls.slice(0, 3).map(u => Object.assign({ authorName: name(D.threads[u].author) }, D.threads[u]));
  const cheat = T.cheat_sheet.slice(0, 3).map(c => ({ url: c.url, label: c.url.replace('https://', ''), times: c.times_shared, replies: c.replies, first: name(c.first_shared_by) }));
  // announce
  const A = D.fallbacks.announce.a1, chName = id => (D.coverage.find(r => r.channel_id === id) || {}).channel_name;
  const rule = id => D.rules.find(r => r.rule_id === id);
  const announce = {
    where: A.where_to_post.map(w => ({ ch: chName(w.channel_id), why: w.why, rule: w.rule_id, url: rule(w.rule_id).source_url })),
    blocked: A.blocked.map(b => ({ ch: chName(b.channel_id), quote: b.quote, rule: b.rule_id, ws: rule(b.rule_id).workspace.replace(' (sample)', ''), url: rule(b.rule_id).source_url })),
    contact: A.contact.map(c => { const roles = (D.roles[c.person_id] || []).map(r => r.role), p = people.find(x => x.id === c.person_id);
      return { name: name(c.person_id), roles, why: roles.length || !p ? c.why : `${p.goto}, ${p.answersLine}: possible speaker` }; }),
    best: A.best_time, hours: D.activity_example_makers,
    hoursTotal: D.activity_example_makers.reduce((a, b) => a + b, 0),
    hoursIn: D.activity_example_makers.slice(A.best_time.start_hour, A.best_time.end_hour).reduce((a, b) => a + b, 0),
    draft: 'RAG evals workshop, Thu 19 Nov, 18:30, near Old Street. Hands-on: build a golden set from your own tickets, then test an LLM judge against it. Looking for one more speaker.'
  };
  return {
    question: D.fallbacks.questions.q1, cutoff: fmtDate(D.cutoff + 'T12:00:00Z'), today: D.today,
    coverageLine: { fullyRead, relevant, partial, unread }, channels: chans, best, bestNorm: norm(best), topic: T, topicThreads, topicChannels,
    answered, whoToTag, experts, people, selected, matched, rulesRead, stale, activeRule: D.active_rule,
    allCoverage: cov.map(r => Object.assign({ weeksRead: r.status === 'read' ? 4 : r.status === 'partial' ? 2 : 0 }, r)),
    gap: cov.filter(r => r.status === 'unread').map(r => r.channel_name)[0] || null,
    me: { id: D.me, name: name(D.me), initials: initials(D.me), close, strongest: meSig.expertise.map(e => e.count_line.replace(/^(\d+) answers? in .*/, '$1') + ' answers · ' + topics.find(t => t.topic_id === e.topic_id).label), could },
    communityRules: ws => D.rules.filter(r => r.scope === 'community' && r.workspace.startsWith(ws)),
    subs, srcThreads, cheat, summaryLine: { threads: T.thread_count, messages: T.message_count, channels: T.channels.length, upTo: fmtDate(T.newest_source_ts) },
    announce, heldName, heldThreads, fmtDate, plural, ago, name, shared,
    graphPeople: experts.slice(0, 4)
  };
}
if (typeof module !== 'undefined') module.exports = { derive };
