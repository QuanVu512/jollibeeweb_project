const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { startReportFixture } = require('./reportFixture.cjs');

// Browser regression checks use a developer-supplied Playwright installation, never a remote service.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
async function main() {
  const fixture = await startReportFixture();
  let browser;
  let checks = 0;
  async function check(label, callback) { await callback(); checks += 1; console.log(`PASS ${label}`); }
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.REPORT_BROWSER_PATH || chromium.executablePath() });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const cookie = await fixture.login(); const [name, value] = cookie.split('=');
    await context.addCookies([{ name, value, url: fixture.url }]);
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => { errors.push(`Browser dialog: ${dialog.type()}`); dialog.dismiss(); });
    async function ready() { await page.waitForFunction(() => document.querySelector('#report-results').hidden === false && document.querySelector('#report-submit').disabled === false); }
    async function apply(from = '2026-09-01', to = '2026-09-03') {
      await page.locator('#from-date').fill(from); await page.locator('#to-date').fill(to);
      await page.locator('#report-submit').click(); await ready();
    }
    await page.goto(`${fixture.url}/admin/report.html`); await ready(); await apply();
    await check('revenue cards, SVG charts, table totals and comparison', async () => {
      assert.match(await page.locator('#report-metrics').innerText(), /2\.810\.000/);
      assert.match(await page.locator('#report-total').innerText(), /27 đơn/);
      assert.equal(await page.locator('#report-charts svg').count(), 2);
      assert.match(await page.locator('#report-comparison').innerText(), /28[,.]?[0-9]*|tăng/);
    });
    await check('applied filters remain the export source while date inputs are drafts', async () => {
      await page.locator('#from-date').fill('2030-01-01');
      const request = page.waitForRequest(request => request.url().includes('/reports/export'));
      const download = page.waitForEvent('download');
      await page.locator('#export-button').click(); const url = new URL((await request).url()); await download;
      assert.equal(url.searchParams.get('from'), '2026-09-01'); assert.equal(url.searchParams.get('type'), 'revenue');
      await page.waitForFunction(() => !document.querySelector('#export-button').disabled);
      await page.locator('#from-date').fill('2026-09-01');
    });
    await check('period list, nested order popup and keyboard Escape restore the parent', async () => {
      await page.locator('#report-table .report-row-link').first().click();
      await page.locator('#report-list-table .report-row-link').first().waitFor();
      assert.match(await page.locator('#report-list-total').innerText(), /185\.000/);
      await page.locator('#report-list-table .report-row-link').first().click();
      await page.locator('#report-order-content table').waitFor();
      assert.match(await page.locator('#report-order-content').innerText(), /Phí giao hàng/);
      await page.keyboard.press('Escape'); assert.equal(await page.locator('#report-list-dialog').evaluate(node => node.open), true);
      assert.equal(await page.locator('#report-order-dialog').evaluate(node => node.open), false);
      await page.keyboard.press('Escape');
    });
    await check('weekly and monthly grouping keep revenue equal', async () => {
      for (const group of ['week', 'month']) {
        await page.locator('#report-group').selectOption(group); await apply();
        assert.equal(await page.locator('#report-table tbody tr').count(), 1);
        assert.match(await page.locator('#report-total').innerText(), /2\.810\.000/);
      }
      await page.locator('#report-group').selectOption('day'); await apply();
    });
    await check('period popup paginates all contributing orders', async () => {
      await page.locator('#report-table .report-row-link').nth(1).click();
      await page.waitForFunction(() => document.querySelector('#report-list-total').textContent.includes('24 đơn'));
      await page.locator('#report-list-pagination').getByRole('button', { name: 'Sau', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('#report-list-pagination').textContent.includes('Trang 2/2'));
      assert.equal(await page.locator('#report-list-table tbody tr').count(), 4);
      await page.keyboard.press('Escape');
    });
    await check('transaction counts, sorting, search and pagination', async () => {
      await page.getByRole('tab', { name: 'Giao dịch', exact: true }).click(); await ready();
      assert.match(await page.locator('#report-total').innerText(), /27 đơn/);
      assert.equal(await page.locator('#report-table tbody tr').count(), 20);
      await page.locator('#report-pagination').getByRole('button', { name: 'Sau', exact: true }).click(); await ready();
      assert.equal(await page.locator('#report-table tbody tr').count(), 7);
      await page.locator('#report-table').getByRole('button', { name: /Tổng tiền/ }).click(); await ready();
      await page.locator('#report-table').getByRole('button', { name: /Tổng tiền/ }).click(); await ready();
      assert.match(await page.locator('#report-table tbody tr').first().innerText(), /80\.000/);
      await page.locator('#report-search').fill('0900000000'); await apply();
      assert.match(await page.locator('#report-total').innerText(), /4 đơn/);
      assert.match(await page.locator('#report-total').innerText(), /420\.000/);
      assert.equal(await page.locator('#report-payment').count(), 0);
      await page.locator('#report-search').fill(''); await apply();
      assert.match(await page.locator('#report-total').innerText(), /2\.810\.000/);
    });
    await check('customer ranking, duplicate names, anonymous group and customer drilldown', async () => {
      await page.getByRole('tab', { name: 'Khách hàng', exact: true }).click(); await ready();
      assert.match(await page.locator('#report-metrics').innerText(), /22/);
      assert.match(await page.locator('#report-guest').innerText(), /185\.000/);
      await page.locator('#report-pagination').getByRole('button', { name: 'Sau', exact: true }).click(); await ready();
      assert.equal(await page.locator('#report-table tbody tr').count(), 2);
      await page.locator('#report-pagination').getByRole('button', { name: 'Trước', exact: true }).click(); await ready();
      await page.locator('#report-table .report-row-link').first().click();
      await page.waitForFunction(() => document.querySelector('#report-list-total').textContent.includes('420.000'));
      await page.keyboard.press('Escape');
      await page.locator('#report-guest').getByRole('button', { name: 'Xem đơn khách lẻ' }).click();
      await page.waitForFunction(() => document.querySelector('#report-list-total').textContent.includes('185.000'));
      await page.keyboard.press('Escape');
      await page.locator('#report-search').fill('Nguyễn Văn An'); await apply();
      assert.equal(await page.locator('#report-table tbody tr').count(), 2);
      assert.match(await page.locator('#report-total').innerText(), /2 khách/);
      await page.locator('#report-search').fill(''); await apply();
    });
    await check('empty report preserves filters and zero results', async () => {
      await apply('2030-01-01', '2030-01-03');
      assert.equal(await page.locator('#report-empty').isVisible(), true);
      assert.match(await page.locator('#report-total').innerText(), /0 khách/);
      await apply();
    });
    await check('empty revenue keeps zero-day table and no fictitious percentage', async () => {
      await page.getByRole('tab', { name: 'Doanh thu', exact: true }).click(); await ready();
      await apply('2030-01-01', '2030-01-03');
      assert.equal(await page.locator('#report-table tbody tr').count(), 3);
      assert.equal(await page.locator('#report-empty').isVisible(), true);
      assert.match(await page.locator('#report-comparison').innerText(), /Chưa có cơ sở so sánh/);
      await apply(); await page.getByRole('tab', { name: 'Khách hàng', exact: true }).click(); await ready();
    });
    await check('server error hides old results and retry restores current report', async () => {
      const pattern = '**/api/v1/reports/customers?*';
      await page.route(pattern, route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Lỗi kiểm thử báo cáo' }) }));
      await page.locator('#report-submit').click(); await page.locator('#report-retry').waitFor();
      assert.equal(await page.locator('#report-results').isVisible(), false); assert.equal(await page.locator('#export-button').isDisabled(), true);
      await page.unroute(pattern); await page.locator('#report-retry').click(); await ready();
    });
    await check('late requests do not overwrite another tab', async () => {
      await page.route('**/api/v1/reports/summary?*', async route => {
        const response = await route.fetch(); await new Promise(resolve => setTimeout(resolve, 400));
        await route.fulfill({ response }).catch(() => {});
      });
      await page.getByRole('tab', { name: 'Doanh thu', exact: true }).click();
      await page.getByRole('tab', { name: 'Giao dịch', exact: true }).click(); await ready();
      await page.waitForTimeout(600); assert.match(await page.locator('#report-table-title').innerText(), /Giao dịch/i);
      await page.unroute('**/api/v1/reports/summary?*');
    });
    await check('keyboard tab navigation and quick date controls', async () => {
      await page.getByRole('tab', { name: 'Giao dịch', exact: true }).focus(); await page.keyboard.press('ArrowRight'); await ready();
      assert.equal(await page.getByRole('tab', { name: 'Khách hàng', exact: true }).getAttribute('aria-selected'), 'true');
      await page.getByRole('button', { name: '7 ngày gần nhất', exact: true }).click();
      const from = await page.locator('#from-date').inputValue(); const to = await page.locator('#to-date').inputValue();
      assert.equal((new Date(to) - new Date(from)) / 86400000, 6);
      await apply();
    });
    const directory = path.resolve(__dirname, '../../docs/report-verification'); await fs.mkdir(directory, { recursive: true });
    await page.getByRole('tab', { name: 'Doanh thu', exact: true }).click(); await ready();
    await page.screenshot({ path: path.join(directory, 'revenue-desktop.png'), fullPage: true });
    await check('mobile layout has no page overflow and nested dialogs remain usable', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(directory, 'revenue-mobile.png'), fullPage: true });
      await page.locator('#report-table .report-row-link').first().click();
      await page.locator('#report-list-table .report-row-link').first().waitFor();
      await page.locator('#report-list-table .report-row-link').first().click(); await page.locator('#report-order-content table').waitFor();
      assert.ok(await page.locator('#report-order-dialog').evaluate(node => node.getBoundingClientRect().right <= innerWidth));
      await page.locator('#report-order-dialog').evaluate(node => { node.scrollTop = node.scrollHeight; });
      assert.ok(await page.locator('.report-order-totals').evaluate(node => node.getBoundingClientRect().bottom <= document.querySelector('#report-order-dialog').getBoundingClientRect().bottom));
      await page.screenshot({ path: path.join(directory, 'order-mobile.png') });
      await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    });
    assert.deepEqual(errors, []); console.log(`PASS ${checks} browser scenarios; no runtime errors or browser dialogs.`);
  } finally { if (browser) await browser.close(); await fixture.stop(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
