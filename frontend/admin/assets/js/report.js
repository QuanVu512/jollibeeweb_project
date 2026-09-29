document.addEventListener('DOMContentLoaded', async () => {
  const $ = selector => document.querySelector(selector);
  const form = $('#report-form');
  const results = $('#report-results');
  const status = $('#report-status');
  const retry = $('#report-retry');
  const submit = $('#report-submit');
  const exportButton = $('#export-button');
  const listDialog = $('#report-list-dialog');
  const orderDialog = $('#report-order-dialog');
  const { showToast, formatCurrency: money, initAdminPage } = window.AdminCommon;
  const num = value => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value);
  const date = value => value ? new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short', hourCycle: 'h23' }).format(new Date(value)) : '—';
  const day = value => value.split('-').reverse().join('/');
  const paymentLabels = { paid: 'Đã thanh toán', unpaid: 'Chưa thanh toán', refunded: 'Hoàn tiền' };
  const methodLabels = { cash: 'Tiền mặt', card: 'Thẻ', e_wallet: 'Ví điện tử', cod: 'COD' };
  const typeLabels = { dine_in: 'Tại bàn', pickup: 'Mang đi', delivery: 'Giao hàng' };
  const names = { revenue: 'Doanh thu', orders: 'Giao dịch', customers: 'Khách hàng' };
  let tab = 'revenue';
  let committed;
  let attempted;
  let successful;
  let page = 1;
  let sortBy = 'period';
  let sortDir = 'desc';
  let data;
  let mainRequest;
  let generation = 0;
  let loading = false;
  let exporting = false;
  let listState;
  let listRequest;
  let listGeneration = 0;
  let orderId;
  let orderRequest;
  let orderGeneration = 0;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function button(text, callback, className = 'btn btn-secondary') {
    const node = element('button', text, className); node.type = 'button'; node.addEventListener('click', callback); return node;
  }
  function link(text, callback) { return button(text, callback, 'report-row-link'); }
  function payment(value) { return element('span', paymentLabels[value] || 'Chưa xác định', `report-payment ${value || ''}`); }
  function updateBusy() {
    submit.disabled = loading || exporting;
    exportButton.disabled = loading || exporting || !successful;
    exportButton.textContent = exporting ? 'Đang tạo file...' : 'Xuất Excel';
    results.setAttribute('aria-busy', String(loading));
  }
  function metrics(rows) {
    const root = $('#report-metrics'); root.replaceChildren();
    rows.forEach(([label, value, note], index) => {
      const card = element('article', undefined, `metric-card ${['green', 'blue', 'orange', 'green'][index]}`);
      const content = element('div'); content.append(element('h2', label), element('div', value, 'metric-value'), element('div', note || '', 'metric-note'));
      card.append(content); root.append(card);
    });
  }
  function chart(title, render) {
    const card = element('section', undefined, 'card report-chart'); card.append(element('h2', title));
    const root = element('div'); card.append(root); $('#report-charts').append(card); render(root);
  }
  function table(root, headers, rows, onSort) {
    const tableNode = element('table'); const head = element('thead'); const headerRow = element('tr');
    headers.forEach(([label, key]) => {
      const th = element('th'); th.scope = 'col';
      if (key && onSort) {
        th.setAttribute('aria-sort', sortBy === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none');
        th.append(button(`${label}${sortBy === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}`, () => onSort(key), 'report-sort'));
      } else th.textContent = label;
      headerRow.append(th);
    });
    head.append(headerRow); const body = element('tbody');
    rows.forEach(values => {
      const row = element('tr'); values.forEach(value => { const td = element('td'); if (value instanceof Node) td.append(value); else td.textContent = value ?? '—'; row.append(td); }); body.append(row);
    });
    if (!rows.length) { const row = element('tr'); const td = element('td', 'Không có dữ liệu phù hợp.', 'empty-cell'); td.colSpan = headers.length; row.append(td); body.append(row); }
    tableNode.append(head, body); root.replaceChildren(tableNode);
  }
  function pager(root, pagination, change) {
    root.replaceChildren();
    if (!pagination.total) return;
    const previous = button('Trước', () => change(pagination.page - 1)); previous.disabled = pagination.page <= 1;
    const next = button('Sau', () => change(pagination.page + 1)); next.disabled = pagination.page >= pagination.totalPages;
    root.append(previous, element('span', `Trang ${pagination.page}/${pagination.totalPages} · ${num(pagination.total)} dòng`), next);
  }
  function sort(key) {
    sortDir = sortBy === key && sortDir === 'desc' ? 'asc' : 'desc'; sortBy = key; page = 1;
    if (tab === 'revenue') { renderRevenueTable(); successful.query = { ...successful.query, sortBy, sortDir }; }
    else load({ ...committed, sortBy, sortDir });
  }
  function transactionRows(items) {
    return items.map(row => [link(row.orderCode, () => openOrder(row._id)), date(row.completedAt),
      row.customerName || 'Khách lẻ', typeLabels[row.orderType] || row.orderType,
      methodLabels[row.payment?.method] || '—', payment(row.payment?.status), money(row.total)]);
  }
  const transactionHeaders = [['Mã đơn', 'orderCode'], ['Hoàn thành', 'completedAt'], ['Khách hàng', 'customerName'], ['Loại đơn'], ['Phương thức'], ['Thanh toán'], ['Tổng tiền', 'total']];

  function renderRevenueTable() {
    const rows = [...data.series].sort((a, b) => {
      const value = sortBy === 'period' ? a.period.localeCompare(b.period) : a[sortBy] - b[sortBy];
      return sortDir === 'asc' ? value : -value;
    });
    table($('#report-table'), [['Kỳ', 'period'], ['Đơn hoàn thành', 'completedOrders'], ['Doanh thu', 'totalRevenue'], ['Đơn trung bình', 'averageOrderValue']],
      rows.slice((page - 1) * 20, page * 20).map(row => [link(row.from === row.to ? day(row.from) : `${day(row.from)} – ${day(row.to)}`,
        () => openList(`Đơn đóng góp doanh thu: ${day(row.from)} – ${day(row.to)}`, { from: row.from, to: row.to })),
      num(row.completedOrders), money(row.totalRevenue), money(row.averageOrderValue)]), sort);
    pager($('#report-pagination'), { page, total: rows.length, totalPages: Math.ceil(rows.length / 20) }, value => { page = value; renderRevenueTable(); });
  }
  function renderRevenue() {
    metrics([['Tổng doanh thu', money(data.totalRevenue), 'Gồm phí giao hàng, đã trừ giảm giá'],
      ['Đơn hoàn thành', num(data.completedOrders), 'Theo ngày hoàn thành trong kỳ'],
      ['Giá trị đơn trung bình', money(data.averageOrderValue), 'Doanh thu / số đơn hoàn thành'],
      ['Món bán chạy nhất', data.topItem?.name || 'Chưa có dữ liệu', `Đã bán: ${num(data.topItem?.quantity || 0)} phần`]]);
    const comparison = data.comparison;
    $('#report-comparison').hidden = false;
    $('#report-comparison').textContent = `${comparison.changePercent === null ? 'Chưa có cơ sở so sánh' : `Doanh thu ${comparison.changePercent >= 0 ? 'tăng' : 'giảm'} ${Math.abs(comparison.changePercent).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`} so với kỳ ${day(comparison.from)} – ${day(comparison.to)} (${money(comparison.totalRevenue)}).`;
    chart('Doanh thu theo thời gian', root => window.ReportCharts.line(root, data.series, 'Doanh thu theo thời gian'));
    chart('Top 5 món bán chạy', root => {
      window.ReportCharts.bars(root, data.topItems.map(row => ({ label: row.name, value: row.quantity })), 'Top 5 món bán chạy');
      const note = element('p', data.topItems.length ? data.topItems.map(row => `${row.name}: ${num(row.quantity)} phần`).join(' · ') : 'Chưa có món bán trong kỳ.', 'field-note'); root.append(note);
    });
    $('#report-table-title').textContent = 'Doanh thu theo kỳ · bấm kỳ để xem đơn';
    $('#report-total').textContent = `Tổng kỳ: ${num(data.completedOrders)} đơn · ${money(data.totalRevenue)} · Đơn trung bình ${money(data.averageOrderValue)}`;
    $('#report-empty').hidden = data.completedOrders > 0;
    renderRevenueTable();
  }
  function renderTransactions() {
    const overview = data.overview;
    metrics([['Đơn hoàn thành', num(overview.totalOrders), 'Theo bộ lọc đang áp dụng'], ['Đã thanh toán', num(overview.paidOrders), 'Trạng thái ghi nhận hiện tại'],
      ['Chưa thanh toán', num(overview.unpaidOrders), 'Trạng thái ghi nhận hiện tại'], ['Hoàn tiền', num(overview.refundedOrders), 'Trạng thái ghi nhận hiện tại']]);
    chart('Đơn theo trạng thái thanh toán', root => window.ReportCharts.bars(root, ['paid', 'unpaid', 'refunded'].map((key, index) => ({
      label: paymentLabels[key], value: [overview.paidOrders, overview.unpaidOrders, overview.refundedOrders][index] })), 'Số đơn theo trạng thái thanh toán'));
    $('#report-table-title').textContent = 'Giao dịch hoàn thành · bấm mã đơn để xem chi tiết';
    table($('#report-table'), transactionHeaders, transactionRows(data.items), sort);
    $('#report-total').textContent = `Tổng bộ lọc: ${num(overview.totalOrders)} đơn · Doanh thu đơn hoàn thành: ${money(overview.totalRevenue)}`;
    $('#report-empty').hidden = overview.totalOrders > 0;
    pager($('#report-pagination'), data.pagination, value => { page = value; load(committed); });
  }
  function renderCustomers() {
    const { overview, guest } = data;
    metrics([['Khách hàng có mua', num(overview.customerCount), 'Khách có hồ sơ, đơn hoàn thành'],
      ['Chi tiêu khách có hồ sơ', money(overview.totalSpent), `${num(overview.orders)} đơn đủ điều kiện`],
      ['Đơn khách lẻ', num(guest.orders), 'Không tính vào số khách có hồ sơ'], ['Doanh thu khách lẻ', money(guest.totalSpent), 'Đơn hoàn thành trong kỳ']]);
    chart('Top 5 khách hàng theo chi tiêu', root => window.ReportCharts.bars(root, data.topCustomers.map(row => ({
      label: `${row.customerCode || 'Không còn mã'} · ${row.fullName}`, value: row.totalSpent })), 'Top 5 khách hàng theo chi tiêu', money));
    $('#report-table-title').textContent = 'Khách hàng có mua · bấm khách để xem đơn';
    table($('#report-table'), [['Mã khách'], ['Họ tên', 'fullName'], ['Điện thoại'], ['Số đơn', 'orders'], ['Tổng chi tiêu', 'totalSpent'], ['Đơn trung bình'], ['Gần nhất trong kỳ', 'lastCompletedAt']],
      data.items.map(row => [row.customerCode || '—', link(row.fullName, () => openList(`Đơn của ${row.fullName}`, { from: committed.from, to: committed.to, customerId: row._id })),
        row.phone || '—', num(row.orders), money(row.totalSpent), money(row.averageOrderValue), date(row.lastCompletedAt)]), sort);
    $('#report-total').textContent = `Khách có hồ sơ: ${num(overview.customerCount)} khách · ${num(overview.orders)} đơn · ${money(overview.totalSpent)}. Cộng khách lẻ: ${money(overview.totalSpent + guest.totalSpent)}.`;
    $('#report-empty').hidden = overview.customerCount > 0 || guest.orders > 0;
    pager($('#report-pagination'), data.pagination, value => { page = value; load(committed); });
    const guestRoot = $('#report-guest'); guestRoot.hidden = false;
    guestRoot.replaceChildren(element('h2', 'Khách lẻ', 'card-title'), element('p', `${num(guest.orders)} đơn · ${money(guest.totalSpent)} · Đơn trung bình ${money(guest.averageOrderValue)}. Nhóm này không đại diện cho một khách hàng riêng. Tổng hợp theo khoảng ngày, không áp dụng tìm kiếm hồ sơ khách hàng.`),
      button('Xem đơn khách lẻ', () => openList('Đơn hoàn thành của khách lẻ', { from: committed.from, to: committed.to, customerId: 'guest' })));
  }

  async function load(query) {
    mainRequest?.abort(); mainRequest = new AbortController();
    const id = ++generation; const requestTab = tab;
    attempted = { ...query }; successful = null; loading = true; updateBusy();
    results.hidden = true; status.className = ''; status.textContent = 'Đang tải thống kê...'; retry.hidden = true;
    try {
      const params = new URLSearchParams({ ...query, page, limit: 20 });
      const payload = await window.AdminApi.request(`/reports/${requestTab === 'revenue' ? 'summary' : requestTab === 'orders' ? 'transactions' : 'customers'}?${params}`, { signal: mainRequest.signal });
      if (id !== generation) return;
      data = payload.data; committed = { ...query }; successful = { tab: requestTab, query: { ...query } };
      $('#report-charts').replaceChildren(); $('#report-guest').hidden = true; $('#report-comparison').hidden = true;
      const filterText = query.search ? `Tìm: ${query.search}` : '';
      $('#report-caption').textContent = `${names[requestTab]} · ${day(query.from)} – ${day(query.to)} · Ngày hoàn thành (giờ Việt Nam). Tính tất cả đơn hoàn thành, không phụ thuộc trạng thái thanh toán; gồm phí giao hàng, đã trừ giảm giá.${filterText ? ` · ${filterText}` : ''}`;
      results.setAttribute('aria-labelledby', `tab-${requestTab}`);
      if (requestTab === 'revenue') renderRevenue(); else if (requestTab === 'orders') renderTransactions(); else renderCustomers();
      results.hidden = false; status.textContent = 'Đã cập nhật thống kê. Xuất Excel dùng bộ lọc của báo cáo đang hiển thị.';
    } catch (error) {
      if (id !== generation || error.name === 'AbortError') return;
      successful = null; results.hidden = true; status.className = 'error'; status.textContent = error.message; retry.hidden = false;
    } finally { if (id === generation) { loading = false; updateBusy(); } }
  }

  async function loadList() {
    listRequest?.abort(); listRequest = new AbortController(); const id = ++listGeneration;
    $('#report-list-status').textContent = 'Đang tải danh sách đơn...'; $('#report-list-table').replaceChildren(); $('#report-list-total').textContent = ''; $('#report-list-pagination').replaceChildren(); $('#report-list-retry').hidden = true;
    try {
      const payload = await window.AdminApi.request(`/reports/transactions?${new URLSearchParams({ ...listState.query, page: listState.page, limit: 20 })}`, { signal: listRequest.signal });
      if (id !== listGeneration || !listDialog.open) return;
      table($('#report-list-table'), transactionHeaders.map(([label]) => [label]), transactionRows(payload.data.items));
      $('#report-list-status').textContent = payload.data.overview.totalOrders ? 'Bấm mã đơn để xem chi tiết.' : 'Không có đơn đủ điều kiện trong kỳ này.';
      $('#report-list-total').textContent = `${num(payload.data.overview.totalOrders)} đơn · ${money(payload.data.overview.totalRevenue)}`;
      pager($('#report-list-pagination'), payload.data.pagination, value => { listState.page = value; loadList(); });
    } catch (error) { if (id === listGeneration && error.name !== 'AbortError') { $('#report-list-status').textContent = error.message; $('#report-list-retry').hidden = false; } }
  }
  function openList(title, query) {
    listState = { query: { ...query }, page: 1 }; $('#report-list-title').textContent = title; listDialog.showModal(); loadList();
  }
  function renderOrder(order) {
    const root = $('#report-order-content'); root.replaceChildren();
    const info = element('dl', undefined, 'report-order-info');
    [['Khách hàng', order.customer?.fullName || order.customerName || 'Khách lẻ'], ['Điện thoại', order.customer?.phone || order.customerPhone || '—'],
      ['Ngày đặt', date(order.orderedAt)], ['Ngày hoàn thành', date(order.completedAt)], ['Loại đơn', typeLabels[order.orderType] || order.orderType],
      ['Thanh toán', `${methodLabels[order.payment?.method] || '—'} · ${paymentLabels[order.payment?.status] || '—'}`],
      ['Địa chỉ / bàn', order.deliveryAddress || order.tableNumber || '—']].forEach(([label, value]) => {
      const row = element('div'); row.append(element('dt', label), element('dd', value)); info.append(row);
    }); root.append(info);
    const items = element('div', undefined, 'table-wrap'); root.append(items);
    table(items, [['Món'], ['Số lượng'], ['Đơn giá'], ['Thành tiền']], (order.items || []).map(item => [item.name, num(item.quantity), money(item.unitPrice), money(item.lineTotal)]));
    const totals = element('div', undefined, 'report-order-totals');
    [['Tiền hàng', order.subtotal], ['Phí giao hàng', order.shippingFee], ['Giảm giá', order.discount], ['Tổng tiền', order.total]].forEach(([label, value]) => {
      const row = element('p'); row.append(element('span', label), element('strong', money(value || 0))); totals.append(row);
    }); root.append(totals);
  }
  async function loadOrder() {
    orderRequest?.abort(); orderRequest = new AbortController(); const id = ++orderGeneration;
    $('#report-order-content').replaceChildren(); $('#report-order-status').textContent = 'Đang tải chi tiết đơn...'; $('#report-order-retry').hidden = true;
    try {
      const payload = await window.AdminApi.request(`/banhang/orders/${orderId}`, { signal: orderRequest.signal });
      if (id !== orderGeneration || !orderDialog.open) return;
      $('#report-order-title').textContent = `Chi tiết ${payload.data.order.orderCode}`;
      renderOrder(payload.data.order); $('#report-order-status').textContent = 'Thông tin đơn hàng chỉ đọc.';
    } catch (error) { if (id === orderGeneration && error.name !== 'AbortError') { $('#report-order-status').textContent = error.message; $('#report-order-retry').hidden = false; } }
  }
  function openOrder(id) { orderId = id; $('#report-order-title').textContent = 'Chi tiết đơn hàng'; orderDialog.showModal(); loadOrder(); }
  document.querySelectorAll('[data-close]').forEach(control => control.addEventListener('click', () => document.getElementById(control.dataset.close).close()));
  listDialog.addEventListener('close', () => { ++listGeneration; listRequest?.abort(); });
  orderDialog.addEventListener('close', () => { ++orderGeneration; orderRequest?.abort(); });
  $('#report-list-retry').addEventListener('click', loadList);
  $('#report-order-retry').addEventListener('click', loadOrder);
  retry.addEventListener('click', () => load(attempted));

  function setRange(kind) {
    const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
    const from = kind === 'month' ? `${today.slice(0, 7)}-01` : kind === 'week' ? new Date(new Date(`${today}T00:00:00Z`).getTime() - 6 * 86400000).toISOString().slice(0, 10) : today;
    form.elements.from.value = from; form.elements.to.value = today;
  }
  document.querySelectorAll('[data-range]').forEach(control => control.addEventListener('click', () => setRange(control.dataset.range)));
  const tabs = [...document.querySelectorAll('[data-tab]')];
  function changeTab(control) {
    if (tab === control.dataset.tab) return;
    tab = control.dataset.tab; page = 1; sortBy = tab === 'revenue' ? 'period' : tab === 'orders' ? 'completedAt' : 'totalSpent'; sortDir = 'desc';
    tabs.forEach(button => { const selected = button === control; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
    $('#group-filter').hidden = tab !== 'revenue'; $('#search-filter').hidden = tab === 'revenue';
    form.elements.search.value = '';
    load({ from: committed?.from || attempted.from, to: committed?.to || attempted.to, ...(tab === 'revenue' ? { groupBy: committed?.groupBy || 'day' } : { sortBy, sortDir }) });
  }
  tabs.forEach((control, index) => {
    control.addEventListener('click', () => changeTab(control));
    control.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const target = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      target.focus(); changeTab(target);
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault(); if (loading || exporting) return;
    const query = { from: form.elements.from.value, to: form.elements.to.value };
    if (query.from > query.to) { showToast('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.', 'error'); form.elements.from.focus(); return; }
    if (tab === 'revenue') query.groupBy = form.elements.groupBy.value;
    else { query.search = form.elements.search.value.trim(); query.sortBy = sortBy; query.sortDir = sortDir; }
    page = 1; load(query);
  });
  exportButton.addEventListener('click', async () => {
    if (!successful || exporting || loading) return;
    const snapshot = { ...successful.query, type: successful.tab }; delete snapshot.sortBy; delete snapshot.sortDir;
    if (successful.tab !== 'revenue') { snapshot.sortBy = sortBy; snapshot.sortDir = sortDir; }
    exporting = true; updateBusy();
    try { await window.AdminApi.downloadReport(new URLSearchParams(snapshot).toString()); showToast('Đã xuất Excel theo bộ lọc đang hiển thị.'); }
    catch (error) { showToast(error.message, 'error'); }
    finally { exporting = false; updateBusy(); }
  });
  setRange('month');
  attempted = { from: form.elements.from.value, to: form.elements.to.value, groupBy: 'day' };
  updateBusy();
  try { await initAdminPage(); await load(attempted); }
  catch (error) { status.className = 'error'; status.textContent = error.message; }
});
