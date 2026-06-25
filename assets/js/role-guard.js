(async function protectRolePage(global) {
  const requiredRole = document.body?.dataset.requiredRole;
  if (!requiredRole) return;

  document.documentElement.style.visibility = 'hidden';

  try {
    const response = await fetch('/api/v1/auth/me', {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      location.replace('/admin/login.html');
      return;
    }

    const payload = await response.json();
    const user = payload?.data?.user;
    const redirectTo = payload?.data?.redirectTo;

    const allowedRoles = requiredRole.split(',').map(r => r.trim());
    if (!user || !allowedRoles.includes(user.role)) {
      location.replace(redirectTo || '/admin/login.html');
      return;
    }

    global.RoleGuard = { user, redirectTo };
    document.documentElement.style.visibility = '';
  } catch (_error) {
    location.replace('/admin/login.html');
  }
})(window);
