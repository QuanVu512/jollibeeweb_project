document.addEventListener('DOMContentLoaded', async () => {
  const ui = window.AttendanceUI;
  const common = window.AdminCommon;
  const get = id => document.getElementById(id);
  let templates = [];
  let page = 1;
  let totalPages = 0;
  let cancelItem;
  let listSequence = 0;

  function resetTemplate() {
    get('template-form').reset(); get('template-id').value = ''; get('template-title').textContent = 'Tạo ca mẫu'; get('template-error').hidden = true;
  }
  function resetAssignment() {
    get('assignment-form').reset(); get('assignment-id').value = ''; get('assignment-date').value = ui.today();
    get('assignment-employee').disabled = false; get('assignment-title').textContent = 'Phân ca theo ngày'; get('assignment-error').hidden = true;
  }
  async function loadTemplates() {
    templates = (await window.AdminApi.request('/admin/shift-templates')).data.items;
    const body = get('templates-body'); body.replaceChildren();
    if (!templates.length) ui.empty(body, 4, 'Tạo ca mẫu đầu tiên để bắt đầu phân ca.');
    templates.forEach(item => {
      const row = document.createElement('tr'); const actions = ui.cell('');
      actions.append(ui.button('Chỉnh sửa', () => {
        get('template-id').value = item._id; get('template-name').value = item.name;
        get('template-start').value = item.startTime; get('template-end').value = item.endTime;
        get('template-active').checked = item.isActive; get('template-title').textContent = 'Chỉnh ca mẫu';
        get('template-error').hidden = true; get('template-name').focus();
      }));
      row.append(ui.cell(item.name), ui.cell(`${item.startTime}–${item.endTime}`), ui.cell(item.isActive ? 'Đang sử dụng' : 'Ngừng sử dụng'), actions); body.append(row);
    });
    const select = get('assignment-template'); const selected = select.value;
    select.replaceChildren(new Option('Chọn ca mẫu', ''));
    templates.filter(item => item.isActive).forEach(item => select.add(new Option(`${item.name} (${item.startTime}–${item.endTime})`, item._id)));
    select.value = selected;
  }
  async function loadAssignments() {
    const sequence = ++listSequence;
    const query = new URLSearchParams({ workDate: get('filter-date').value, page, limit: 20 });
    if (get('filter-employee').value) query.set('employeeId', get('filter-employee').value);
    if (get('filter-inactive').checked) query.set('includeInactive', 'true');
    const { data } = await window.AdminApi.request(`/admin/employee-shifts?${query}`);
    if (sequence !== listSequence) return;
    get('list-error').hidden = true; totalPages = data.pagination.totalPages;
    get('page-label').textContent = `Trang ${page}/${Math.max(totalPages, 1)} · ${data.pagination.total} lịch ca`;
    get('previous').disabled = page <= 1; get('next').disabled = page >= totalPages;
    const body = get('assignments-body'); body.replaceChildren();
    if (!data.items.length) ui.empty(body, 6, 'Chưa có lịch trong ngày này.');
    data.items.forEach(item => {
      const row = document.createElement('tr'); const actions = ui.cell(''); actions.className = 'row-actions';
      if (item.isActive) {
        actions.append(ui.button('Sửa', () => {
          get('assignment-id').value = item._id; get('assignment-employee').value = item.employee?._id || '';
          get('assignment-employee').disabled = true; get('assignment-template').value = item.template;
          get('assignment-date').value = item.workDate; get('assignment-title').textContent = 'Chỉnh lịch ca';
          get('assignment-error').hidden = true; get('assignment-template').focus();
        }), ui.button('Hủy', () => {
          cancelItem = item; get('cancel-form').reset(); get('cancel-error').hidden = true;
          get('cancel-description').textContent = `${item.employee?.fullName || 'Nhân viên'} · ${item.name} · ${item.workDate}`;
          get('cancel-dialog').showModal(); get('cancel-reason').focus();
        }, 'btn btn-danger'));
      }
      row.append(ui.cell(`${item.employee?.employeeCode || '—'} — ${item.employee?.fullName || '—'}`), ui.cell(item.workDate),
        ui.cell(`${item.name} · ${ui.time(item.startAt)}–${ui.time(item.endAt)}`), ui.cell(ui.actor(item.assignedBy)), ui.cell(item.isActive ? 'Đã phân' : 'Đã hủy'), actions);
      body.append(row);
    });
  }
  function reload() { return loadAssignments().catch(error => ui.error(get('list-error'), error)); }
  get('template-form').addEventListener('submit', async event => {
    event.preventDefault(); const submit = event.submitter; submit.disabled = true;
    const id = get('template-id').value;
    const payload = {
      name: get('template-name').value.trim(), startTime: get('template-start').value,
      endTime: get('template-end').value, isActive: get('template-active').checked
    };
    try {
      await loadTemplates();
      const normalizedName = value => value.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');
      const duplicate = templates.some(item => item._id !== id
        && normalizedName(item.name) === normalizedName(payload.name)
        && item.startTime === payload.startTime && item.endTime === payload.endTime);
      if (duplicate) {
        throw new Error('Đã có ca mẫu cùng tên và cùng giờ bắt đầu, kết thúc. Hãy đổi tên hoặc khung giờ.');
      }
      await ui.request(`/admin/shift-templates${id ? `/${id}` : ''}`, payload, { method: id ? 'PATCH' : 'POST' });
      resetTemplate(); await loadTemplates(); common.showToast('Đã lưu ca mẫu. Lịch đã phân giữ nguyên giờ.');
    } catch (error) { ui.error(get('template-error'), error); }
    finally { submit.disabled = false; }
  });
  get('assignment-form').addEventListener('submit', async event => {
    event.preventDefault(); const submit = event.submitter; submit.disabled = true;
    const id = get('assignment-id').value;
    const date = get('assignment-date').value;
    try {
      await ui.request(`/admin/employee-shifts${id ? `/${id}` : ''}`, {
        employeeId: get('assignment-employee').value, templateId: get('assignment-template').value, workDate: date
      }, { method: id ? 'PATCH' : 'POST' });
      resetAssignment(); get('filter-date').value = date; page = 1; await reload(); common.showToast('Đã lưu lịch ca.');
    } catch (error) { ui.error(get('assignment-error'), error); }
    finally { submit.disabled = false; }
  });
  get('cancel-form').addEventListener('submit', async event => {
    event.preventDefault(); const submit = event.submitter; submit.disabled = true;
    try {
      await ui.request(`/admin/employee-shifts/${cancelItem._id}/cancel`, { reason: get('cancel-reason').value });
      get('cancel-dialog').close(); await reload(); common.showToast('Đã hủy lịch ca và lưu lý do.');
    } catch (error) { ui.error(get('cancel-error'), error); }
    finally { submit.disabled = false; }
  });
  get('cancel-close').addEventListener('click', () => get('cancel-dialog').close());
  get('template-reset').addEventListener('click', resetTemplate);
  get('assignment-reset').addEventListener('click', resetAssignment);
  get('filter-form').addEventListener('submit', event => { event.preventDefault(); page = 1; reload(); });
  get('previous').addEventListener('click', () => { page = Math.max(1, page - 1); reload(); });
  get('next').addEventListener('click', () => { if (page < totalPages) { page += 1; reload(); } });
  get('filter-date').value = ui.today(); resetAssignment();
  try {
    await common.initAdminPage(); const items = await ui.employees();
    ui.employeeOptions(get('assignment-employee'), items, { activeOnly: true, blank: 'Chọn nhân viên' });
    ui.employeeOptions(get('filter-employee'), items); await loadTemplates(); await reload();
  } catch (error) { ui.error(get('list-error'), error); }
});
