const { chromium } = require('playwright');

const baseUrl = 'http://127.0.0.1:9002';

async function verifyService(page, slug, buttonName) {
  await page.goto(`${baseUrl}/ai-enclave/${slug}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);

  const button = page.getByRole('button', { name: buttonName }).first();
  await button.click();

  await page.waitForFunction(
    () => !document.body.innerText.includes('This panel will show the generated result'),
    { timeout: 60000 }
  );

  const bodyText = await page.locator('body').innerText();
  return {
    title: await page.title(),
    snippet: bodyText.slice(0, 400),
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });

  const results = [];
  results.push({
    slug: 'resume-builder',
    ...(await verifyService(page, 'resume-builder', /Generate Resume Draft/i)),
  });
  results.push({
    slug: 'debug-helper',
    ...(await verifyService(page, 'debug-helper', /Analyze Issue/i)),
  });

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
