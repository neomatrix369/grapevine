// Cognee Cloud pass (docs.cognee.ai/cognee-cloud/http-api): add -> cognify -> dataset graph, mirrored into Supabase graph_nodes/edges (kind=topic).
// Needs COGNEE_API_KEY and the tenant base URL (COGNEE_BASE_URL / COGNEE_API_URL / COGNEE_URL), optional COGNEE_TENANT_ID. Counts only in logs.
import fs from 'fs';
const R = process.env.REPO; const env = {};
for (const l of fs.readFileSync(R + '/.env.local', 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
const log = (...a) => console.log(new Date().toTimeString().slice(0, 8), 'cognee', ...a);
const KEY = env.COGNEE_API_KEY, BASE = (env.COGNEE_BASE_URL || env.COGNEE_API_URL || env.COGNEE_URL || env.COGNEE_API_BASE_URL || '').replace(/\/+$/, '').replace(/\/api(\/v1)?$/, '');
if (!KEY) { log('COGNEE_API_KEY missing in .env.local'); process.exit(0); }
if (!BASE) { log('Cognee tenant base URL missing (set COGNEE_BASE_URL from the API Keys page Connection Details)'); process.exit(0); }
const H = { 'X-Api-Key': KEY, ...(env.COGNEE_TENANT_ID ? { 'X-Tenant-Id': env.COGNEE_TENANT_ID } : {}) };
const DS = 'grapevine';
let docs = 0;
for (const f of fs.readdirSync('/tmp/gv-live/raw').filter(f => f.endsWith('.jsonl'))) {
  const rows = fs.readFileSync('/tmp/gv-live/raw/' + f, 'utf8').split('\n').filter(Boolean).map(JSON.parse).slice(0, 150);
  const text = rows.filter(r => r.body).map(r => `${r.author}: ${r.body.slice(0, 300)}`).join('\n'); if (!text) continue;
  const fd = new FormData(); fd.append('datasetName', DS); fd.append('data', new Blob([text], { type: 'text/plain' }), f.replace('.jsonl', '.txt'));
  const r = await fetch(`${BASE}/api/v1/add`, { method: 'POST', headers: H, body: fd }); if (r.ok) docs++; else log('add error', r.status, (await r.text()).slice(0, 120));
}
log('added docs', docs); if (!docs) process.exit(0);
const c = await fetch(`${BASE}/api/v1/cognify`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ datasets: [DS] }) });
log('cognify status', c.status); if (!c.ok) { log('cognify error', (await c.text()).slice(0, 160)); process.exit(0); }
const dl = await (await fetch(`${BASE}/api/v1/datasets`, { headers: H })).json(); const ds = (Array.isArray(dl) ? dl : dl.datasets || []).find(d => d.name === DS);
if (!ds) { log('dataset not found'); process.exit(0); }
const gr = await fetch(`${BASE}/api/v1/datasets/${ds.id}/graph`, { headers: H }); const g = gr.ok ? await gr.json() : { nodes: [], edges: [] }; log('graph status', gr.status, 'nodes', (g.nodes || []).length, 'edges', (g.edges || []).length);
const keep = new Map();
for (const n of g.nodes || []) { const t = n.type || n.properties?.type || ''; const label = n.label || n.name || n.properties?.name; if (label && /entity/i.test(t)) keep.set(String(n.id), { id: `cognee:${n.id}`, kind: 'topic', label: String(label).slice(0, 120), payload: { cognee_type: t, source: 'cognee-cloud' } }); }
const ge = new Map(); for (const e of g.edges || []) { const s = String(e.source ?? e.src), d = String(e.target ?? e.dst); if (keep.has(s) && keep.has(d)) { const k = String(e.label || e.relationship_name || 'related').slice(0, 60); ge.set(s + d + k, { src: `cognee:${s}`, dst: `cognee:${d}`, kind: k, weight: 1 }); } }
const U = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, ''), SK = env.SUPABASE_SERVICE_ROLE_KEY;
async function up(t, rows, cf) { if (!rows.length) return 0; const r = await fetch(`${U}/rest/v1/${t}?on_conflict=${cf}`, { method: 'POST', headers: { apikey: SK, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }); if (!r.ok) log(t, 'error', r.status, (await r.text()).slice(0, 120)); return r.ok ? rows.length : 0; }
log('supabase topic nodes', await up('graph_nodes', [...keep.values()], 'id'), 'topic edges', await up('graph_edges', [...ge.values()], 'src,dst,kind'));
log('COGNEE DONE');
