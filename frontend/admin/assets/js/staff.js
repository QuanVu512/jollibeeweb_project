document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#staff-form');
  const formTitle = document.querySelector('#staff-form-title');
  const submitButton = document.querySelector('#staff-submit');
  const cancelButton = document.querySelector('#staff-cancel');
  const searchInput = document.querySelector('#staff-search');
  const genderFilter = document.querySelector('#staff-gender-filter');
  const birthDateInput = document.querySelector('#birth-date');
  const countLabel = document.querySelector('#staff-count');
  const tableBody = document.querySelector('#staff-table-body');
  const {
    showToast,
    formatDate,
    clearFieldErrors,
    showFieldError,
    applyFieldErrors,
    bindFieldErrorClearing,
    initAdminPage
  } = window.AdminCommon;
  const employeeNamePattern = /^[\p{L}\p{M}]+(?: +[\p{L}\p{M}]+)*$/u;
  const phonePattern = /^0(?:3|5|7|8|9)\d{8}$/;
  const emailPattern = /^[A-Z0-9_%+-]+(?:\.[A-Z0-9_%+-]+)*@(gmail\.com|outlook\.com|hotmail\.com|yahoo\.com|icloud\.com)$/i;
  let employeesById = new Map();
  let searchTimer;

  function dateInputValue(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  const maximumBirthDate = new Date();
  maximumBirthDate.setFullYear(maximumBirthDate.getFullYear() - 16);
  birthDateInput.max = dateInputValue(maximumBirthDate);

  function cell(text) {
    const element = document.createElement('td');
    element.textContent = text || '—';
    return element;
  }

  function resetForm() {
    form.reset();
    clearFieldErrors(form);
    form.elements.id.value = '';
    formTitle.textContent = 'Thêm nhân viên';
    submitButton.textContent = 'Lưu hồ sơ';
    cancelButton.hidden = true;
  }

  function startEdit(employee) {
    clearFieldErrors(form);
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
    if (genderFilter.value !== 'all') query.set('gender', genderFilter.value);
    const payload = await window.AdminApi.request(`/employees?${query}`);
    renderEmployees(payload.data.items, payload.data.pagination.total);
  }

  function validateForm() {
    clearFieldErrors(form);
    let valid = true;
    const fullName = form.elements.fullName.value.trim();
    const phone = form.elements.phone.value.trim();
    const email = form.elements.email.value.trim();
    const hometown = form.elements.hometown.value.trim();

    if (!fullName) {
      showFieldError(form.elements.fullName, 'Nhập họ và tên.');
      valid = false;
    } else if (fullName.length > 70) {
      showFieldError(form.elements.fullName, 'Họ và tên không được vượt quá 70 ký tự.');
      valid = false;
    } else if (!employeeNamePattern.test(fullName)) {
      showFieldError(form.elements.fullName, 'Họ và tên chỉ được gồm chữ và khoảng trắng.');
      valid = false;
    }
    if (!form.elements.gender.value) {
      showFieldError(form.elements.gender, 'Chọn giới tính.');
      valid = false;
    }
    if (!form.elements.birthDate.value) {
      showFieldError(form.elements.birthDate, 'Chọn ngày sinh.');
      valid = false;
    } else if (form.elements.birthDate.value > birthDateInput.max) {
      showFieldError(form.elements.birthDate, 'Nhân viên phải từ đủ 16 tuổi.');
      valid = false;
    }
    if (!phone) {
      showFieldError(form.elements.phone, 'Nhập số điện thoại.');
      valid = false;
    } else if (!phonePattern.test(phone)) {
      showFieldError(form.elements.phone, 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.');
      valid = false;
    }
    if (!email) {
      showFieldError(form.elements.email, 'Nhập email.');
      valid = false;
    } else if (email.length > 70) {
      showFieldError(form.elements.email, 'Email không được vượt quá 70 ký tự.');
      valid = false;
    } else if (!emailPattern.test(email)) {
      showFieldError(form.elements.email, 'Email phải đúng định dạng và sử dụng tên miền gmail.com, outlook.com, hotmail.com, yahoo.com hoặc icloud.com.');
      valid = false;
    }
    if (!hometown) {
      showFieldError(form.elements.hometown, 'Nhập quê quán.');
      valid = false;
    } else if (hometown.length > 30) {
      showFieldError(form.elements.hometown, 'Quê quán không được vượt quá 30 ký tự.');
      valid = false;
    }
    form.querySelector('.is-invalid')?.focus();
    return valid;
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
    if (!validateForm()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const id = data.id;
    delete data.id;
    for (const key of ['fullName', 'phone', 'email', 'hometown']) data[key] = data[key].trim();
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
      const hasFieldError = applyFieldErrors(form, error.details);
      if (hasFieldError) form.querySelector('.is-invalid')?.focus();
      else showToast(error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  bindFieldErrorClearing(form);
  cancelButton.addEventListener('click', resetForm);
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadEmployees().catch((error) => showToast(error.message, 'error')), 300);
  });
  genderFilter.addEventListener('change', () => {
    loadEmployees().catch((error) => showToast(error.message, 'error'));
  });

  try {
    await initAdminPage();
    await loadEmployees();
  } catch (error) {
    showToast(error.message, 'error');
  }
});
