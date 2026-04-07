const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = 'http://127.0.0.1:9002';
const outputDir = '/tmp/digitantra-verify';

const pages = [
  { slug: 'home', url: `${baseUrl}/`, openSaarthi: true, expectLeft: true },
  { slug: 'contact', url: `${baseUrl}/contact`, openSaarthi: false, expectLeft: false },
  { slug: 'ai-enclave', url: `${baseUrl}/ai-enclave`, openSaarthi: true, expectLeft: true },
  { slug: 'resume-builder', url: `${baseUrl}/ai-enclave/resume-builder`, openSaarthi: true, expectLeft: true },
  { slug: 'debug-helper', url: `${baseUrl}/ai-enclave/debug-helper`, openSaarthi: true, expectLeft: true },
];

async function getTidioState(page) {
  await page.waitForTimeout(9000);
  return page.evaluate(() => {
    const iframeSources = Array.from(document.querySelectorAll('iframe')).map((frame) => frame.src || '');
    return {
      hasTidioScript: Array.from(document.scripts).some((script) => (script.src || '').includes('tidio')),
      tidioFrames: iframeSources.filter((src) => src.includes('tidio') || src.includes('code.tidio')).length,
      iframeSources,
    };
  });
}

async function getLeftLauncher(page) {
  return page.getByRole('button', { name: /open ai saarthi chat|ask on this page|close guide/i }).first();
}

async function getVisible(locator) {
  try {
    return await locator.isVisible();
  } catch {
    return false;
  }
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 980 },
  });
  const page = await context.newPage();

  const report = [];

  for (const entry of pages) {
    await page.goto(entry.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);

    const leftLauncher = await getLeftLauncher(page);
    const hasLeftLauncher = await getVisible(leftLauncher);

    let saarthiOpened = false;
    if (entry.openSaarthi && hasLeftLauncher) {
      await leftLauncher.click();
      await page.waitForTimeout(1200);
      saarthiOpened = await getVisible(page.getByText(/AI Saarthi/i).first());
    }

    const tidio = await getTidioState(page);
    const screenshotPath = path.join(outputDir, `${entry.slug}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    report.push({
      slug: entry.slug,
      url: entry.url,
      title: await page.title(),
      expectLeft: entry.expectLeft,
      hasLeftLauncher,
      saarthiOpened,
      tidio,
      screenshotPath,
    });
  }

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
