document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#notification-form');
  const submitButton = document.querySelector('#notification-submit');
  const tableBody = document.querySelector('#notification-table-body');
  const searchInput = document.querySelector('#notification-search');
  const { showToast, formatDate, initAdminPage } = window.AdminCommon;
  let searchTimer;

  const audienceLabels = {
    all_customers: 'Tất cả khách hàng',
    active_customers: 'Khách đang hoạt động'
  };

  const priorityLabels = {
    normal: 'Bình thường',
    important: 'Quan trọng'
  };

  function cell(text) {
    const element = document.createElement('td');
    element.textContent = text || '-';
    return element;
  }

  function renderNotifications(notifications) {
    tableBody.replaceChildren();
    if (!notifications.length) {
      const row = document.createElement('tr');
      const empty = cell('Chưa có thông báo nào.');
      empty.className = 'empty-cell';
      empty.colSpan = 6;
      row.append(empty);
      tableBody.append(row);
      return;
    }

    notifications.forEach((notification) => {
      const row = document.createElement('tr');
      const sender = notification.createdBy?.displayName || notification.createdBy?.username || 'Admin';
      const message = cell(notification.message);
      message.className = 'message-preview';
      row.append(
        cell(notification.title),
        cell(`${audienceLabels[notification.audience] || notification.audience} (${notification.recipientCount || 0})`),
        cell(priorityLabels[notification.priority] || notification.priority),
        cell(sender),
        cell(formatDate(notification.sentAt || notification.createdAt, true)),
        message
      );
      tableBody.append(row);
    });
  }

  async function loadNotifications() {
    const query = new URLSearchParams({ limit: '50' });
    if (searchInput.value.trim()) query.set('search', searchInput.value.trim());
    const payload = await window.AdminApi.request(`/notifications?${query}`);
    renderNotifications(payload.data.items || []);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    submitButton.disabled = true;
    try {
      await window.AdminApi.request('/notifications', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      form.reset();
      showToast('Đã lưu thông báo cho khách hàng.');
      await loadNotifications();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadNotifications().catch((error) => showToast(error.message, 'error')), 300);
  });

  try {
    await initAdminPage();
    await loadNotifications();
  } catch (error) {
    showToast(error.message, 'error');
  }
});
