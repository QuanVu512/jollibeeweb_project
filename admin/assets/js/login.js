document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#login-form');
  const button = document.querySelector('#login-button');
  const errorBox = document.querySelector('#login-error');

  try {
    await window.AdminApi.request('/auth/me');
    location.replace('/admin/');
    return;
  } catch (_error) {
    // Chưa đăng nhập là trạng thái bình thường của trang này.
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.classList.remove('visible');
    button.disabled = true;
    button.textContent = 'Đang đăng nhập...';

    try {
      const data = new FormData(form);
      await window.AdminApi.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: data.get('username'), password: data.get('password') })
      });
      location.replace('/admin/');
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.classList.add('visible');
    } finally {
      button.disabled = false;
      button.textContent = 'Đăng nhập';
    }
  });
});
