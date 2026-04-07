const { test, expect } = require('playwright/test');
const fs = require('fs');

const baseURL = 'http://127.0.0.1:9002';
const outputDir = '/tmp/digitantra-verify';

fs.mkdirSync(outputDir, { recursive: true });

async function getTidioState(page) {
  await page.waitForTimeout(8000);
  return page.evaluate(() => {
    const iframeSources = Array.from(document.querySelectorAll('iframe')).map((frame) => frame.src || '');
    return {
      hasTidioScript: Array.from(document.scripts).some((script) => script.src.includes('tidio')),
      tidioFrames: iframeSources.filter((src) => src.includes('tidio') || src.includes('code.tidio')).length,
      iframeSources,
    };
  });
}

async function openSaarthi(page) {
  const launcher = page.getByRole('button', { name: /open ai saarthi chat|ask on this page|close guide/i }).first();
  await expect(launcher).toBeVisible();
  await launcher.click();
  await page.waitForTimeout(1200);
}

test('visual verify home page', async ({ page }) => {
  await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: /open ai saarthi chat|ask on this page/i })).toBeVisible();
  await openSaarthi(page);
  await expect(page.getByText(/AI Saarthi/i).first()).toBeVisible();

  const tidio = await getTidioState(page);
  await page.screenshot({ path: `${outputDir}/home.png`, fullPage: true });

  console.log(JSON.stringify({ page: 'home', tidio }));
});

test('visual verify contact page excludes left launcher', async ({ page }) => {
  await page.goto(`${baseURL}/contact`, { waitUntil: 'networkidle' });
  await expect(page.getByText(/Chat with AI Saarthi/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /open ai saarthi chat|ask on this page/i })).toHaveCount(0);

  const tidio = await getTidioState(page);
  await page.screenshot({ path: `${outputDir}/contact.png`, fullPage: true });

  console.log(JSON.stringify({ page: 'contact', tidio }));
});

test('visual verify AI Enclave overview', async ({ page }) => {
  await page.goto(`${baseURL}/ai-enclave`, { waitUntil: 'networkidle' });
  await expect(page.getByText(/AI Enclave/i).first()).toBeVisible();
  await openSaarthi(page);
  await expect(page.getByText(/AI Saarthi/i).first()).toBeVisible();

  const tidio = await getTidioState(page);
  await page.screenshot({ path: `${outputDir}/ai-enclave.png`, fullPage: true });

  console.log(JSON.stringify({ page: 'ai-enclave', tidio }));
});

for (const slug of ['resume-builder', 'debug-helper']) {
  test(`visual verify ${slug} service page`, async ({ page }) => {
    await page.goto(`${baseURL}/ai-enclave/${slug}`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: /generate|analyze|recommend|optimize|summarize|explain/i }).first()).toBeVisible();
    await openSaarthi(page);
    await expect(page.getByText(/AI Saarthi/i).first()).toBeVisible();

    const tidio = await getTidioState(page);
    await page.screenshot({ path: `${outputDir}/${slug}.png`, fullPage: true });

    console.log(JSON.stringify({ page: slug, tidio }));
  });
}
