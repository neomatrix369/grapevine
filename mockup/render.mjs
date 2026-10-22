// Renders every screen of grapevine.html at 1280 and 390 into screens/, plus contact-sheet.html input.
// Usage: npm install --no-save playwright-core && node render.mjs   (uses the Playwright chromium in ~/.cache/ms-playwright)
import { chromium } from 'playwright-core';
import { readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
const pw = homedir() + '/.cache/ms-playwright';
const dir = existsSync(pw) && readdirSync(pw).find(d => /^chromium-\d+$/.test(d));
const executablePath = dir ? `${pw}/${dir}/chrome-linux64/chrome` : undefined;
const b = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const SCREENS = [
  ['ask', '?state=empty'], ['ask-loading', '?state=loading'], ['ask-not-enough-coverage', '?state=ne'], ['ask-results', ''],
  ['announce', '?mode=announce'], ['library', '?panel=library'], ['experts', '?panel=experts'], ['experts-graph', '?panel=graph'],
  ['my-posts', '?panel=posts'], ['growth', '?panel=growth'], ['growth-after-read', '?panel=growth&read=1'], ['end-card', '?end=1']
];
const errs = [];
for (const [w, h] of [[1280, 800], [390, 844]]) {
  for (const [name, q, scheme] of [...SCREENS, ['ask-results-dark', '', 'dark']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: scheme || 'light' });
    p.on('console', m => m.type() === 'error' && errs.push(`${name}-${w}: ${m.text()}`)); p.on('pageerror', e => errs.push(`${name}-${w}: ${e}`));
    await p.goto('file://' + process.cwd() + '/grapevine.html' + q); await p.evaluate(() => document.fonts.ready);
    const o = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth ? 'x-overflow ' + document.documentElement.scrollWidth : 'ok');
    if (o !== 'ok') console.log(name, w, o);
    await p.screenshot({ path: `screens/${name}-${w}.png`, fullPage: true });
    await p.close();
  }
}
console.log('errors', errs);
await b.close();
