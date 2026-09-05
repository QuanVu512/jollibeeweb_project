document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#staff-form');
  const formTitle = document.querySelector('#staff-form-title');
  const submitButton = document.querySelector('#staff-submit');
  const cancelButton = document.querySelector('#staff-cancel');
  const searchInput = document.querySelector('#staff-search');
  const countLabel = document.querySelector('#staff-count');
  const tableBody = document.querySelector('#staff-table-body');
  const { showToast, formatDate, initAdminPage } = window.AdminCommon;
  let employeesById = new Map();
  let searchTimer;

  function cell(text) {
    const element = document.createElement('td');
    element.textContent = text || '—';
    return element;
  }

  function resetForm() {
    form.reset();
    form.elements.id.value = '';
    formTitle.textContent = 'Thêm nhân viên';
    submitButton.textContent = 'Lưu hồ sơ';
    cancelButton.hidden = true;
  }

  function startEdit(employee) {
    form.elements.id.value = employee._id;
    form.elements.fullName.value = employee.fullName || '';
    form.elements.gender.value = employee.gender || '';
    form.elements.birthDate.value = employee.birthDate ? employee.birthDate.slice(0, 10) : '';
    form.elements.phone.value = employee.phone || '';
    form.elements.email.value = employee.email || '';
    form.elements.hometown.value = employee.hometown || '';
    formTitle.textContent = `Cập nhật ${employee.employeeCode}`;
    submitButton.textContent = 'Lưu cập nhật';
    cancelButton.hidden = false;
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderEmployees(employees, total) {
    employeesById = new Map(employees.map((employee) => [employee._id, employee]));
    countLabel.textContent = `${total} nhân viên`;
    tableBody.replaceChildren();

    if (employees.length === 0) {
      const row = document.createElement('tr');
      const empty = cell('Không tìm thấy nhân viên.');
      empty.className = 'empty-cell';
      empty.colSpan = 6;
      row.append(empty);
      tableBody.append(row);
      return;
    }

    employees.forEach((employee) => {
      const row = document.createElement('tr');
      row.append(cell(employee.employeeCode), cell(employee.fullName));

      const contactCell = document.createElement('td');
      const phone = document.createElement('div');
      phone.textContent = employee.phone || '—';
      const email = document.createElement('div');
      email.textContent = employee.email || '';
      email.style.color = '#6b7785';
      contactCell.append(phone, email);
      row.append(contactCell, cell(formatDate(employee.birthDate)), cell(employee.hometown));

      const actionCell = document.createElement('td');
      const actions = document.createElement('div');
      actions.className = 'row-actions';
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'btn btn-secondary';
      editButton.textContent = 'Sửa';
      editButton.addEventListener('click', () => startEdit(employee));
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'btn btn-danger';
      deleteButton.textContent = 'Xóa';
      deleteButton.addEventListener('click', () => deleteEmployee(employee));
      actions.append(editButton, deleteButton);
      actionCell.append(actions);
      row.append(actionCell);
      tableBody.append(row);
    });
  }

  async function loadEmployees() {
    const query = new URLSearchParams({ limit: '100' });
    if (searchInput.value.trim()) query.set('search', searchInput.value.trim());
    const payload = await window.AdminApi.request(`/employees?${query}`);
    renderEmployees(payload.data.items, payload.data.pagination.total);
  }

  async function deleteEmployee(employee) {
    const accountNote = employee.account ? ' Tài khoản liên kết cũng sẽ bị khóa.' : '';
    if (!confirm(`Cho nhân viên ${employee.fullName} nghỉ việc?${accountNote} Lịch sử vẫn được giữ lại.`)) return;
    try {
      await window.AdminApi.request(`/employees/${employee._id}`, { method: 'DELETE' });
      if (form.elements.id.value === employee._id) resetForm();
      showToast('Đã cho nhân viên nghỉ việc và giữ lại lịch sử.');
      await loadEmployees();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const id = data.id;
    delete data.id;
    submitButton.disabled = true;
    try {
      await window.AdminApi.request(id ? `/employees/${id}` : '/employees', {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify(data)
      });
      showToast(id ? 'Đã cập nhật hồ sơ.' : 'Đã thêm nhân viên.');
      resetForm();
      await loadEmployees();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  cancelButton.addEventListener('click', resetForm);
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadEmployees().catch((error) => showToast(error.message, 'error')), 300);
  });

  try {
    await initAdminPage();
    await loadEmployees();
  } catch (error) {
    showToast(error.message, 'error');
  }
});
