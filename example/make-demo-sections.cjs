#!/usr/bin/env node
/**
 * Builds the worked example's bundles and fills their inboxes.
 *
 * This script stands in for the human step in the middle of the chain. In a real
 * project you paste each bundle into an image chat and drop what comes back into
 * that bundle's images/ inbox. Here, the images are plain HTML sections
 * screenshotted at 1440px and written straight into those inboxes, so phase 2
 * has real input without anyone generating anything.
 *
 * Two things are deliberate:
 *
 * - The photo areas are flat colour blocks. They are obviously placeholders.
 *   This demo is about the pipeline, not about the pictures.
 * - Every section carries the navigation bar, not just the hero. The system
 *   prompt asks the model for a nav on the hero only, and models routinely
 *   repeat it anyway. That is the whole reason stack-sections.sh can crop, so
 *   the example reproduces the realistic case and the crop actually runs.
 *
 * Usage: node example/make-demo-sections.cjs
 */
const path = require('path');
const fs = require('fs');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.error('Playwright missing. Run: npm install && npx playwright install chromium');
  process.exit(1);
}

const BUNDLES = path.join(__dirname, 'bundles');

// The key is the bundle slug, so each direction's images land in
// bundles/<slug>/images/, exactly where scripts/stack-direction.sh looks.
const DIRECTIONS = {
  'warm-and-playful': {
    letter: 'a',
    name: 'Warm and playful',
    paper: '#F6EFE4', ink: '#2E241C', body: '#6B5B4B',
    accent: '#B4552D', accentInk: '#FFFFFF',
    photo: '#C98A5E', photo2: '#8A6A4F',
    head: 'Georgia, "Times New Roman", serif',
    text: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    radius: '14px', navBg: '#F6EFE4',
  },
  'bright-and-photographic': {
    letter: 'b',
    name: 'Bright and photographic',
    paper: '#FFFFFF', ink: '#14181A', body: '#5A6468',
    accent: '#1F6F4A', accentInk: '#FFFFFF',
    photo: '#8FA9A0', photo2: '#5F7A72',
    head: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    text: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    radius: '4px', navBg: '#FFFFFF',
  },
  'bold-and-colourful': {
    letter: 'c',
    name: 'Bold and colourful',
    paper: '#12100F', ink: '#F7F3EC', body: '#B9B0A4',
    accent: '#E8B33C', accentInk: '#12100F',
    photo: '#3A3330', photo2: '#575049',
    head: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    text: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    radius: '0px', navBg: '#12100F',
  },
};

// Identical across directions so one -c value fits the whole example.
const NAV_H = 76;

