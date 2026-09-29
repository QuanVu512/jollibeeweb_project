const { startReportFixture } = require('./reportFixture.cjs');

startReportFixture().then(fixture => {
  let stopping = false;
  async function stop() {
    if (stopping) return; stopping = true;
    await fixture.stop(); process.exit(0);
  }
  process.once('SIGINT', () => stop().catch(error => { console.error(error); process.exit(1); }));
  process.once('SIGTERM', () => stop().catch(error => { console.error(error); process.exit(1); }));
  console.log(`REPORT_DEMO_URL=${fixture.url}/admin/report.html`);
  console.log('Demo tạm: reportadmin / ReportDemo123. Chọn 01/09/2026–03/09/2026. Doanh thu: 2.810.000 đ, 27 đơn hoàn thành.');
  console.log('Dữ liệu demo ở MongoDB riêng; Ctrl+C để dừng và dọn thư mục tạm.');
}).catch(error => { console.error(error); process.exitCode = 1; });
