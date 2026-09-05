document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#account-form');
  const submitButton = document.querySelector('#account-submit');
  const employeeSelect = document.querySelector('#employee-id');
  const tableBody = document.querySelector('#account-table-body');
  const { roleLabels, showToast, initAdminPage } = window.AdminCommon;

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

  function renderAccounts(accounts) {
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

  async function refresh() {
    const [accountPayload, employeePayload] = await Promise.all([
      window.AdminApi.request('/accounts'),
      window.AdminApi.request('/employees?withoutAccount=true&limit=100')
    ]);
    renderAccounts(accountPayload.data.items);
    renderEmployees(employeePayload.data.items);
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
      await refresh();
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
      showToast(error.message, 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Cấp tài khoản';
    }
  });

  try {
    await initAdminPage();
    await refresh();
  } catch (error) {
    showToast(error.message, 'error');
  }
});
