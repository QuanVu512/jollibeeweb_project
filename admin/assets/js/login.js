document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#login-form');
  const button = document.querySelector('#login-button');
  const errorBox = document.querySelector('#login-error');

  function goToRoleHome(response) {
    const redirectTo = response?.data?.redirectTo;
    if (!redirectTo) throw new Error('Không xác định được khu vực của tài khoản.');
    location.replace(redirectTo);
  }

  try {
    const response = await window.AdminApi.request('/auth/me');
    goToRoleHome(response);
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
      const response = await window.AdminApi.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: data.get('username'),
          password: data.get('password')
        })
      });

      goToRoleHome(response);
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.classList.add('visible');
    } finally {
      button.disabled = false;
      button.textContent = 'Đăng nhập';
    }
  });
});
