import { mkdir, writeFile } from 'node:fs/promises';
const playwrightModule =
  process.env.PLAYWRIGHT_MODULE ||
  (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
    ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright/index.mjs'
    : 'playwright');
const { chromium } = await import(playwrightModule);
const url = process.env.TEST_URL || 'http://127.0.0.1:4175/';
const output = process.env.QA_DIR || 'test-results/menu';
await mkdir(output, { recursive: true });
const samples = [
  [320, 480],
  [320, 500],
  [320, 540],
  [360, 520],
  [360, 560],
  [320, 568],
  [360, 640],
  [375, 667],
  [390, 700],
  [320, 721],
  [320, 735],
  [360, 740],
  [375, 736],
  [390, 721],
  [390, 780],
  [390, 844],
  [412, 915],
  [430, 932],
  [480, 320],
  [520, 320],
  [568, 280],
  [568, 320],
  [640, 360],
  [667, 375],
  [740, 360],
  [844, 390],
  [320, 861],
  [393, 852, { top: 59, bottom: 34 }],
  [375, 812, { top: 50, bottom: 34 }],
  [390, 844, { top: 47, bottom: 34 }],
  [844, 390, { left: 47, right: 47, bottom: 21 }],
  [360, 740, { top: 24, bottom: 24 }],
  [768, 740],
  [768, 1024],
  [1024, 768],
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [3440, 1440],
];
const results = [],
  pageErrors = [];
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
});
try {
  for (const [width, height, insets] of samples) {
    const mobile = width < 768 || (width < 900 && height < 500);
    const page = await browser.newPage({
      viewport: { width, height },
      isMobile: mobile,
      hasTouch: mobile,
      reducedMotion: 'reduce',
    });
    if (insets) {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets });
    }
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    for (const lang of ['it', 'en', 'de', 'fr']) {
      await page
        .getByRole('button', { name: lang.toUpperCase(), exact: true })
        .click();
      await page.waitForFunction(
        (l) => document.documentElement.lang === l,
        lang,
      );
      await page.evaluate(() => document.fonts.ready);
      const fit = await page.evaluate(async () => {
        const entries = [
          ...document.querySelectorAll('#carta .item button.nome'),
        ];
        if (entries.length !== 85) throw Error('Expected all 70 food and 15 drink entries');
        const modalSelector = 'dialog.modal-allergens[open]';
        function waitUntil(condition) {
          if (condition()) return Promise.resolve();
          return new Promise((resolve, reject) => {
            const observer = new MutationObserver(() => {
              if (condition()) {
                clearTimeout(timer);
                observer.disconnect();
                resolve();
              }
            });
            const timer = setTimeout(() => {
              observer.disconnect();
              reject(
                new Error('The native dialog did not reach its expected state'),
              );
            }, 5000);
            observer.observe(document.body, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ['open'],
            });
          });
        }
        let bad = 0,
          minGap = Infinity,
          worstTitle = '',
          maxY = 0,
          maxX = 0,
          minEdge = Infinity;
        for (const button of entries) {
          button.click();
          await waitUntil(() => document.querySelector(modalSelector));
          const dialog = document.querySelector(modalSelector);
          const title = dialog.querySelector('h2').textContent;
          if (title.trim() !== button.textContent.trim())
            throw Error('Wrong title: ' + title + ' / ' + button.textContent);
          const top = dialog
            .querySelector('.modal-header')
            .getBoundingClientRect().top;
          const bottom = dialog
            .querySelector('.allergen-note')
            .getBoundingClientRect().bottom;
          const width = window.visualViewport.width,
            height = window.visualViewport.height;
          const rect = dialog.getBoundingClientRect();
          const x = Math.max(
            0,
            dialog.scrollWidth - dialog.clientWidth,
            rect.right - width,
            -rect.left,
          );
          const y = Math.max(0, dialog.scrollHeight - dialog.clientHeight);
          const margin = height - (bottom - top);
          if (dialog.querySelectorAll('li').length !== 15)
            throw Error('Wrong row count');
          const cols = Array.from(
            dialog.querySelectorAll('.allergen-text'),
            (t) => t.getBoundingClientRect(),
          );
          const contentInside = cols.every(
            (r) =>
              r.left >= -0.1 &&
              r.right <= width + 0.1 &&
              r.top >= -0.1 &&
              r.bottom <= height + 0.1,
          );
          if (
            x > 1 ||
            y > 1 ||
            top < -0.1 ||
            bottom > height + 0.1 ||
            !contentInside
          )
            bad += 1;
          if (margin < minGap) {
            minGap = margin;
            worstTitle = title;
          }
          minEdge = Math.min(minEdge, top, height - bottom);
          maxY = Math.max(maxY, y, bottom - height);
          maxX = Math.max(maxX, x);
          dialog.querySelector('.modal-close').click();
          await waitUntil(() => !document.querySelector(modalSelector));
        }
        return {
          count: entries.length,
          bad,
          minGap: +minGap.toFixed(2),
          minEdge: +minEdge.toFixed(2),
          maxY: +maxY.toFixed(2),
          maxX,
          worstTitle,
        };
      });
      results.push({ width, height, insets, lang, ...fit });
    }
    console.log(
      [
        width,
        height,
        insets ? 'with safe areas' : 'plain',
        'count',
        results.at(-1).count,
        'failures',
        results.slice(-4).map((r) => r.bad),
        'worst scroll',
        Math.max(...results.slice(-4).map((r) => r.maxY)),
      ].join(' '),
    );
    await page.close();
  }
} finally {
  await writeFile(
    output + '/dialog-fit.json',
    JSON.stringify(
      { chromium: browser.version(), pageErrors, results },
      null,
      2,
    ),
  );
  await browser.close();
}

const failures = results.filter((r) => r.bad);
if (pageErrors.length || failures.length) {
  console.error({ pageErrors, failures });
  process.exitCode = 1;
} else {
  console.log(
    'DIALOG_VIEWPORT_OK',
    results.reduce((count, r) => count + r.count, 0),
    'menu dialogs checked',
  );
}
