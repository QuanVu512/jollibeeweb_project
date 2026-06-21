(function exposeCommon(global) {
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

  async function initAdminPage() {
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

  global.AdminCommon = { roleLabels, showToast, formatCurrency, formatDate, initAdminPage };
})(window);
