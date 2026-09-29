document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#account-form');
  const submitButton = document.querySelector('#account-submit');
  const employeeSelect = document.querySelector('#employee-id');
  const searchInput = document.querySelector('#account-search');
  const roleFilter = document.querySelector('#account-role-filter');
  const countLabel = document.querySelector('#account-count');
  const tableBody = document.querySelector('#account-table-body');
  const roleDialog = document.querySelector('#account-role-dialog');
  const roleForm = document.querySelector('#account-role-form');
  const newRole = document.querySelector('#account-new-role');
  const roleError = document.querySelector('#account-role-error');
  const roleSubmit = document.querySelector('#account-role-submit');
  const roleClose = document.querySelector('#account-role-close');
  const confirmDialog = document.querySelector('#account-confirm-dialog');
  const confirmTitle = document.querySelector('#account-confirm-title');
  const confirmDescription = document.querySelector('#account-confirm-description');
  const confirmSubmit = document.querySelector('#account-confirm-submit');
  const confirmCancel = document.querySelector('#account-confirm-cancel');
  const {
    roleLabels,
    showToast,
    clearFieldErrors,
    showFieldError,
    applyFieldErrors,
    bindFieldErrorClearing,
    initAdminPage
  } = window.AdminCommon;
  const usernamePattern = /^(?=.*[A-Za-z])[A-Za-z0-9]{6,30}$/;
  const passwordPattern = /^[\x21-\x7E]{8,30}$/;
  let searchTimer;
  let currentUser;
  let roleAccount;
  let rolePending = false;

  function cell(text) {
    const element = document.createElement('td');
    element.textContent = text;
    return element;
  }

  function renderEmployees(employees) {
    employeeSelect.replaceChildren(new Option('-- Chọn nhân viên --', ''));
    employees.forEach((employee) => {
      employeeSelect.add(new Option(`${employee.employeeCode} - ${employee.fullName}`, employee._id));
    });
    if (employees.length === 0) {
      employeeSelect.add(new Option('Tất cả nhân viên đã có tài khoản', '', false, false));
      employeeSelect.lastElementChild.disabled = true;
    }
  }

  function renderAccounts(accounts, total) {
    countLabel.textContent = `${total} tài khoản`;
    tableBody.replaceChildren();
    if (accounts.length === 0) {
      const row = document.createElement('tr');
      const empty = cell('Chưa có tài khoản.');
      empty.className = 'empty-cell';
      empty.colSpan = 5;
      row.append(empty);
      tableBody.append(row);
      return;
    }

    accounts.forEach((account) => {
      const row = document.createElement('tr');
      const usernameCell = cell(account.username);
      usernameCell.style.fontWeight = '750';
      row.append(usernameCell);
      row.append(cell(account.employee
        ? `${account.employee.employeeCode} - ${account.employee.fullName}`
        : account.displayName || 'Chưa liên kết'));

      const roleCell = document.createElement('td');
      const roleBadge = document.createElement('span');
      roleBadge.className = `badge badge-${account.role || 'no-role'}`;
      roleBadge.textContent = account.role ? roleLabels[account.role] || account.role : 'Chưa cấp quyền';
      roleCell.append(roleBadge);
      row.append(roleCell);

      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `badge ${account.isActive ? 'badge-active' : 'badge-locked'}`;
      statusBadge.textContent = account.isActive ? 'Đang hoạt động' : 'Đã khóa';
      statusCell.append(statusBadge);
      row.append(statusCell);

      const actionCell = document.createElement('td');
      const menu = document.createElement('details');
      menu.className = 'account-actions';
      const toggle = document.createElement('summary');
      toggle.textContent = '+';
      toggle.setAttribute('aria-label', `Thao tác cho tài khoản ${account.username}`);
      const actions = document.createElement('div');
      actions.className = 'row-actions';

      const roleButton = document.createElement('button');
      roleButton.type = 'button';
      roleButton.className = 'btn btn-secondary';
      roleButton.textContent = account.role ? 'Sửa quyền' : 'Cấp quyền';
      roleButton.addEventListener('click', () => { menu.open = false; openRoleDialog(account); });
      actions.append(roleButton);
      if (account.role) {
        const removeRoleButton = document.createElement('button');
        removeRoleButton.type = 'button';
        removeRoleButton.className = 'btn btn-danger';
        removeRoleButton.textContent = 'Xóa quyền';
        removeRoleButton.addEventListener('click', () => {
          menu.open = false; removeRole(account, removeRoleButton);
        });
        actions.append(removeRoleButton);
      }

      const statusButton = document.createElement('button');
      statusButton.type = 'button';
      statusButton.className = `btn ${account.isActive ? 'btn-warning' : 'btn-secondary'}`;
      statusButton.textContent = account.isActive ? 'Khóa' : 'Mở khóa';
      statusButton.addEventListener('click', () => { menu.open = false; updateStatus(account); });

      const revokeButton = document.createElement('button');
      revokeButton.type = 'button';
      revokeButton.className = 'btn btn-danger';
      revokeButton.textContent = 'Thu hồi';
      revokeButton.addEventListener('click', () => { menu.open = false; revokeAccount(account); });

      actions.append(statusButton, revokeButton);
      menu.append(toggle, actions);
      menu.addEventListener('toggle', () => {
        if (menu.open) tableBody.querySelectorAll('.account-actions[open]').forEach(other => {
          if (other !== menu) other.open = false;
        });
      });
      actionCell.append(menu);
      row.append(actionCell);
      tableBody.append(row);
    });
  }

  async function loadAccounts() {
    const query = new URLSearchParams({ limit: '100' });
    if (searchInput.value.trim()) query.set('search', searchInput.value.trim());
    if (roleFilter.value !== 'all') query.set('role', roleFilter.value);
    const payload = await window.AdminApi.request(`/accounts?${query}`);
    renderAccounts(payload.data.items, payload.data.pagination.total);
  }

  async function loadAvailableEmployees() {
    const employeePayload = await window.AdminApi.request('/employees?withoutAccount=true&limit=100');
    renderEmployees(employeePayload.data.items);
  }

  async function refresh() {
    await Promise.all([loadAccounts(), loadAvailableEmployees()]);
  }

  function validateForm() {
    clearFieldErrors(form);
    let valid = true;
    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;

    if (!form.elements.employeeId.value) {
      showFieldError(form.elements.employeeId, 'Chọn nhân viên cần cấp tài khoản.');
      valid = false;
    }
    if (!username) {
      showFieldError(form.elements.username, 'Nhập tên đăng nhập.');
      valid = false;
    } else if (username.length < 6) {
      showFieldError(form.elements.username, 'Tên đăng nhập phải có ít nhất 6 ký tự.');
      valid = false;
    } else if (username.length > 30) {
      showFieldError(form.elements.username, 'Tên đăng nhập không được vượt quá 30 ký tự.');
      valid = false;
    } else if (!/^[A-Za-z0-9]+$/.test(username)) {
      showFieldError(form.elements.username, 'Tên đăng nhập chỉ được gồm chữ không dấu và số.');
      valid = false;
    } else if (!usernamePattern.test(username)) {
      showFieldError(form.elements.username, 'Tên đăng nhập phải có ít nhất một chữ cái.');
      valid = false;
    }
    if (!password) {
      showFieldError(form.elements.password, 'Nhập mật khẩu.');
      valid = false;
    } else if (password.length < 8) {
      showFieldError(form.elements.password, 'Mật khẩu phải có ít nhất 8 ký tự.');
      valid = false;
    } else if (password.length > 30) {
      showFieldError(form.elements.password, 'Mật khẩu không được vượt quá 30 ký tự.');
      valid = false;
    } else if (!passwordPattern.test(password)) {
      showFieldError(form.elements.password, 'Mật khẩu không được chứa dấu tiếng Việt hoặc khoảng trắng.');
      valid = false;
    }
    form.querySelector('.is-invalid')?.focus();
    return valid;
  }

  function openRoleDialog(account) {
    roleAccount = account;
    roleForm.reset();
    clearFieldErrors(roleForm);
    roleError.hidden = true;
    newRole.value = account.role || '';
    document.querySelector('#account-role-title').textContent = account.role ? 'Sửa quyền' : 'Cấp quyền';
    document.querySelector('#account-role-description').textContent = `${account.username} — ${account.employee?.fullName || account.displayName || 'Nhân viên'}`;
    roleDialog.showModal();
    newRole.focus();
  }

  function canChangeOwnRole(account, role) {
    if (String(account._id) === String(currentUser?.id) && role !== 'admin') {
      return 'Bạn không thể tự bỏ quyền quản trị của chính mình.';
    }
    return null;
  }

  function confirmAction(title, description, actionLabel) {
    if (confirmDialog.open) return Promise.resolve(false);
    confirmTitle.textContent = title;
    confirmDescription.textContent = description;
    confirmSubmit.textContent = actionLabel;
    confirmDialog.returnValue = 'cancel';
    return new Promise(resolve => {
      confirmDialog.addEventListener('close', () => {
        resolve(confirmDialog.returnValue === 'confirm');
      }, { once: true });
      confirmDialog.showModal();
      confirmCancel.focus();
    });
  }

  function confirmRemoveRole(account) {
    return confirmAction('Xóa quyền đăng nhập',
      `Xóa quyền của ${account.username}? Nhân viên vẫn có hồ sơ và mã chấm công, nhưng không thể đăng nhập cho đến khi được cấp quyền lại.`,
      'Xóa quyền');
  }

  async function removeRole(account, button) {
    const error = canChangeOwnRole(account, null);
    if (error) { showToast(error, 'error'); return; }
    button.disabled = true;
    try {
      if (!await confirmRemoveRole(account)) return;
      await window.AdminApi.request(`/accounts/${account._id}`, { method: 'PATCH', body: JSON.stringify({ role: null }) });
      showToast('Đã xóa quyền đăng nhập.');
      await loadAccounts();
    } catch (error) { showToast(error.message, 'error'); }
    finally { button.disabled = false; }
  }

  roleForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (rolePending || !roleAccount) return;
    clearFieldErrors(roleForm);
    roleError.hidden = true;
    const role = newRole.value || null;
    if (!role && !roleAccount.role) { showFieldError(newRole, 'Chọn vai trò cần cấp cho tài khoản.'); newRole.focus(); return; }
    const ownRoleError = canChangeOwnRole(roleAccount, role);
    if (ownRoleError) { showFieldError(newRole, ownRoleError); newRole.focus(); return; }
    rolePending = true;
    roleSubmit.disabled = true; roleClose.disabled = true; newRole.disabled = true;
    try {
      if (!role && !await confirmRemoveRole(roleAccount)) return;
      await window.AdminApi.request(`/accounts/${roleAccount._id}`, { method: 'PATCH', body: JSON.stringify({ role }) });
      roleDialog.close();
      showToast(role ? 'Đã lưu quyền của tài khoản.' : 'Đã xóa quyền đăng nhập.');
      await loadAccounts();
    } catch (error) {
      if (!applyFieldErrors(roleForm, error.details)) { roleError.textContent = error.message; roleError.hidden = false; }
    } finally {
      rolePending = false;
      roleSubmit.disabled = false; roleClose.disabled = false; newRole.disabled = false;
    }
  });
  roleClose.addEventListener('click', () => { if (!rolePending) roleDialog.close(); });
  roleDialog.addEventListener('cancel', event => { if (rolePending) event.preventDefault(); });
  document.addEventListener('click', event => {
    tableBody.querySelectorAll('.account-actions[open]').forEach(menu => { if (!menu.contains(event.target)) menu.open = false; });
  });

  async function updateStatus(account) {
    const action = account.isActive ? 'khóa' : 'mở khóa';
    if (!await confirmAction(account.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      `Bạn có chắc muốn ${action} tài khoản ${account.username}?`,
      account.isActive ? 'Khóa' : 'Mở khóa')) return;
    try {
      await window.AdminApi.request(`/accounts/${account._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !account.isActive })
      });
      showToast(`Đã ${action} tài khoản.`);
      await loadAccounts();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function revokeAccount(account) {
    if (!await confirmAction('Thu hồi tài khoản',
      `Thu hồi tài khoản ${account.username}? Hồ sơ nhân viên vẫn được giữ lại.`,
      'Thu hồi')) return;
    try {
      await window.AdminApi.request(`/accounts/${account._id}`, { method: 'DELETE' });
      showToast('Đã thu hồi tài khoản.');
      await refresh();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    submitButton.disabled = true;
    submitButton.textContent = 'Đang lưu...';
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    payload.role = payload.role || null;
    try {
      await window.AdminApi.request('/accounts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      form.reset();
      showToast('Đã cấp tài khoản cho nhân viên.');
      await refresh();
    } catch (error) {
      const hasFieldError = applyFieldErrors(form, error.details);
      if (hasFieldError) form.querySelector('.is-invalid')?.focus();
      else showToast(error.message, 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Cấp tài khoản';
    }
  });

  bindFieldErrorClearing(form);
  bindFieldErrorClearing(roleForm);
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadAccounts().catch((error) => showToast(error.message, 'error')), 300);
  });
  roleFilter.addEventListener('change', () => {
    loadAccounts().catch((error) => showToast(error.message, 'error'));
  });

  try {
    currentUser = await initAdminPage();
    await refresh();
  } catch (error) {
    showToast(error.message, 'error');
  }
});
