// Loads /tmp/gv-live raw dumps into Supabase (channels, people, messages + gte-small embeddings, coverage, graph). Counts only in logs.
import fs from 'fs';
const R = process.env.REPO; const env = {};
for (const l of fs.readFileSync(R + '/.env.local', 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
const U = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, ''), K = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };
const log = (...a) => console.log(new Date().toTimeString().slice(0, 8), 'load', ...a);
async function exists() { const r = await fetch(`${U}/rest/v1/messages?select=id&limit=1`, { headers: H }); return r.status === 200; }
if (!(await exists())) {
  log('schema missing -> applying 0001_init.sql');
  const pg = (await import('pg')).default; const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect(); await c.query(fs.readFileSync(R + '/supabase/migrations/0001_init.sql', 'utf8')); await c.query("notify pgrst, 'reload schema'"); await c.end();
  for (let i = 0; i < 15 && !(await exists()); i++) await new Promise(r => setTimeout(r, 2000));
  log('schema applied', await exists());
} else log('schema already applied');
async function up(table, rows, conflict) { let n = 0; for (let i = 0; i < rows.length; i += 200) { const r = await fetch(`${U}/rest/v1/${table}?on_conflict=${conflict}`, { method: 'POST', headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows.slice(i, i + 200)) }); if (r.ok) n += rows.slice(i, i + 200).length; else log(table, 'error', r.status, (await r.text()).slice(0, 160)); } log(table, 'upserted', n); return n; }
const slug = s => (s || 'unknown').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
const channels = [], coverage = [], people = new Map(), msgs = [];
for (const p of ['slack', 'discord']) {
  const f = `/tmp/gv-live/manifest-${p}.json`; if (!fs.existsSync(f)) continue; const man = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const c of man.channels) {
    channels.push({ platform: p, workspace: man.workspace, channel_id: c.channel_id, channel_name: c.channel_name, url: p === 'slack' ? `https://app.slack.com/client/${man.workspace}/${c.channel_id}` : `https://discord.com/channels/${man.workspace}/${c.channel_id}` });
    coverage.push({ platform: p, channel_id: c.channel_id, oldest_read: c.oldest, newest_read: c.newest, cutoff: man.cutoff, messages_read: c.messages, threads_read: 0, threads_skipped: 0, status: c.status, oldest_covered_at: c.status === 'read' ? man.cutoff : null, updated_at: new Date().toISOString() });
    const rf = `/tmp/gv-live/raw/${p}-${c.channel_id}.jsonl`; if (!fs.existsSync(rf)) continue;
    for (const l of fs.readFileSync(rf, 'utf8').split('\n').filter(Boolean)) {
      const m = JSON.parse(l); const pid = `${p}:${slug(m.author)}`;
      const pp = people.get(pid) || { person_id: pid, display_name: m.author || 'unknown', last_active_at: m.ts, messages_4w: 0, active: true, chans: new Map() };
      pp.messages_4w++; if (m.ts > pp.last_active_at) pp.last_active_at = m.ts; pp.chans.set(`${p}:${c.channel_id}`, (pp.chans.get(`${p}:${c.channel_id}`) || 0) + 1); people.set(pid, pp);
      msgs.push({ platform: p, channel_id: c.channel_id, message_id: m.message_id, author_person_id: pid, body: m.body, ts: m.ts, url: m.url });
    }
  }
}
log('to load: channels', channels.length, 'people', people.size, 'messages', msgs.length);
await up('channels', channels, 'platform,channel_id');
await up('people', [...people.values()].map(({ chans, ...r }) => r), 'person_id');
await up('messages', msgs, 'platform,channel_id,message_id');
await up('coverage', coverage, 'platform,channel_id');
const nodes = [...channels.map(c => ({ id: `channel:${c.platform}:${c.channel_id}`, kind: 'channel', label: c.channel_name, payload: { platform: c.platform } })), ...[...people.values()].map(p => ({ id: `person:${p.person_id}`, kind: 'person', label: p.display_name, payload: { messages_4w: p.messages_4w } }))];
const edges = []; for (const p of people.values()) for (const [k, n] of p.chans) edges.push({ src: `person:${p.person_id}`, dst: `channel:${k}`, kind: 'posts_in', weight: n });
await up('graph_nodes', nodes, 'id'); await up('graph_edges', edges, 'src,dst,kind');
try {
  const { pipeline } = await import('@huggingface/transformers');
  const ex = await pipeline('feature-extraction', 'Supabase/gte-small'); let done = 0; const out = [];
  for (const m of msgs) { if (!m.body) continue; const o = await ex(m.body.slice(0, 1500), { pooling: 'mean', normalize: true }); out.push({ ...m, embedding: `[${Array.from(o.data).join(',')}]` }); done++; }
  log('embedded', done, 'dim', out[0] ? out[0].embedding.split(',').length : 0);
  await up('messages', out, 'platform,channel_id,message_id');
} catch (e) { log('embedding FAIL', e.message.slice(0, 160)); }
log('LOAD DONE');
