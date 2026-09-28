(() => {
    const dialog = document.getElementById('profile-dialog');
    const form = document.getElementById('profile-form');
    const status = document.getElementById('profile-status');
    const fields = document.getElementById('profile-fields');
    const save = document.getElementById('profile-save');
    const close = document.getElementById('profile-close');
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'profile-open';
    button.textContent = 'Thông tin cá nhân';
    button.hidden = true;
    document.getElementById('user-menu').append(button);
    const names = ['fullName', 'phone', 'email', 'birthDate', 'gender', 'address'];
    let saving = false;
    async function request(options) {
        const response = await fetch('/api/v1/customer/profile', { credentials: 'same-origin', ...options });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Không thể tải thông tin. Vui lòng thử lại.');
        return result.data.profile;
    }
    function showName(profile) {
        document.getElementById('display-user-name').textContent = profile.fullName;
    }
    function fillCheckout(profile) {
        const mapping = { 'cust-name': profile.fullName, 'cust-phone': profile.phone, 'cust-address': profile.address };
        for (const [id, value] of Object.entries(mapping)) {
            const input = document.getElementById(id);
            if (input && !input.value) input.value = value || '';
        }
    }
    window.setupCustomerProfile = async () => {
        button.hidden = false;
        try {
            const profile = await request();
            showName(profile);
            fillCheckout(profile);
        } catch (_) { /* Retry when opening the dialog. */ }
    };
    button.addEventListener('click', async () => {
        dialog.showModal();
        form.reset();
        fields.disabled = save.disabled = true;
        status.textContent = 'Đang tải thông tin...';
        try {
            const profile = await request();
            for (const name of names) form.elements[name].value = name === 'birthDate' ? (profile[name] || '').slice(0, 10) : profile[name] || '';
            status.textContent = '';
            fields.disabled = save.disabled = false;
        } catch (error) { status.textContent = error.message; }
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('cancel', event => { if (saving) event.preventDefault(); });
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (saving || fields.disabled) return;
        const data = Object.fromEntries(names.map(name => [name, form.elements[name].value.trim()]));
        saving = true;
        fields.disabled = save.disabled = close.disabled = true;
        status.textContent = 'Đang lưu...';
        try {
            const profile = await request({ method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            showName(profile);
            fillCheckout(profile);
            status.textContent = 'Đã lưu thông tin thành công.';
        } catch (error) { status.textContent = error.message; }
        finally { saving = false; fields.disabled = save.disabled = close.disabled = false; }
    });
})();
