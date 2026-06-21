(function exposeApi(global) {
  const API_BASE = '/api/v1';

  async function apiFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers
    });

    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
      if (response.status === 401 && !location.pathname.endsWith('/login.html')) {
        location.replace('/admin/login.html');
      }
      const error = new Error(payload?.message || 'Không thể kết nối với máy chủ.');
      error.status = response.status;
      error.details = payload?.details;
      throw error;
    }

    return payload;
  }

  async function downloadReport(query) {
    const response = await fetch(`${API_BASE}/reports/export?${query}`, { credentials: 'include' });
    if (response.status === 401) {
      location.replace('/admin/login.html');
      return;
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || 'Không thể xuất báo cáo.');
    }

    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') || '';
    const fileName = disposition.match(/filename="?([^";]+)"?/i)?.[1] || 'bao-cao.xlsx';
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  global.AdminApi = { request: apiFetch, downloadReport };
})(window);
