document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#account-form');
  const submitButton = document.querySelector('#account-submit');
  const employeeSelect = document.querySelector('#employee-id');
  const searchInput = document.querySelector('#account-search');
  const roleFilter = document.querySelector('#account-role-filter');
  const countLabel = document.querySelector('#account-count');
  const tableBody = document.querySelector('#account-table-body');
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
      roleBadge.className = `badge badge-${account.role}`;
      roleBadge.textContent = roleLabels[account.role] || account.role;
      roleCell.append(roleBadge);
      row.append(roleCell);

      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `badge ${account.isActive ? 'badge-active' : 'badge-locked'}`;
      statusBadge.textContent = account.isActive ? 'Đang hoạt động' : 'Đã khóa';
      statusCell.append(statusBadge);
      row.append(statusCell);

      const actionCell = document.createElement('td');
      const actions = document.createElement('div');
      actions.className = 'row-actions';

      const statusButton = document.createElement('button');
      statusButton.type = 'button';
      statusButton.className = `btn ${account.isActive ? 'btn-warning' : 'btn-secondary'}`;
      statusButton.textContent = account.isActive ? 'Khóa' : 'Mở khóa';
      statusButton.addEventListener('click', () => updateStatus(account));

      const revokeButton = document.createElement('button');
      revokeButton.type = 'button';
      revokeButton.className = 'btn btn-danger';
      revokeButton.textContent = 'Thu hồi';
      revokeButton.addEventListener('click', () => revokeAccount(account));

      actions.append(statusButton, revokeButton);
      actionCell.append(actions);
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
    if (!form.elements.role.value) {
      showFieldError(form.elements.role, 'Chọn vai trò cho tài khoản.');
      valid = false;
    }
    form.querySelector('.is-invalid')?.focus();
    return valid;
  }

  async function updateStatus(account) {
    const action = account.isActive ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản ${account.username}?`)) return;
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
    if (!confirm(`Thu hồi tài khoản ${account.username}? Hồ sơ nhân viên vẫn được giữ lại.`)) return;
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
    try {
      await window.AdminApi.request('/accounts', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(data.entries()))
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
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadAccounts().catch((error) => showToast(error.message, 'error')), 300);
  });
  roleFilter.addEventListener('change', () => {
    loadAccounts().catch((error) => showToast(error.message, 'error'));
  });

  try {
    await initAdminPage();
    await refresh();
  } catch (error) {
    showToast(error.message, 'error');
  }
});
