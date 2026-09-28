(() => {
    const today = new Date();
    const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const rules = {
        'reg-name': ['name', 120], 'reg-username': ['username', 50],
        'reg-password': ['password', 72], 'reg-phone': ['phone', 20],
        'reg-email': ['email', 160], 'reg-address': ['address', 300], 'reg-birthdate': ['date'],
    };
    const check = (input, kind) => {
        let message = '';
        const value = input.value.trim();
        if (kind === 'name' && !value) message = 'Vui lòng nhập họ tên.';
        if (kind === 'username' && !/^[a-z0-9._-]{3,50}$/i.test(value)) message = 'Tên đăng nhập cần 3–50 ký tự: chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.';
        if (kind === 'password' && (value.length < 8 || new TextEncoder().encode(input.value).length > 72)) message = 'Mật khẩu cần ít nhất 8 ký tự, tối đa 72 byte UTF-8.';
        if (kind === 'phone' && value && !/^\+?\d{8,15}$/.test(value.replace(/[ ()-]/g, ''))) message = 'Số điện thoại phải có 8–15 chữ số, có thể bắt đầu bằng dấu +.';
        if (kind === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Email không hợp lệ.';
        input.setCustomValidity(message);
    };
    function bind(input, kind, length) {
        if (!input) return;
        if (length) input.maxLength = length;
        if (kind === 'date') input.max = maxDate;
        input.addEventListener('input', () => check(input, kind));
        input.form.addEventListener('submit', event => {
            check(input, kind);
            if (!input.reportValidity()) { event.preventDefault(); event.stopImmediatePropagation(); }
        }, true);
    }
    Object.entries(rules).forEach(([id, rule]) => bind(document.getElementById(id), ...rule));
    const profile = document.getElementById('profile-form');
    if (profile) {
        for (const [name, kind] of Object.entries({ fullName: 'name', phone: 'phone', email: 'email', birthDate: 'date' })) bind(profile.elements[name], kind);
        document.getElementById('profile-open')?.addEventListener('click', () => {
            for (const input of profile.elements) input.setCustomValidity?.('');
        });
    }
})();
