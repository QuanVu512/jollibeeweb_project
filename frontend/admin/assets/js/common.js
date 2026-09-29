(function exposeCommon(global) {
  let validationErrorSequence = 0;
  const roleLabels = {
    admin: 'Quản trị viên',
    cashier: 'Thu ngân',
    kitchen: 'Nhân viên bếp',
    shipper: 'Nhân viên giao hàng'
  };

  function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.append(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.append(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  }

  function formatDate(value, includeTime = false) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('vi-VN', includeTime
      ? { dateStyle: 'short', timeStyle: 'short' }
      : { dateStyle: 'short' }).format(date);
  }

  function clearFieldError(control) {
    if (!control) return;
    control.classList.remove('is-invalid');
    control.removeAttribute('aria-invalid');
    const errorId = control.dataset.validationErrorId;
    const describedBy = (control.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== errorId);
    if (describedBy.length) control.setAttribute('aria-describedby', describedBy.join(' '));
    else control.removeAttribute('aria-describedby');

    const error = errorId ? document.getElementById(errorId) : control.nextElementSibling;
    if (error?.classList.contains('field-error') && error.dataset.validationError === 'true') {
      error.remove();
    }
    delete control.dataset.validationErrorId;
  }

  function clearFieldErrors(root) {
    root.querySelectorAll('.is-invalid').forEach(clearFieldError);
    root.querySelectorAll('.field-error[data-validation-error="true"]').forEach((error) => error.remove());
  }

  function showFieldError(control, message) {
    if (!control) return false;
    clearFieldError(control);
    control.classList.add('is-invalid');
    control.setAttribute('aria-invalid', 'true');
    const error = document.createElement('div');
    const errorId = `${control.id || control.name || 'field'}-error-${++validationErrorSequence}`;
    error.id = errorId;
    error.className = 'field-error';
    error.dataset.validationError = 'true';
    error.setAttribute('role', 'alert');
    const prefix = document.createElement('span');
    prefix.className = 'visually-hidden';
    prefix.textContent = 'Lỗi: ';
    error.append(prefix, document.createTextNode(message));
    const describedBy = (control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    describedBy.push(errorId);
    control.setAttribute('aria-describedby', [...new Set(describedBy)].join(' '));
    control.dataset.validationErrorId = errorId;
    control.insertAdjacentElement('afterend', error);
    return true;
  }

  function applyFieldErrors(form, details, aliases = {}) {
    if (!details || Array.isArray(details) || typeof details !== 'object') return false;
    let applied = false;
    Object.entries(details).forEach(([field, message]) => {
      const target = aliases[field] || form.elements.namedItem(field);
      applied = showFieldError(target, String(message)) || applied;
    });
    return applied;
  }

  function bindFieldErrorClearing(form) {
    const clear = (event) => clearFieldError(event.target);
    form.addEventListener('input', clear);
    form.addEventListener('change', clear);
  }

  async function initAdminPage() {
    const nav = document.querySelector('.sidebar-nav');
    if (nav && !nav.querySelector('[data-attendance-nav]')) {
      [['/admin/shifts.html', 'Phân ca làm việc'], ['/admin/attendance.html', 'Chấm công & lịch sử'], ['/admin/kiosk.html', 'Mở Kiosk']].forEach(([href, label]) => {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        link.dataset.attendanceNav = 'true';
        link.classList.toggle('active', location.pathname === href);
        nav.append(link);
      });
    }
    const payload = await global.AdminApi.request('/auth/me');
    document.querySelectorAll('[data-user-name]').forEach((element) => {
      element.textContent = payload.data.user.displayName;
    });
    document.querySelectorAll('[data-logout]').forEach((button) => {
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          await global.AdminApi.request('/auth/logout', { method: 'POST' });
        } finally {
          location.replace('/admin/login.html');
        }
      });
    });
    return payload.data.user;
  }

  global.AdminCommon = {
    roleLabels,
    showToast,
    formatCurrency,
    formatDate,
    clearFieldError,
    clearFieldErrors,
    showFieldError,
    applyFieldErrors,
    bindFieldErrorClearing,
    initAdminPage
  };
})(window);
