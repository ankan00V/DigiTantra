import fs from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';

const baseUrl = 'http://127.0.0.1:9002';
const outputDir = '/tmp/digitantra-verify';

const pages = [
  {
    slug: 'home',
    url: `${baseUrl}/`,
    openSaarthi: true,
  },
  {
    slug: 'contact',
    url: `${baseUrl}/contact`,
    openSaarthi: false,
  },
  {
    slug: 'ai-enclave',
    url: `${baseUrl}/ai-enclave`,
    openSaarthi: true,
  },
  {
    slug: 'resume-builder',
    url: `${baseUrl}/ai-enclave/resume-builder`,
    openSaarthi: true,
  },
  {
    slug: 'debug-helper',
    url: `${baseUrl}/ai-enclave/debug-helper`,
    openSaarthi: true,
  },
];

async function detectTidio(page) {
  await page.waitForTimeout(7000);

  const iframeSources = await page.locator('iframe').evaluateAll((iframes) =>
    iframes.map((frame) => frame.getAttribute('src') || '')
  );

  const hasTidioFrame = iframeSources.some((src) => src.includes('tidio') || src.includes('code.tidio'));
  const hasTidioScript = await page.evaluate(() =>
    Array.from(document.scripts).some((script) => script.src.includes('tidio'))
  );

  const bottomRightHit = await page.evaluate(() => {
    const x = Math.max(window.innerWidth - 40, 1);
    const y = Math.max(window.innerHeight - 40, 1);
    const elements = document.elementsFromPoint(x, y);
    return elements.some((element) => {
      const text = (element.textContent || '').toLowerCase();
      const aria = (element.getAttribute('aria-label') || '').toLowerCase();
      const cls = (element.className || '').toString().toLowerCase();
      return text.includes('chat') || aria.includes('chat') || cls.includes('tidio');
    });
  });

  return {
    bottomRightHit,
    hasTidioFrame,
    hasTidioScript,
    iframeSources,
  };
}

async function openSaarthiIfPresent(page) {
  const launcher = page.getByRole('button', { name: /open ai saarthi chat|ask on this page|close guide/i }).first();
  const visible = await launcher.isVisible().catch(() => false);

  if (!visible) {
    return false;
  }

  await launcher.click();
  await page.waitForTimeout(1200);
  return true;
}

async function detectLeftLauncher(page) {
  return page
    .getByRole('button', { name: /open ai saarthi chat|ask on this page|close guide/i })
    .isVisible()
    .catch(() => false);
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 980 },
  });

  const page = await context.newPage();
  const report = [];

  for (const entry of pages) {
    await page.goto(entry.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);

    const hasLeftLauncher = await detectLeftLauncher(page);
    const saarthiOpened = entry.openSaarthi ? await openSaarthiIfPresent(page) : false;
    const tidio = await detectTidio(page);

    const screenshotPath = path.join(outputDir, `${entry.slug}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    report.push({
      slug: entry.slug,
      url: entry.url,
      screenshotPath,
      hasLeftLauncher,
      saarthiOpened,
      tidio,
      title: await page.title(),
    });
  }

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
