#!/usr/bin/env node
/**
 * design-proposal-kit: HTML to A4 PDF renderer
 *
 * Usage: node scripts/render-pdf.cjs <input.html> [output.pdf] [preview.png]
 *
 * Renders at A4 with printBackground on, waits for fonts, then writes a PDF
 * and a full-page PNG preview next to it.
 */
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.error(
    'Playwright is not installed.\n' +
    'Run:  npm install  &&  npx playwright install chromium'
  );
  process.exit(1);
}

(async () => {
  const inHtml = process.argv[2];
  if (!inHtml) {
    console.error('Usage: node scripts/render-pdf.cjs <input.html> [out.pdf] [preview.png]');
    process.exit(1);
  }
  if (!fs.existsSync(inHtml)) {
    console.error('HTML file not found:', inHtml);
    process.exit(1);
  }

  const abs = path.resolve(inHtml);
  const dir = path.dirname(abs);
  const stem = path.basename(abs, path.extname(abs));
  const outPdf = process.argv[3] || path.join(dir, stem + '.pdf');
  const outPng = process.argv[4] || path.join(dir, '_' + stem + '-preview.png');

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 2,
  });

  const problems = [];
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  page.on('requestfailed', (req) => problems.push('failed to load: ' + req.url()));

  // pathToFileURL, not 'file://' + abs: escapes spaces and '#' in folder names.
  await page.goto(pathToFileURL(abs).href, { waitUntil: 'networkidle' });

  try {
    await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
  } catch (e) { /* fonts API unavailable, continue */ }
  await page.waitForTimeout(300);

  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: outPdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await page.screenshot({ path: outPng, fullPage: true });
  await browser.close();

  console.log('PDF     :', outPdf);
  console.log('Preview :', outPng);

  if (problems.length) {
    console.error('\nSomething did not load:');
    for (const p of problems) console.error('  -', p);
    console.error(
      '\nThe PDF was still written, but an image that fails to load renders as a\n' +
      'blank box and a missing stylesheet renders as unstyled text. Fix the paths\n' +
      'and render again. Look at the PDF either way.'
    );
    process.exitCode = 1;
  }
})();
