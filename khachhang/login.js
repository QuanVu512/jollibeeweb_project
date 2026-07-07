document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#social-form-login');
  const button = document.querySelector('#bnt-social-login-authentication');
  const errorBox = document.querySelector('#login-error');

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const username = document.querySelector('#social_login_email').value.trim();
    const password = document.querySelector('#social_login_pass').value;

    errorBox.style.display = 'none';
    button.disabled = true;
    button.innerHTML = '<span>Đang đăng nhập...</span>';

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }


      window.location.href = 'homepage.html';

    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.style.display = 'block';
    } finally {
      button.disabled = false;
      button.innerHTML = '<span>Đăng nhập</span>';
    }
  });
});