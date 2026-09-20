(async function addAdminReturnLink() {
  try {
    const response = await fetch('/api/v1/auth/me', {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return;

    const payload = await response.json();
    if (payload?.data?.user?.role !== 'admin' || document.querySelector('#admin-return-link')) return;

    const style = document.createElement('style');
    style.textContent = `
      .admin-return-host { position: relative !important; }
      .admin-return-link {
        display: inline-flex;
        min-height: 38px;
        align-items: center;
        justify-content: center;
        border: 1px solid #e21b22;
        border-radius: 8px;
        background: #fff;
        color: #c5161d !important;
        padding: 8px 14px;
        font: 700 13px/1.2 "Segoe UI", Arial, sans-serif;
        text-decoration: none !important;
        white-space: nowrap;
        box-shadow: 0 4px 14px rgba(31, 45, 61, 0.12);
        transition: background 160ms ease, color 160ms ease, transform 160ms ease;
        z-index: 10000;
      }
      .admin-return-link:hover { background: #e21b22; color: #fff !important; }
      .admin-return-link--inline { margin-right: 12px; }
      .admin-return-link--overlay {
        position: absolute;
        top: 50%;
        left: 18px;
        transform: translateY(-50%);
      }
      .admin-return-link--floating {
        position: fixed;
        top: 18px;
        left: 18px;
      }
      @media (max-width: 720px) {
        .admin-return-link--overlay,
        .admin-return-link--floating {
          position: fixed;
          top: auto;
          bottom: 18px;
          left: 18px;
          transform: none;
        }
        .admin-return-link--inline { margin-right: 6px; padding: 7px 10px; }
      }
    `;
    document.head.append(style);

    const link = document.createElement('a');
    link.id = 'admin-return-link';
    link.href = '/admin/';
    link.textContent = '← Về trang quản trị';
    link.setAttribute('aria-label', 'Quay về trang quản trị');

    const actionHost = document.querySelector(
      '.topbar .actions, .header-right, .shipper-profile, .container > .page-header'
    );
    if (actionHost) {
      link.className = 'admin-return-link admin-return-link--inline';
      actionHost.prepend(link);
      return;
    }

    const headerHost = document.querySelector('header, .header-jollibee, .page-header');
    if (headerHost) {
      headerHost.classList.add('admin-return-host');
      link.className = 'admin-return-link admin-return-link--overlay';
      headerHost.prepend(link);
      return;
    }

    link.className = 'admin-return-link admin-return-link--floating';
    document.body.append(link);
  } catch (_error) {
    // Không tạo nút nếu không thể xác nhận phiên admin.
  }
})();
