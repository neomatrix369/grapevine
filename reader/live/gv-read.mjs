// Read-only live reader: attaches over CDP (127.0.0.1) to the signed-in Slack/Discord desktop app.
// Navigates and scrolls only; never posts, reacts, DMs, joins or changes settings. Logs counts only.
import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT = process.env.OUT || '/tmp/gv-live/raw'; fs.mkdirSync(OUT, { recursive: true });
const CUTOFF = Date.now() - 14 * 864e5, CAP = 300, NCH = +(process.env.NCH || 3);
const which = process.argv[2]; const port = which === 'slack' ? 9222 : 9223;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toTimeString().slice(0, 8), which, ...a);
const SKIP = /rules|announce|welcome|admin|mod-|moderat|verify|roles|staff|organi[sz]er/i;
async function waitPort() { for (let i = 0; i < 40; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) return true; } catch {} await sleep(1000); } return false; }
async function getPage(b) {
  const re = which === 'slack' ? /^https:\/\/app\.slack\.com\/client\// : /^https:\/\/discord\.com\/(app|channels)/;
  for (let i = 0; i < 40; i++) { for (const c of b.contexts()) for (const p of c.pages()) if (re.test(p.url())) return p; await sleep(1000); }
  return null;
}
const SL_ITEM = '[data-qa="virtual-list-item"], .c-virtual_list__item';
const DC_ITEM = 'li[id^="chat-messages-"]';
function collectSlack() { let last = null; const out = []; for (const it of document.querySelectorAll('[data-qa="virtual-list-item"], .c-virtual_list__item')) { const key = it.getAttribute('data-item-key') || it.id || ''; const m = key.match(/(\d{10}\.\d{6})/); if (!m) continue; const s = it.querySelector('[data-qa="message_sender_name"]'); if (s) last = s.textContent.trim(); const t = it.querySelector('[data-qa="message-text"], .p-rich_text_section, .c-message_kit__blocks'); const rc = it.querySelector('[data-qa="reply_bar_count"]'); out.push({ id: m[1], ts: parseFloat(m[1]) * 1000, author: s ? s.textContent.trim() : last, text: t ? t.innerText : '', replies: rc ? (parseInt(rc.textContent) || 0) : 0 }); } return out; }
function collectDiscord() { let last = null; const out = []; for (const li of document.querySelectorAll('li[id^="chat-messages-"]')) { const id = li.id.split('-').pop(); const u = li.querySelector('[id^="message-username-"]'); if (u) last = u.innerText.trim(); const tm = li.querySelector('time'); const c = li.querySelector('[id^="message-content-"]'); out.push({ id, ts: tm ? Date.parse(tm.getAttribute('datetime')) : 0, author: u ? u.innerText.trim() : last, text: c ? c.innerText : '', replies: 0 }); } return out; }
function scrollUp(sel) { const f = document.querySelector(sel); let e = f; while (e && !(e.scrollHeight > e.clientHeight + 10 && /(auto|scroll)/.test(getComputedStyle(e).overflowY))) e = e.parentElement; if (e) { e.scrollTop = 0; return true; } return false; }
async function readChannel(page, item, collect) {
  const msgs = new Map(); let still = 0;
  for (let i = 0; i < 14; i++) {
    const got = await page.evaluate(collect); const before = msgs.size;
    for (const m of got) if (!msgs.has(m.id)) msgs.set(m.id, m);
    const arr = [...msgs.values()].filter(m => m.ts); const oldest = arr.length ? Math.min(...arr.map(m => m.ts)) : Date.now();
    if (oldest < CUTOFF || msgs.size >= CAP) break;
    if (msgs.size === before) { if (++still >= 2) break; } else still = 0;
    await page.evaluate(scrollUp, item); await sleep(1600);
  }
  const arr = [...msgs.values()].filter(m => m.ts >= CUTOFF).sort((a, b) => b.ts - a.ts).slice(0, CAP);
  return { arr, partial: msgs.size >= CAP };
}
function save(platform, workspace, ch, arr, partial, mk) {
  const rows = arr.map(m => ({ platform, workspace, channel_id: ch.id, message_id: m.id, author: m.author || 'unknown', body: (m.text || '').trim(), ts: new Date(m.ts).toISOString(), replies: m.replies, url: mk(m) }));
  fs.writeFileSync(`${OUT}/${platform}-${ch.id}.jsonl`, rows.map(r => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''));
  const ts = rows.map(r => r.ts).sort();
  return { channel_id: ch.id, channel_name: ch.name, messages: rows.length, oldest: ts[0] || null, newest: ts.at(-1) || null, status: rows.length ? (partial ? 'partial' : 'read') : 'unread' };
}
let b;
try {
  if (!(await waitPort())) throw new Error('no debug port');
  b = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const page = await getPage(b); if (!page) throw new Error('no app page');
  await sleep(5000);
  const manifest = { platform: which, generated_at: new Date().toISOString(), cutoff: new Date(CUTOFF).toISOString(), channels: [] };
  if (which === 'slack') {
    const sw = await page.evaluate(() => { const els = [...document.querySelectorAll('[aria-label]')].filter(e => /grok/i.test(e.getAttribute('aria-label')) && e.closest('[class*="team_sidebar"], [class*="workspace_rail"], [data-qa*="team"], [class*="tab_rail"]')); if (els[0]) { els[0].click(); return true; } return false; });
    log('grok workspace switch', sw); if (sw) await sleep(6000);
    const team = (page.url().match(/client\/(T\w+)/) || [])[1] || 'unknown';
    manifest.workspace = team; manifest.title_has_grok = /grok/i.test(await page.title());
    const chans = (await page.evaluate(() => [...document.querySelectorAll('[data-qa-channel-sidebar-channel-type]')].map(e => ({ id: e.getAttribute('data-qa-channel-sidebar-channel-id'), type: e.getAttribute('data-qa-channel-sidebar-channel-type'), name: (e.innerText || '').trim().split('\n')[0].slice(0, 80) }))))
      .filter(c => c.id && c.type === 'channel' && !SKIP.test(c.name));
    log('public sidebar channels', chans.length, 'title_has_grok', manifest.title_has_grok);
    for (const ch of chans.slice(0, NCH)) {
      try { await page.click(`[data-qa-channel-sidebar-channel-id="${ch.id}"]`); await sleep(3500);
        const { arr, partial } = await readChannel(page, SL_ITEM, collectSlack);
        const s = save('slack', team, ch, arr, partial, m => `https://app.slack.com/client/${team}/${ch.id}/p${m.id.replace('.', '')}`);
        manifest.channels.push(s); log('channel', ch.id, s.messages);
      } catch (e) { log('channel fail', ch.id, e.message.slice(0, 120)); }
    }
  } else {
    const guilds = await page.evaluate(() => [...document.querySelectorAll('[data-list-item-id^="guildsnav___"]')].map(e => ({ id: e.getAttribute('data-list-item-id').replace('guildsnav___', ''), label: (e.getAttribute('aria-label') || e.innerText || '') })));
    const g = guilds.find(x => /grok/i.test(x.label)) || guilds.find(x => /london|hackathon/i.test(x.label));
    log('guilds', guilds.length, 'grok match', !!g); if (!g) throw new Error('no grok guild');
    manifest.workspace = g.id;
    await page.click(`[data-list-item-id="guildsnav___${g.id}"]`); await sleep(4000);
    const chans = (await page.evaluate(gid => { const seen = new Set(); return [...document.querySelectorAll(`a[href^="/channels/${gid}/"]`)].map(a => ({ id: a.getAttribute('href').split('/')[3], name: (a.getAttribute('aria-label') || a.innerText || '').trim().split('\n')[0].slice(0, 80) })).filter(c => c.id && /^\d+$/.test(c.id) && !seen.has(c.id) && seen.add(c.id)); }, g.id)).filter(c => !SKIP.test(c.name));
    log('channels', chans.length);
    let done = 0;
    for (const ch of chans.slice(0, NCH + 4)) {
      if (done >= NCH) break;
      try { await page.click(`a[href^="/channels/${g.id}/${ch.id}"]`); await sleep(3500);
        const { arr, partial } = await readChannel(page, DC_ITEM, collectDiscord);
        if (!arr.length) { log('channel empty/forum', ch.id); continue; }
        const s = save('discord', g.id, ch, arr, partial, m => `https://discord.com/channels/${g.id}/${ch.id}/${m.id}`);
        manifest.channels.push(s); done++; log('channel', ch.id, s.messages);
      } catch (e) { log('channel fail', ch.id, e.message.slice(0, 120)); }
    }
  }
  fs.writeFileSync(`/tmp/gv-live/manifest-${which}.json`, JSON.stringify(manifest, null, 1));
  log('DONE channels', manifest.channels.length, 'messages', manifest.channels.reduce((a, c) => a + c.messages, 0));
} catch (e) { log('FAIL', e.message.slice(0, 150)); }
finally { if (b) await b.close().catch(() => {}); }
