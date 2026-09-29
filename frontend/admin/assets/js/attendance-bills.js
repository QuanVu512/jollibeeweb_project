(function exposeAttendanceBills(global) {
  const attempted = new Set();

  async function download(bill) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`/api/v1/admin/attendance/receipts/${encodeURIComponent(bill.requestId)}`, {
        credentials: 'include', signal: controller.signal
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Không thể tải bill Word.');
      }
      if (!(response.headers.get('content-type') || '').includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        throw new Error('Máy chủ chưa trả về file Word hợp lệ.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = bill.fileName;
      document.body.append(link); link.click(); link.remove();
      // Leave the blob alive long enough for the browser's download handler.
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } finally { clearTimeout(timer); }
  }

  function attach(bill, result, recentItem, focusInput) {
    if (!bill) return;
    const status = document.createElement('small');
    status.className = 'kiosk-bill-status';
    status.setAttribute('role', 'status');
    const links = [result, recentItem].map(container => {
      const link = document.createElement('a');
      link.className = 'kiosk-bill-link';
      link.href = `/api/v1/admin/attendance/receipts/${encodeURIComponent(bill.requestId)}`;
      link.textContent = 'Tải bill Word'; container.append(link);
      return link;
    });
    result.append(status);
    let busy = false;
    async function start() {
      if (busy) return;
      busy = true;
      status.textContent = 'Đang tải bill Word…';
      links.forEach(link => { link.setAttribute('aria-disabled', 'true'); link.title = ''; });
      try {
        await download(bill);
        status.textContent = 'Đã gửi bill đến trình duyệt. Có thể bấm để tải lại.';
        links.forEach(link => link.classList.remove('download-failed'));
      } catch (_error) {
        const message = 'Đã ghi nhận công. Bill chưa tải được; bấm Tải bill Word để thử lại.';
        status.textContent = message;
        links.forEach(link => { link.title = message; link.classList.add('download-failed'); });
      } finally {
        busy = false;
        links.forEach(link => link.removeAttribute('aria-disabled'));
      }
    }
    links.forEach(link => link.addEventListener('click', event => {
      event.preventDefault(); void start(); focusInput();
    }));
    if (!attempted.has(bill.requestId)) {
      attempted.add(bill.requestId);
      // Never await downloads in the scan queue: a slow file cannot block the next employee.
      void start();
    }
  }

  global.AttendanceBills = { attach };
})(window);
