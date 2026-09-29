document.addEventListener('DOMContentLoaded', async () => {
  const ui = window.AttendanceUI;
  const common = window.AdminCommon;
  const get = id => document.getElementById(id);
  let page = 1;
  let totalPages = 0;
  let editItem;
  let cancelItem;
  let historyItem;
  let historyPage = 1;
  let listSequence = 0;
  const actionLabels = {
    'attendance.checkIn': 'Ghi giờ vào', 'attendance.checkOut': 'Ghi giờ ra',
    'attendance.approveOT': 'Duyệt OT và ghi giờ vào', 'attendance.approveException': 'Duyệt ngoại lệ và ghi giờ vào',
    'attendance.correct': 'Điều chỉnh công', 'attendance.cancel': 'Hủy công'
  };
  function describe(item) { return `${item.employeeCode} — ${item.employeeName} · ${item.workDate} · ${item.schedule.name}`; }
  function edit(item) {
    editItem = item; get('edit-form').reset(); get('edit-description').textContent = describe(item);
    get('edit-in').value = ui.localInput(item.checkInAt); get('edit-out').value = ui.localInput(item.checkOutAt);
    get('edit-out').required = item.state === 'CLOSED'; get('edit-error').hidden = true;
    get('edit-dialog').showModal(); get('edit-reason').focus();
  }
  async function load() {
    const sequence = ++listSequence;
    const query = new URLSearchParams({ from: get('filter-from').value, to: get('filter-to').value, limit: 20, page });
    [['employeeId', 'filter-employee'], ['state', 'filter-state'], ['status', 'filter-status']].forEach(([key, id]) => { if (get(id).value) query.set(key, get(id).value); });
    const { data } = await window.AdminApi.request(`/admin/attendance?${query}`);
    if (sequence !== listSequence) return;
    get('list-error').hidden = true; totalPages = data.pagination.totalPages;
    get('page-label').textContent = `Trang ${page}/${Math.max(totalPages, 1)} · ${data.pagination.total} phiên công`;
    get('previous').disabled = page <= 1; get('next').disabled = page >= totalPages;
    const body = get('attendance-body'); body.replaceChildren();
    if (!data.items.length) ui.empty(body, 8, 'Chưa có công trong khoảng ngày này.');
    data.items.forEach(item => {
      const row = document.createElement('tr'); const actions = ui.cell(''); actions.className = 'row-actions';
      actions.append(ui.button('Lịch sử', () => openHistory(item)));
      if (item.state !== 'CANCELLED') {
        actions.append(ui.button('Sửa công', () => edit(item)), ui.button('Hủy', () => {
          cancelItem = item; get('cancel-form').reset(); get('cancel-description').textContent = describe(item); get('cancel-error').hidden = true;
          get('cancel-dialog').showModal(); get('cancel-reason').focus();
        }, 'btn btn-danger'));
      }
      const label = item.state === 'OPEN' && item.workDate < ui.today() ? `Thiếu giờ ra · ${ui.status(item)}` : ui.status(item);
      row.append(ui.cell(`${item.employeeCode} — ${item.employeeName}`), ui.cell(`${item.workDate} · ${item.schedule.name}${item.kind === 'OT' ? ' · OT' : ''}`),
        ui.cell(ui.time(item.checkInAt)), ui.cell(ui.time(item.checkOutAt)), ui.cell(label),
        ui.cell(ui.actor(item.checkInRecordedBy)), ui.cell(ui.actor(item.checkOutRecordedBy)), actions);
      body.append(row);
    });
  }
  function reload() { return load().catch(error => ui.error(get('list-error'), error)); }
  async function loadHistory() {
    const id = historyItem._id; const currentPage = historyPage;
    const { data } = await window.AdminApi.request(`/admin/attendance/${id}/history?page=${currentPage}&limit=20`);
    if (historyItem?._id !== id || historyPage !== currentPage) return;
    data.items.forEach(item => {
      const li = document.createElement('li'); const title = document.createElement('strong');
      title.textContent = `${actionLabels[item.action] || item.action} · ${ui.actor(item.actor)}`;
      const time = document.createElement('p'); time.textContent = ui.dateTime(item.createdAt);
      li.append(title, time);
      if (item.reason) { const p = document.createElement('p'); p.textContent = `Lý do: ${item.reason}`; li.append(p); }
      const details = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = 'Dữ liệu trước / sau';
      const pre = document.createElement('pre'); pre.textContent = JSON.stringify({ before: item.before, after: item.after }, null, 2);
      details.append(summary, pre); li.append(details); get('history-list').append(li);
    });
    if (!data.items.length && currentPage === 1) get('history-list').textContent = 'Chưa có lịch sử.';
    get('history-more').hidden = currentPage >= data.pagination.totalPages;
  }
  async function openHistory(item) {
    historyItem = item; historyPage = 1; get('history-list').replaceChildren(); get('history-more').hidden = true;
    get('history-description').textContent = describe(item); get('history-error').hidden = true; get('history-dialog').showModal();
    try { await loadHistory(); } catch (error) { ui.error(get('history-error'), error); }
  }
  get('edit-form').addEventListener('submit', async event => {
    event.preventDefault(); const submit = event.submitter; submit.disabled = true;
    try {
      await ui.request(`/admin/attendance/${editItem._id}`, {
        checkInAt: ui.toInstant(get('edit-in').value), checkOutAt: ui.toInstant(get('edit-out').value),
        revision: editItem.revision, reason: get('edit-reason').value
      }, { method: 'PATCH' });
      get('edit-dialog').close(); await reload(); common.showToast('Đã điều chỉnh và lưu lịch sử.');
    } catch (error) { ui.error(get('edit-error'), error); }
    finally { submit.disabled = false; }
  });
  get('cancel-form').addEventListener('submit', async event => {
    event.preventDefault(); const submit = event.submitter; submit.disabled = true;
    try {
      await ui.request(`/admin/attendance/${cancelItem._id}/cancel`, { revision: cancelItem.revision, reason: get('cancel-reason').value });
      get('cancel-dialog').close(); await reload(); common.showToast('Đã hủy công; dữ liệu và lịch sử vẫn được giữ.');
    } catch (error) { ui.error(get('cancel-error'), error); }
    finally { submit.disabled = false; }
  });
  ['edit', 'cancel', 'history'].forEach(name => get(`${name}-close`).addEventListener('click', () => get(`${name}-dialog`).close()));
  get('history-more').addEventListener('click', async () => {
    get('history-more').disabled = true; historyPage += 1;
    try { await loadHistory(); } catch (error) { historyPage -= 1; ui.error(get('history-error'), error); }
    finally { get('history-more').disabled = false; }
  });
  get('filter-form').addEventListener('submit', event => { event.preventDefault(); page = 1; reload(); });
  get('previous').addEventListener('click', () => { page = Math.max(1, page - 1); reload(); });
  get('next').addEventListener('click', () => { if (page < totalPages) { page += 1; reload(); } });
  get('filter-from').value = ui.today(); get('filter-to').value = ui.today();
  try {
    await common.initAdminPage(); ui.employeeOptions(get('filter-employee'), await ui.employees());
    const sessionId = new URLSearchParams(location.search).get('sessionId');
    if (sessionId) {
      const { data } = await window.AdminApi.request(`/admin/attendance/${encodeURIComponent(sessionId)}`);
      get('filter-from').value = data.item.workDate; get('filter-to').value = data.item.workDate;
      get('filter-employee').value = data.item.employee?._id || '';
      if (data.item.state !== 'CANCELLED') edit(data.item);
      else await openHistory(data.item);
    }
    await reload();
  } catch (error) { ui.error(get('list-error'), error); }
});
