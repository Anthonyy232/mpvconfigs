// node readme/build.cjs <mpvconfigs checkout> : README hero (light/dark) into .github/readme/, social preview into readme/
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const repo = process.argv[2];
if (!repo) throw new Error('usage: node readme/build.cjs <path to a checkout of main>');
const root = path.join(__dirname, '..');
const dataUri = (f, type) => `data:${type};base64,${fs.readFileSync(f).toString('base64')}`;
const font = (style, file) => `@font-face { font-family: 'Instrument Serif'; font-style: ${style}; font-weight: 400;
  src: url(${dataUri(path.join(root, 'fonts', file), 'font/woff2')}) format('woff2'); }`;
const shot = dataUri(path.join(__dirname, 'inputs', 'mpv-window.png'), 'image/png');

// Seek bindings from input.conf, grouped by modifiers and by keys or wheel: [{ keys: ['Shift', '←', '→'], seconds: [1] }]
const glyphs = { LEFT: '←', RIGHT: '→', UP: '↑', DOWN: '↓' };
const groups = new Map();
for (const line of fs.readFileSync(path.join(repo, 'input.conf'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^(\S+)\s+seek\s+(-?[\d.]+)/);
  if (!m) continue;
  const parts = m[1].split('+');
  const key = parts.pop();
  const wheel = key.startsWith('WHEEL_');
  const id = `${parts.join('+')}|${wheel}`;
  if (!groups.has(id)) groups.set(id, { keys: [...parts, ...(wheel ? ['Wheel'] : [])], seconds: [] });
  const group = groups.get(id);
  if (!wheel && !group.keys.includes(glyphs[key] ?? key)) group.keys.push(glyphs[key] ?? key);
  const seconds = Math.abs(Number(m[2]));
  if (!group.seconds.includes(seconds)) group.seconds.push(seconds);
}
if (!groups.size) throw new Error('no seek bindings found in input.conf');
// keyboard before wheel
const keys = [...groups.values()].sort((a, b) => a.keys.includes('Wheel') - b.keys.includes('Wheel')).map(g =>
  `<div class="group">${g.keys.map(k => `<kbd>${k}</kbd>`).join('')}<span>${g.seconds.join(' or ')} s</span></div>`).join('');

const page = ({ dark, height, radius, brandY, titleY, keysY, stageY }) => `<!doctype html><meta charset="utf-8">
<style>
  ${font('normal', 'InstrumentSerif-Regular.woff2')}
  ${font('italic', 'InstrumentSerif-Italic.woff2')}
  :root { --bg: ${dark ? '#171614' : '#f5f3ee'}; --ink: ${dark ? '#edeae3' : '#1c1b18'}; --muted: ${dark ? '#a09b90' : '#615d55'};
    --accent: ${dark ? '#ff9a57' : '#c2510a'}; --key: ${dark ? '#211f1c' : '#fffefb'}; --key-ink: ${dark ? '#e6e3db' : '#2a2926'};
    --line: ${dark ? '#edeae324' : '#1c1b181f'};
    --stage: ${dark
      ? 'radial-gradient(60% 70% at 0% 25%, #8a3e1a, transparent), radial-gradient(55% 65% at 100% 30%, #5a2230, transparent), radial-gradient(50% 45% at 50% 100%, #8a4a24, transparent), #2a1b18'
      : 'radial-gradient(45% 60% at 100% 22%, #f7a568, transparent), radial-gradient(50% 45% at 50% 100%, #dc8b55, transparent), linear-gradient(#fcd1b1, #fde4d2)'}; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: transparent; }
  .card { position: relative; width: 1280px; height: ${height}px; overflow: hidden; border-radius: ${radius}px; background: var(--bg); color: var(--ink); font-family: system-ui, 'Segoe UI', sans-serif; }
  .brand { position: absolute; left: 0; right: 0; top: ${brandY}px; text-align: center; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
  h1 { position: absolute; left: 0; right: 0; top: ${titleY}px; margin: 0; text-align: center; white-space: nowrap;
    font: 400 ${height > 700 ? 112 : 96}px/1 'Instrument Serif', serif; letter-spacing: -0.01em; }
  h1 i { color: var(--accent); }
  .keys { position: absolute; left: 0; right: 0; top: ${keysY}px; display: flex; justify-content: center; gap: 22px; }
  .group { display: flex; align-items: center; gap: 8px; }
  .group span { margin-left: 4px; font-size: 17px; color: var(--muted); }
  kbd { display: grid; place-items: center; min-width: 40px; height: 38px; padding: 0 9px; border: 1px solid var(--line); border-radius: 8px;
    background: var(--key); box-shadow: 0 2px 0 var(--line); color: var(--key-ink); font: 700 15px ui-monospace, 'Cascadia Code', monospace; }
  .stage { position: absolute; left: 120px; right: 120px; top: ${stageY}px; bottom: -40px; border-radius: 28px; overflow: hidden; background: var(--stage); }
  .window { position: absolute; left: 60px; bottom: 84px; width: 920px; border-radius: 14px; overflow: hidden;
    box-shadow: 0 30px 70px -10px #1a0d0866, 0 8px 24px #1a0d0833; }
  .window img { display: block; width: 100%; }
</style>
<div class="card">
<div class="brand">mpvconfigs</div>
<h1>mpv, <i>quietly</i> set up</h1>
<div class="keys">${keys}</div>
<div class="stage"><div class="window"><img src="${shot}"></div></div>
</div>`;

// the README hero is a rounded card, the social preview fills its frame
const hero = { height: 760, radius: 28, brandY: 52, titleY: 103, keysY: 240, stageY: 340 };
const social = { height: 640, radius: 0, brandY: 39, titleY: 77, keysY: 198, stageY: 290 };

(async () => {
  const browser = await chromium.launch();
  const shoot = async (file, layout, scale) => {
    const tab = await browser.newPage({ viewport: { width: 1280, height: layout.height }, deviceScaleFactor: scale });
    await tab.setContent(page(layout), { waitUntil: 'load' });
    await tab.evaluate(() => document.fonts.ready);
    if (!(await tab.evaluate(() => document.fonts.check("100px 'Instrument Serif'") && document.fonts.check("italic 100px 'Instrument Serif'"))))
      throw new Error(`Instrument Serif not loaded for ${file}`);
    await tab.screenshot({ path: file, omitBackground: true });
    await tab.close();
    console.log(path.relative(process.cwd(), file));
  };
  for (const dark of [false, true])
    await shoot(path.join(repo, '.github/readme', `hero-${dark ? 'dark' : 'light'}.png`), { ...hero, dark }, 1.6);
  await shoot(path.join(__dirname, 'social-preview.png'), { ...social, dark: false }, 1);
  await browser.close();
})();
