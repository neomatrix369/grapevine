import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const errs = [];
const S = 'screens/';
async function page(w, h, q = '') {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  p.on('console', m => m.type() === 'error' && errs.push(`${w}${q}: ${m.text()}`)); p.on('pageerror', e => errs.push(`${w}${q}: ${e}`));
  await p.goto('file://' + process.cwd() + '/hero-simple.html' + q); await p.evaluate(() => document.fonts.ready);
  return p;
}
const overflow = p => p.evaluate(() => document.documentElement.scrollWidth > innerWidth ? 'x-overflow ' + document.documentElement.scrollWidth : 'ok');
const small = p => p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.offsetParent && e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 12).map(e => e.tagName + ':' + e.textContent.trim().slice(0, 20)));
// default (reference)
let p = await page(1440, 900);
console.log('default', await overflow(p), 'small text', await small(p), 'live region empty on load:', await p.evaluate(() => document.getElementById('check').textContent.trim() === ''));
await p.screenshot({ path: 'hero-simple.png' });
// expanded: tick 3 channels (rules beat), see rule, more people, all channels, drawer on People
for (const n of ['ask-anything', 'show-and-tell']) await p.check(`#start input[value="${n}"]`);
await p.click('[aria-controls=rule-body]');
await p.click('[aria-controls=more-people]');
await p.click('[aria-controls=ch-table]');
await p.click('#details-btn'); await p.click('#t-people');
await p.setViewportSize({ width: 1440, height: 1300 }); await p.waitForTimeout(50);
console.log('expanded', await overflow(p), 'small text', await small(p));
await p.screenshot({ path: 'hero-simple-expanded.png' });
// keyboard: tabs + escape
await p.focus('#t-people'); await p.keyboard.press('ArrowRight');
console.log('arrow ->', await p.evaluate(() => document.querySelector('[role=tab][aria-selected=true]').id), 'focus', await p.evaluate(() => document.activeElement.id));
await p.keyboard.press('Escape');
console.log('esc focus:', await p.evaluate(() => document.activeElement.textContent.trim()), 'drawer open:', await p.evaluate(() => document.getElementById('drawer').classList.contains('open')));
// states and tabs at 1280 and 390
for (const [w, h] of [[1280, 900], [390, 844]]) {
  for (const [name, q, act] of [['ask', '', null], ['ask-loading', '?state=loading', null], ['ask-not-enough-evidence', '?state=ne', null], ['ask-announce', '?mode=announce', null],
      ['drawer-coverage', '', 'coverage'], ['drawer-topics', '', 'topics'], ['drawer-people', '', 'people'], ['drawer-people-graph', '', 'graph'], ['drawer-rules', '', 'rules'], ['drawer-me', '', 'me'], ['ask-after-read', '', 'read']]) {
    const q2 = await page(w, h, q);
    if (act === 'read') { await q2.click('#details-btn'); await q2.click('[data-read]'); await q2.keyboard.press('Escape'); }
    else if (act === 'graph') { await q2.click('#details-btn'); await q2.click('#t-people'); await q2.click('[data-view=ppl-graph]'); }
    else if (act) { await q2.click('#details-btn'); await q2.click('#t-' + act); }
    const o = await overflow(q2), s = await small(q2);
    if (o !== 'ok' || s.length) console.log(w, name, o, s);
    await q2.screenshot({ path: `${S}${name}-${w}.png`, fullPage: !act || act === 'read' });
    await q2.close();
  }
}
console.log('errors', errs);
await b.close();
