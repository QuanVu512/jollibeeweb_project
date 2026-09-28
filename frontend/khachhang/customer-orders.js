(() => {
    const state = { orders: [], ready: false, loaded: false, timer: null };
    const statusLabels = {
        pending: 'Chờ nhà hàng xác nhận',
        preparing: 'Đang chế biến',
        ready_for_delivery: 'Chờ giao hàng',
        delivering: 'Đang giao hàng',
        completed: 'Đã hoàn thành',
        cancelled: 'Đã hủy',
        failed: 'Giao hàng thất bại'
    };
    const terminalStatuses = new Set(['completed', 'cancelled', 'failed']);

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        })[character]);
    }
    function money(value) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);
    }
    function dateTime(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
        }).format(date);
    }
    async function api(path, options = {}) {
        const response = await fetch(path, { credentials: 'same-origin', ...options });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) throw new Error(result.message || 'Không thể thực hiện thao tác.');
        return result;
    }

    window.showToast = (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `site-toast ${type}`;
        toast.textContent = message;
        container.append(toast);
        setTimeout(() => toast.remove(), 4200);
    };

    window.siteConfirm = (message, title = 'Xác nhận') => new Promise(resolve => {
        const dialog = document.getElementById('confirm-dialog');
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        const finish = () => resolve(dialog.returnValue === 'confirm');
        dialog.addEventListener('close', finish, { once: true });
        dialog.showModal();
    });

    function orderCard(order) {
        const pending = order.status === 'pending';
        const statusReason = order.status === 'cancelled' && order.cancellationReason
            ? `<div class="order-reason"><strong>Lý do hủy:</strong> ${escapeHtml(order.cancellationReason)}</div>`
            : order.status === 'failed' && order.failureReason
                ? `<div class="order-reason"><strong>Lý do giao thất bại:</strong> ${escapeHtml(order.failureReason)}</div>`
                : '';
        const items = (order.items || []).map(item => `
            <div class="order-item">
                <span>${escapeHtml(item.name)} × ${Number(item.quantity) || 0}</span>
                <span>${money(item.lineTotal)}</span>
            </div>`).join('');
        return `
            <article class="order-card ${terminalStatuses.has(order.status) ? '' : 'active-order'}">
                <div class="order-card-head">
                    <div><div class="order-code">${escapeHtml(order.orderCode || order._id)}</div><div class="order-time">${escapeHtml(dateTime(order.orderedAt || order.createdAt))}</div></div>
                    <span class="order-status status-${escapeHtml(order.status)}">${escapeHtml(statusLabels[order.status] || order.status)}</span>
                </div>
                <div class="order-items">${items || '<span>Không có chi tiết món</span>'}</div>
                <div class="order-address">Giao đến: ${escapeHtml(order.deliveryAddress || 'Chưa có địa chỉ')}</div>
                ${statusReason}
                <div class="order-total"><span>Tổng tiền</span><span>${money(order.total)}</span></div>
                ${pending ? `<div class="order-actions"><button class="btn-edit-address" data-order-action="address" data-id="${order._id}">Đổi địa chỉ</button><button class="btn-cancel-order" data-order-action="cancel" data-id="${order._id}">Hủy đơn</button></div>` : ''}
            </article>`;
    }
    function renderOrders() {
        const container = document.getElementById('customer-orders-list');
        const active = state.orders.filter(order => !terminalStatuses.has(order.status));
        const history = state.orders.filter(order => terminalStatuses.has(order.status));
        if (!state.orders.length) {
            container.innerHTML = '<p class="orders-empty">Bạn chưa có đơn hàng nào.</p>';
            return;
        }
        container.innerHTML = `${active.length ? `<h3 class="orders-heading">Đơn đang xử lý</h3>${active.map(orderCard).join('')}` : ''}
            ${history.length ? `<h3 class="orders-heading">Lịch sử đặt hàng</h3>${history.map(orderCard).join('')}` : ''}`;
    }
    async function loadOrders({ quiet = false } = {}) {
        const container = document.getElementById('customer-orders-list');
        if (!quiet) container.innerHTML = '<p class="orders-loading">Đang tải đơn hàng...</p>';
        try {
            const result = await api('/api/v1/customer/orders?limit=100');
            const nextOrders = result.data?.items || [];
            if (state.loaded) {
                const previousStatuses = new Map(state.orders.map(order => [order._id, order.status]));
                for (const order of nextOrders) {
                    const oldStatus = previousStatuses.get(order._id);
                    if (oldStatus && oldStatus !== order.status) {
                        window.showToast(`${order.orderCode}: ${statusLabels[order.status] || order.status}`, 'info');
                    }
                }
            }
            state.orders = nextOrders;
            state.loaded = true;
            renderOrders();
        } catch (error) {
            if (!quiet) container.innerHTML = `<p class="orders-empty">${escapeHtml(error.message)}</p>`;
        }
    }
    function switchTab(name) {
        document.querySelectorAll('[data-cart-tab]').forEach(button => button.classList.toggle('active', button.dataset.cartTab === name));
        document.getElementById('cart-draft-panel').hidden = name !== 'draft';
        document.getElementById('cart-orders-panel').hidden = name !== 'orders';
        if (name === 'orders' && state.ready) loadOrders();
    }
    async function cancelOrder(id) {
        const accepted = await window.siteConfirm('Bạn muốn hủy đơn hàng này? Thao tác chỉ thực hiện được khi nhà hàng chưa bắt đầu chế biến.', 'Hủy đơn hàng');
        if (!accepted) return;
        try {
            const result = await api(`/api/v1/customer/orders/${id}/cancel`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
            });
            window.showToast(result.message, 'success');
            window.refreshProductAvailability?.();
            await loadOrders({ quiet: true });
        } catch (error) { window.showToast(error.message, 'error'); }
    }
    function openAddressDialog(id) {
        const order = state.orders.find(item => item._id === id);
        if (!order) return;
        document.getElementById('order-address-id').value = id;
        document.getElementById('order-address-input').value = order.deliveryAddress || '';
        document.getElementById('address-dialog').showModal();
    }
    async function updateAddress(event) {
        event.preventDefault();
        const id = document.getElementById('order-address-id').value;
        const deliveryAddress = document.getElementById('order-address-input').value.trim();
        try {
            const result = await api(`/api/v1/customer/orders/${id}/address`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deliveryAddress })
            });
            document.getElementById('address-dialog').close();
            window.showToast(result.message, 'success');
            await loadOrders({ quiet: true });
        } catch (error) { window.showToast(error.message, 'error'); }
    }

    document.querySelector('.cart-tabs').addEventListener('click', event => {
        const button = event.target.closest('[data-cart-tab]');
        if (button) switchTab(button.dataset.cartTab);
    });
    document.getElementById('customer-orders-list').addEventListener('click', event => {
        const button = event.target.closest('[data-order-action]');
        if (!button) return;
        if (button.dataset.orderAction === 'cancel') cancelOrder(button.dataset.id);
        if (button.dataset.orderAction === 'address') openAddressDialog(button.dataset.id);
    });
    document.getElementById('address-close').addEventListener('click', () => document.getElementById('address-dialog').close());
    document.getElementById('address-form').addEventListener('submit', updateAddress);

    window.customerOrders = {
        setup() {
            if (state.ready) return;
            state.ready = true;
            loadOrders();
            state.timer = setInterval(() => loadOrders({ quiet: true }), 15000);
        },
        async placeOrder(payload) {
            const result = await api('/api/v1/orders', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            await loadOrders({ quiet: true });
            switchTab('orders');
            return result;
        },
        showOrders() { switchTab('orders'); }
    };
})();
