(function exposeAttendance(global) {
  const zone = 'Asia/Ho_Chi_Minh';
  const localDate = value => new Date(new Date(value).getTime() + 7 * 3600000).toISOString().slice(0, 10);
  const time = value => value ? new Intl.DateTimeFormat('vi-VN', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date(value)) : '—';
  const dateTime = value => value ? new Intl.DateTimeFormat('vi-VN', { timeZone: zone, dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value)) : '—';
  const localInput = value => value ? new Date(new Date(value).getTime() + 7 * 3600000).toISOString().slice(0, 19) : '';
  const toInstant = value => value ? new Date(`${value}+07:00`).toISOString() : null;
  const actor = value => value?.displayName || value?.username || (typeof value === 'string' ? value : '—');

  function cell(value) { const td = document.createElement('td'); td.textContent = value ?? '—'; return td; }
  function button(label, callback, className = 'btn btn-secondary') {
    const element = document.createElement('button');
    element.type = 'button'; element.className = className; element.textContent = label;
    element.addEventListener('click', callback);
    return element;
  }
  function empty(body, columns, text = 'Chưa có dữ liệu.') {
    body.replaceChildren(); const row = document.createElement('tr'); const td = cell(text);
    td.colSpan = columns; td.className = 'empty-cell'; row.append(td); body.append(row);
  }
  async function employees() {
    const items = [];
    for (let page = 1; ; page += 1) {
      const { data } = await global.AdminApi.request(`/employees?limit=100&page=${page}`);
      items.push(...data.items);
      if (page >= data.pagination.totalPages) return items;
    }
  }
  function employeeOptions(select, items, { activeOnly = false, blank = 'Tất cả nhân viên' } = {}) {
    const selected = select.value;
    select.replaceChildren(new Option(blank, ''));
    items.filter(row => !activeOnly || row.isActive).forEach(row => select.add(new Option(`${row.employeeCode} — ${row.fullName}${row.isActive ? '' : ' (đã nghỉ)'}`, row._id)));
    select.value = selected;
  }
  function status(item) {
    const labels = [];
    if (item.state === 'CANCELLED') labels.push('Đã hủy');
    else if (item.state === 'OPEN') labels.push('Đang làm');
    else labels.push('Hoàn tất');
    labels.push(item.lateMinutes ? `Muộn ${item.lateMinutes} phút` : 'Vào đúng giờ');
    if (item.checkOutAt) labels.push(item.earlyLeaveMinutes ? `Về sớm ${item.earlyLeaveMinutes} phút` : 'Ra đúng giờ');
    return labels.join(' · ');
  }
  function error(target, value) { target.textContent = value?.message || String(value); target.hidden = false; }
  async function request(path, body, extra = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const payload = await global.AdminApi.request(path, { ...extra, method: extra.method || 'POST',
        body: JSON.stringify(body), signal: controller.signal });
      if (!payload?.success || !payload.data) throw new Error('Máy chủ trả về kết quả không xác định.');
      return payload;
    } finally { clearTimeout(timeout); }
  }

  global.AttendanceUI = { localDate, today: () => localDate(new Date()), time, dateTime, localInput, toInstant,
    actor, cell, button, empty, employees, employeeOptions, status, error, request };
})(window);
