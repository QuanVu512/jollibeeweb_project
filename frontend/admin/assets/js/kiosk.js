document.addEventListener('DOMContentLoaded', async () => {
  const ui = window.AttendanceUI;
  const input = document.getElementById('employee-code');
  const result = document.getElementById('result');
  const exceptionDialog = document.getElementById('exception-dialog');
  const recoveryDialog = document.getElementById('recovery-dialog');
  const mode = document.getElementById('exception-mode');
  let audio;
  let exceptionResolve;
  let exceptionDetails;
  let recoveryResolve;
  let recovering = false;
  let sessionExpired = false;

  function focusInput() {
    if (!exceptionDialog.open && !recoveryDialog.open && !sessionExpired) input.focus();
  }
  function sound(success) {
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume().catch(() => {});
      const oscillator = audio.createOscillator(); const gain = audio.createGain();
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.type = success ? 'sine' : 'square';
      oscillator.frequency.setValueAtTime(success ? 880 : 220, audio.currentTime);
      if (success) oscillator.frequency.setValueAtTime(1174, audio.currentTime + .09);
      gain.gain.setValueAtTime(.07, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .22);
      oscillator.start(); oscillator.stop(audio.currentTime + .24);
    } catch (_error) { /* Visual feedback remains available when browser audio is blocked. */ }
  }
  function show(title, message, type = 'success', href = null) {
    result.className = `kiosk-result ${type}`;
    const h2 = document.createElement('h2'); h2.textContent = title;
    const p = document.createElement('p'); p.textContent = message;
    result.replaceChildren(h2, p);
    if (href) { const a = document.createElement('a'); a.href = href; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Mở phiên cần xử lý'; result.append(a); }
    sound(type === 'success');
  }
  function showReceipt(data) {
    const action = data.action === 'IN' ? 'Check-in' : 'Check-out';
    const label = data.action === 'IN'
      ? (data.lateMinutes ? `Muộn ${data.lateMinutes} phút` : 'Đúng giờ')
      : (data.earlyLeaveMinutes ? `Về sớm ${data.earlyLeaveMinutes} phút` : 'Đúng giờ');
    const message = `${action} lúc ${ui.time(data.timestamp)} · ${label}${data.kind === 'OT' ? ' · OT' : ''}`;
    show(`${data.employee.employeeCode} — ${data.employee.fullName}`, message);
    const li = document.createElement('li'); li.textContent = `${data.employee.fullName} · ${message}`;
    const recent = document.getElementById('recent'); recent.prepend(li);
    while (recent.children.length > 5) recent.lastElementChild.remove();
    window.AttendanceBills.attach(data.bill, result, li, focusInput);
  }
  function expired(error) {
    sessionExpired = true; queue.stop(); input.disabled = true;
    show('Phiên đăng nhập đã hết hạn', error.message, 'error', '/admin/login.html');
    document.getElementById('queue-status').textContent = 'Đăng nhập lại để tiếp tục.';
  }
  async function send(path, payload) {
    // Unknown transport outcomes must reuse this exact payload/requestId.
    for (;;) {
      try {
        return await ui.request(path, payload, { redirectOnUnauthorized: false });
      } catch (error) {
        if (error.status === 401 || error.status === 403) { expired(error); throw error; }
        if (error.status && error.status < 500) throw error;
        recovering = true;
        document.getElementById('recovery-message').textContent = `${payload.employeeCode}: mất kết nối, timeout hoặc lỗi máy chủ. Chưa thể khẳng định lượt này đã được lưu.`;
        if (!recoveryDialog.open) recoveryDialog.showModal();
        document.getElementById('recovery-retry').focus();
        await new Promise(resolve => { recoveryResolve = resolve; });
        recoveryDialog.close(); recovering = false;
      }
    }
  }
  document.getElementById('recovery-retry').addEventListener('click', () => {
    const resolve = recoveryResolve; recoveryResolve = null; resolve?.();
  });
  recoveryDialog.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); document.getElementById('recovery-retry').click(); }
  });
  recoveryDialog.addEventListener('cancel', event => event.preventDefault());

  function updateMode() {
    const ot = mode.value === 'OT';
    document.getElementById('exception-shift-group').hidden = ot;
    document.getElementById('exception-end-group').hidden = !ot;
    document.getElementById('exception-end').required = ot;
  }
  mode.addEventListener('change', updateMode);
  function finishException() {
    exceptionDialog.close(); const resolve = exceptionResolve; exceptionResolve = null;
    resolve?.(); focusInput();
  }
  function openException(details, message) {
    exceptionDetails = details;
    document.getElementById('exception-form').reset();
    document.getElementById('exception-error').hidden = true;
    document.getElementById('exception-employee').textContent = `${details.employee.employeeCode} — ${details.employee.fullName}`;
    document.getElementById('exception-message').textContent = `${message} Ngày công: ${details.workDate}.`;
    const select = document.getElementById('exception-shift'); select.replaceChildren();
    details.assignments.forEach(row => select.add(new Option(`${row.name} (${ui.time(row.startAt)}–${ui.time(row.endAt)})`, row.id)));
    mode.options[0].disabled = !details.assignments.length;
    mode.value = details.assignments.length ? 'SHIFT' : 'OT'; updateMode();
    exceptionDialog.showModal(); document.getElementById('exception-reason').focus();
    return new Promise(resolve => { exceptionResolve = resolve; });
  }
  let approving = false;
  document.getElementById('exception-form').addEventListener('submit', async event => {
    event.preventDefault(); if (approving) return;
    approving = true;
    const submit = document.getElementById('exception-submit'); submit.disabled = true;
    document.getElementById('exception-cancel').disabled = true;
    const payload = {
      employeeCode: exceptionDetails.employee.employeeCode, requestId: crypto.randomUUID(), mode: mode.value,
      reason: document.getElementById('exception-reason').value,
      ...(mode.value === 'OT' ? { endTime: document.getElementById('exception-end').value } : { employeeShiftId: document.getElementById('exception-shift').value })
    };
    try {
      const { data } = await send('/admin/attendance/exceptions', payload); showReceipt(data); finishException();
    } catch (error) {
      if (sessionExpired) finishException();
      else if (error.status === 409) { show('Trạng thái đã thay đổi', error.message, 'warning'); finishException(); }
      else { ui.error(document.getElementById('exception-error'), error); sound(false); }
    } finally {
      approving = false; submit.disabled = false; document.getElementById('exception-cancel').disabled = false;
    }
  });
  exceptionDialog.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && event.target.tagName === 'TEXTAREA') {
      event.preventDefault(); document.getElementById('exception-form').requestSubmit();
    }
  });
  exceptionDialog.addEventListener('cancel', event => { event.preventDefault(); if (!approving && !recovering) finishException(); });
  document.getElementById('exception-cancel').addEventListener('click', finishException);

  const queue = new window.ScanQueue(async employeeCode => {
    try {
      const { data } = await send('/admin/attendance/scan', { employeeCode, requestId: crypto.randomUUID() });
      showReceipt(data);
    } catch (error) {
      if (sessionExpired) return;
      show(employeeCode, error.message, error.status === 429 || error.status === 409 ? 'warning' : 'error',
        error.details?.code === 'UNCLOSED_SESSION' ? `/admin/attendance.html?sessionId=${encodeURIComponent(error.details.sessionId)}` : null);
      if (error.details?.code === 'APPROVAL_REQUIRED') await openException(error.details, error.message);
    } finally { focusInput(); }
  }, count => {
    if (!sessionExpired) document.getElementById('queue-status').textContent = count ? `Đang xử lý · ${count} lượt trong hàng đợi` : 'Sẵn sàng · nhập mã tiếp theo';
  }, error => show('Không thể xử lý', error.message, 'error'));

  document.getElementById('scan-form').addEventListener('submit', event => {
    event.preventDefault(); const code = input.value; input.value = ''; focusInput();
    if (!code.trim()) return;
    // Unlock audio on the keyboard gesture without claiming that a request succeeded.
    try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume().catch(() => {}); } catch (_error) {}
    if (!queue.enqueue(code)) show(code.trim().toUpperCase(), 'Mã này đang xử lý hoặc hàng đợi đã đầy. Vui lòng đợi.', 'warning');
  });
  input.addEventListener('blur', event => {
    if (!event.relatedTarget?.closest('a, button')) setTimeout(focusInput, 0);
  });
  window.addEventListener('focus', focusInput);
  document.getElementById('fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch (_error) { show('Toàn màn hình', 'Trình duyệt không cho phép chế độ toàn màn hình.', 'warning'); }
    focusInput();
  });
  function tick() { document.getElementById('clock').textContent = ui.dateTime(new Date()); }
  tick(); setInterval(tick, 1000);
  try { await window.AdminCommon.initAdminPage(); input.disabled = false; focusInput(); document.getElementById('queue-status').textContent = 'Sẵn sàng · nhập mã tiếp theo'; }
  catch (error) { show('Không thể mở Kiosk', error.message, 'error'); }
});