function shell(d, inner) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{width:1440px;background:${d.paper};color:${d.ink};font-family:${d.text};
    -webkit-font-smoothing:antialiased;}
  .nav{height:${NAV_H}px;background:${d.navBg};display:flex;align-items:center;
    justify-content:space-between;padding:0 56px;border-bottom:1px solid rgba(128,128,128,0.18);}
  .brand{font-family:${d.head};font-weight:700;font-size:20px;letter-spacing:0.01em;color:${d.ink};}
  .brand span{color:${d.accent};}
  .links{display:flex;gap:34px;align-items:center;}
  .links a{font-size:14px;color:${d.body};text-decoration:none;}
  .btn{background:${d.accent};color:${d.accentInk};padding:11px 20px;border-radius:${d.radius};
    font-size:14px;font-weight:600;}
  .btn.ghost{background:transparent;color:${d.ink};border:1px solid ${d.ink};}
  .wrap{padding:0 56px;}
  h1{font-family:${d.head};font-size:60px;line-height:1.04;font-weight:700;letter-spacing:-0.01em;}
  h2{font-family:${d.head};font-size:38px;line-height:1.1;font-weight:700;}
  h3{font-family:${d.head};font-size:19px;line-height:1.25;font-weight:700;}
  p{font-size:16px;line-height:1.65;color:${d.body};}
  .eyebrow{font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${d.accent};
    font-weight:700;}
  .ph{background:${d.photo};border-radius:${d.radius};position:relative;overflow:hidden;}
  .ph::after{content:"";position:absolute;left:0;right:0;bottom:0;height:42%;background:${d.photo2};}
  .card{background:${d.photo};border-radius:${d.radius};padding:26px;}
  </style></head><body>${nav(d)}${inner}</body></html>`;
}

function nav(d) {
  return `<div class="nav">
    <div class="brand">Northwind<span>.</span> Coffee Roasters</div>
    <div class="links">
      <a>Beans</a><a>Our roastery</a><a>Wholesale</a><a>Visit</a>
      <span class="btn">Order beans</span>
    </div>
  </div>`;
}

// --- section 1: hero -------------------------------------------------------
function hero(d, key) {
  if (key === 'a') {
    // centred statement, wide image below
    return shell(d, `<div class="wrap" style="padding-top:74px;text-align:center;">
      <div class="eyebrow">Roasted in small batches since 2011</div>
      <h1 style="margin:18px auto 0;max-width:880px;">Coffee that tastes<br>like somewhere.</h1>
      <p style="margin:20px auto 0;max-width:600px;font-size:18px;">
        We buy from farms we have visited, roast in batches of twelve kilos, and
        ship the week it is roasted.</p>
      <div style="display:flex;gap:14px;justify-content:center;margin-top:28px;">
        <span class="btn">Order beans</span><span class="btn ghost">Visit the roastery</span>
      </div>
      <div class="ph" style="height:360px;margin-top:52px;"></div>
    </div><div style="height:74px;"></div>`);
  }
  if (key === 'b') {
    // asymmetric split, not 50/50
    return shell(d, `<div style="display:grid;grid-template-columns:1.15fr 1fr;gap:64px;
      padding:88px 56px;align-items:center;">
      <div>
        <div class="eyebrow">Small batch roastery</div>
        <h1 style="margin-top:18px;">Coffee that tastes like somewhere.</h1>
        <p style="margin-top:22px;max-width:460px;">
          We buy from farms we have visited, roast in batches of twelve kilos,
          and ship the week it is roasted.</p>
        <div style="display:flex;gap:14px;margin-top:30px;">
          <span class="btn">Order beans</span><span class="btn ghost">Visit the roastery</span>
        </div>
      </div>
      <div class="ph" style="height:440px;"></div>
    </div>`);
  }
  // c: full-bleed dark statement
  return shell(d, `<div style="padding:104px 56px 96px;">
    <div class="eyebrow">Small batch roastery</div>
    <h1 style="margin-top:20px;max-width:900px;font-size:74px;">
      Coffee that tastes like <span style="color:${d.accent}">somewhere</span>.</h1>
    <p style="margin-top:24px;max-width:520px;font-size:18px;">
      We buy from farms we have visited, roast in batches of twelve kilos, and
      ship the week it is roasted.</p>
    <div style="display:flex;gap:14px;margin-top:34px;">
      <span class="btn">Order beans</span>
      <span class="btn" style="background:transparent;color:${d.ink};border:1px solid ${d.body};">
        Visit the roastery</span>
    </div>
  </div>`);
}

// --- section 2: the beans --------------------------------------------------
function beans(d, key) {
  const items = [
    ['Ethiopia · Guji', 'Peach, jasmine, black tea. Light roast.'],
    ['Colombia · Huila', 'Cocoa, red apple, brown sugar. Medium.'],
    ['Sumatra · Aceh', 'Cedar, molasses, tobacco. Dark roast.'],
  ];
  const cards = items.map(([t, s]) => `
    <div>
      <div class="ph" style="height:220px;"></div>
      <h3 style="margin-top:16px;">${t}</h3>
      <p style="margin-top:6px;font-size:14px;">${s}</p>
    </div>`).join('');

  if (key === 'c') {
    const tiles = items.map(([t, s], i) => {
      const bg = [d.accent, '#C4553A', '#4F7A5B'][i];
      const fg = i === 0 ? d.accentInk : '#FFFFFF';
      return `<div class="card" style="background:${bg};color:${fg};min-height:250px;
        display:flex;flex-direction:column;justify-content:flex-end;">
        <h3 style="color:${fg}">${t}</h3>
        <p style="margin-top:6px;font-size:14px;color:${fg};opacity:.9;">${s}</p>
      </div>`;
    }).join('');
    return shell(d, `<div class="wrap" style="padding-top:82px;padding-bottom:82px;">
      <div class="eyebrow">What we are roasting now</div>
      <h2 style="margin-top:14px;max-width:640px;">Three beans. Changed when the season changes.</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:44px;">${tiles}</div>
    </div>`);
  }
  return shell(d, `<div class="wrap" style="padding-top:82px;padding-bottom:82px;">
    <div style="${key === 'a' ? 'text-align:center;' : ''}">
      <div class="eyebrow">What we are roasting now</div>
      <h2 style="margin-top:14px;${key === 'a' ? 'margin-left:auto;margin-right:auto;' : ''}
        max-width:640px;">Three beans. Changed when the season changes.</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;margin-top:44px;">${cards}</div>
  </div>`);
}

// --- section 3: visit ------------------------------------------------------
function visit(d, key) {
  if (key === 'b') {
    return shell(d, `<div style="display:grid;grid-template-columns:1fr 1.1fr;gap:0;">
      <div style="padding:88px 56px;">
        <div class="eyebrow">Come by</div>
        <h2 style="margin-top:14px;">The roastery is open<br>on Saturdays.</h2>
        <p style="margin-top:20px;max-width:420px;">
          We roast Tuesday to Friday and open the door on Saturday morning. Come
          taste what came off the drum that week. No booking, no fee.</p>
        <div style="margin-top:28px;"><span class="btn">Find us</span></div>
      </div>
      <div class="ph" style="min-height:420px;border-radius:0;"></div>
    </div>`);
  }
  return shell(d, `<div class="wrap" style="padding-top:82px;padding-bottom:88px;">
    <div class="ph" style="height:300px;"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:56px;margin-top:40px;
      align-items:start;">
      <div>
        <div class="eyebrow">Come by</div>
        <h2 style="margin-top:14px;">The roastery is open on Saturdays.</h2>
      </div>
      <div>
        <p>We roast Tuesday to Friday and open the door on Saturday morning. Come
          taste what came off the drum that week. No booking, no fee.</p>
        <div style="margin-top:22px;"><span class="btn">Find us</span></div>
      </div>
    </div>
  </div>`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const [slug, d] of Object.entries(DIRECTIONS)) {
    const inbox = path.join(BUNDLES, slug, 'images');
    fs.mkdirSync(inbox, { recursive: true });

    const sections = [
      ['1-hero', hero(d, d.letter)],
      ['2-beans', beans(d, d.letter)],
      ['3-visit', visit(d, d.letter)],
    ];
    for (const [name, html] of sections) {
      await page.setContent(html, { waitUntil: 'networkidle' });
      const el = await page.$('body');
      const file = path.join(inbox, `${name}.png`);
      await el.screenshot({ path: file });
      console.log('wrote', path.relative(process.cwd(), file));
    }
  }
  await browser.close();

  console.log(`\nEvery section carries the ${NAV_H}px navigation, the way a real`);
  console.log('image chat tends to return them. Phase 2 crops it off everything');
  console.log(`after the hero:  ./scripts/stack-direction.sh -c ${NAV_H} example/bundles/<slug>`);
})();
