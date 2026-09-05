document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#report-form');
  const exportButton = document.querySelector('#export-button');
  const revenueElement = document.querySelector('#total-revenue');
  const orderElement = document.querySelector('#completed-orders');
  const topItemElement = document.querySelector('#top-item');
  const topItemNote = document.querySelector('#top-item-note');
  const { showToast, formatCurrency, initAdminPage } = window.AdminCommon;

  function queryFromForm(includeType = false) {
    const data = new FormData(form);
    const query = new URLSearchParams();
    if (data.get('from')) query.set('from', data.get('from'));
    if (data.get('to')) query.set('to', data.get('to'));
    if (includeType) query.set('type', data.get('type'));
    return query;
  }

  async function loadSummary() {
    const payload = await window.AdminApi.request(`/reports/summary?${queryFromForm()}`);
    const report = payload.data;
    revenueElement.textContent = formatCurrency(report.totalRevenue);
    orderElement.textContent = new Intl.NumberFormat('vi-VN').format(report.completedOrders);
    topItemElement.textContent = report.topItem?.name || 'Chưa có dữ liệu';
    topItemNote.textContent = `Đã bán: ${report.topItem?.quantity || 0} phần`;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await loadSummary();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  exportButton.addEventListener('click', async () => {
    exportButton.disabled = true;
    exportButton.textContent = 'Đang tạo file...';
    try {
      await window.AdminApi.downloadReport(queryFromForm(true).toString());
      showToast('Đã tạo báo cáo Excel.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      exportButton.disabled = false;
      exportButton.textContent = 'Xuất Excel';
    }
  });

  try {
    await initAdminPage();
    await loadSummary();
  } catch (error) {
    showToast(error.message, 'error');
  }
});
