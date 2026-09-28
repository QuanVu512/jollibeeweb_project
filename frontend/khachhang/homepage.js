let allProducts = []; 
let cart = [];
let isLoggedIn = false;
let orderSubmissionInProgress = false;
const CART_STORAGE_PREFIX = 'jollibee_cart_v1_';
let cartStorageKey = `${CART_STORAGE_PREFIX}guest`;

function readStoredCart(key) {
    try {
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        if (!Array.isArray(stored)) return [];
        return stored.filter(item => item && typeof item._id === 'string' && typeof item.name === 'string')
            .map(item => ({
                _id: item._id,
                name: item.name,
                image: typeof item.image === 'string' ? item.image : '',
                quantity: Math.max(0, Number(item.quantity) || 0),
                unitPrice: Math.max(0, Number(item.unitPrice) || 0),
                lineTotal: Math.max(0, Number(item.unitPrice) || 0) * Math.max(0, Number(item.quantity) || 0),
                maxQuantity: Number.isInteger(Number(item.maxQuantity)) ? Math.max(0, Number(item.maxQuantity)) : null,
                selected: item.selected !== false
            }));
    } catch (error) {
        console.warn('Không thể đọc giỏ hàng đã lưu:', error);
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch (error) {
        console.warn('Không thể lưu giỏ hàng:', error);
    }
}

function useCartForUser(user) {
    const userKey = `${CART_STORAGE_PREFIX}${user.id}`;
    const savedUserCart = readStoredCart(userKey);
    const guestCart = cartStorageKey === `${CART_STORAGE_PREFIX}guest` ? cart : [];
    cartStorageKey = userKey;
    cart = savedUserCart.length ? savedUserCart : guestCart;
    saveCart();
    if (guestCart.length && !savedUserCart.length) localStorage.removeItem(`${CART_STORAGE_PREFIX}guest`);
    updateCartUI();
}

document.addEventListener('DOMContentLoaded', () => {
    const guestMenu = document.getElementById('guest-menu');
    const userMenu = document.getElementById('user-menu');
    const displayName = document.getElementById('display-user-name');
    const btnLogout = document.getElementById('btn-logout');

    
    const notificationWrapper = document.getElementById('notification-wrapper');
    const notificationButton = document.getElementById('notification-button');
    const notificationPanel = document.getElementById('notification-panel');
    const notificationClose = document.getElementById('notification-close');
    const notificationList = document.getElementById('notification-list');
    const notificationCount = document.getElementById('notification-count');
    let notificationsLoaded = false;
    let notificationsReady = false;

    async function checkLoginStatus() {
        try {
            const response = await fetch('/api/v1/auth/me');
            const result = await response.json();

            if (response.ok && result.success) {
                isLoggedIn = true;
                useCartForUser(result.data.user);

                guestMenu.style.display = 'none';
                userMenu.style.display = 'flex';

                if (result.data.user.role === 'customer' && notificationWrapper) {
                    notificationWrapper.style.display = 'flex';
                    setupNotifications();
                }
                displayName.textContent = result.data.user.displayName || result.data.user.fullName || "Khách hàng";
                if (result.data.user.role === 'customer') {
                    window.setupCustomerProfile();
                    window.customerOrders.setup();
                }
            }
        } catch (error) {
            console.log("Trạng thái: Khách vãng lai");
        }
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch('/api/v1/auth/logout', { method: 'POST' });
                window.location.reload();
            } catch (error) {
                console.error(error);
            }
        });
    }

    // ==================== LOGIC THÔNG BÁO KHÁCH HÀNG ====================
    // Các hàm bên dưới xử lý:
    // 1. Gọi API lấy thông báo từ backend.
    // 2. Hiển thị số lượng thông báo trên nút chuông.
    // 3. Mở/đóng bảng danh sách thông báo.
    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatNotificationTime(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    function renderNotifications(items) {
        if (!notificationList || !notificationCount) return;

        if (!items || items.length === 0) {
            notificationList.innerHTML = '<p class="notification-empty">Hiện chưa có thông báo mới.</p>';
            notificationCount.style.display = 'none';
            notificationCount.textContent = '0';
            return;
        }

        notificationCount.textContent = items.length > 9 ? '9+' : String(items.length);
        notificationCount.style.display = 'flex';

        notificationList.innerHTML = items.map(item => {
            const isImportant = item.priority === 'important';
            const time = formatNotificationTime(item.sentAt || item.createdAt);
            return `
                <article class="notification-item">
                    <div class="notification-item-title">
                        <span>${escapeHtml(item.title)}</span>
                        ${isImportant ? '<span class="notification-priority">Quan trọng</span>' : ''}
                    </div>
                    <div class="notification-message">${escapeHtml(item.message)}</div>
                    ${time ? `<div class="notification-time">${time}</div>` : ''}
                </article>
            `;
        }).join('');
    }

    async function loadNotifications() {
        if (!notificationList) return;
        notificationList.innerHTML = '<p class="notification-empty">Đang tải thông báo...</p>';

        try {
            const response = await fetch('/api/v1/customer/notifications?limit=8', {
                credentials: 'include'
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Không thể tải thông báo.');
            }

            renderNotifications(result.data?.items || []);
            notificationsLoaded = true;
        } catch (error) {
            console.error('Lỗi tải thông báo:', error);
            notificationList.innerHTML = '<p class="notification-error">Không thể tải thông báo. Vui lòng thử lại sau.</p>';
        }
    }

    function setupNotifications() {
        if (!notificationWrapper || !notificationButton || !notificationPanel) return;
        if (notificationsReady) return;
        notificationsReady = true;

        notificationButton.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            notificationPanel.classList.toggle('show');

            if (notificationPanel.classList.contains('show') && !notificationsLoaded) {
                await loadNotifications();
            }
        });

        if (notificationClose) {
            notificationClose.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                notificationPanel.classList.remove('show');
            });
        }

        document.addEventListener('click', (event) => {
            if (!notificationWrapper.contains(event.target)) {
                notificationPanel.classList.remove('show');
            }
        });

        loadNotifications();
    }
    // ================== HẾT LOGIC THÔNG BÁO KHÁCH HÀNG ==================

    let productsLoading = false;
    async function fetchProducts(quiet = false) {
        if (productsLoading || orderSubmissionInProgress) return;
        productsLoading = true;
        try {
            const response = await fetch('/api/v1/products');
            if (!response.ok) {
                throw new Error("Không thể kết nối đến API");
            }

            const jsonResponse = await response.json();
            allProducts = jsonResponse.data.items; 
            cart = cart.map(item => {
                const product = allProducts.find(candidate => candidate._id === item._id);
                const maxQuantity = product ? Math.max(0, Number(product.availableQuantity) || 0) : 0;
                const quantity = Math.min(item.quantity, maxQuantity);
                return { ...item, maxQuantity, quantity, lineTotal: quantity * item.unitPrice };
            });
            if (!document.activeElement?.classList.contains('cart-quantity-input')) updateCartUI();
            if (!quiet) renderProducts(allProducts);
            else document.querySelectorAll('[data-product-id]').forEach(button => {
                const product = allProducts.find(item => item._id === button.dataset.productId);
                const unavailable = !product || !product.canOrder;
                button.disabled = unavailable;
                button.textContent = unavailable ? 'Món ăn hết' : 'Thêm vào giỏ';
                button.style.backgroundColor = unavailable ? '#aaa' : '#e21b22';
                button.style.cursor = unavailable ? 'not-allowed' : 'pointer';
            });

        } catch (error) {
            console.error('Không thể tải thực đơn:', error);
            if (!quiet) {
                allProducts = [];
                document.getElementById('product-grid').textContent = 'Không thể tải thực đơn. Vui lòng tải lại trang để thử lại.';
            }
        } finally {
            productsLoading = false;
        }
    }
    window.refreshProductAvailability = () => fetchProducts(true);
    setInterval(() => { if (!document.hidden) fetchProducts(true); }, 5000);
    window.addEventListener('focus', () => fetchProducts(true));

    checkLoginStatus();
    cart = readStoredCart(cartStorageKey);
    updateCartUI();
    fetchProducts();
});


function renderProducts(productList) {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;
    
    productGrid.innerHTML = ''; 

    productList.forEach(product => {
        const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);

        const imageUrl = (product.image && product.image.length > 0) 
         ? product.image 
         : "https://jollibee.com.vn/media/catalog/product/cache/42b2ab66a7ec6a6443cba394ba0d15e2/2/m/2m_g_gi_n.png";

        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.cssText = `
            width: 250px; 
            border: 1px solid #eee; 
            border-radius: 10px; 
            padding: 15px; 
            text-align: center; 
            background: white; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            transition: transform 0.2s;
        `;

        productCard.innerHTML = `
            <img src="${imageUrl}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: contain; margin-bottom: 15px;">
            <h3 style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; height: 40px; overflow: hidden; display: flex; align-items: center; justify-content: center;">${product.name}</h3>
            <p style="color: #e21b22; font-size: 18px; font-weight: bold; margin-bottom: 15px;">${formattedPrice}</p>
            <button ${product.canOrder === false ? 'disabled' : ''} onclick="addToCart('${product._id}')" style="background-color: ${product.canOrder === false ? '#aaa' : '#e21b22'}; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 20px; cursor: ${product.canOrder === false ? 'not-allowed' : 'pointer'}; width: 100%; transition: background 0.2s;">${product.canOrder === false ? 'Món ăn hết' : 'Thêm vào giỏ'}</button>
        `;

        productCard.onmouseover = () => productCard.style.transform = 'scale(1.05)';
        productCard.onmouseleave = () => productCard.style.transform = 'scale(1)';

        productGrid.appendChild(productCard);
        productCard.querySelector('button').dataset.productId = product._id;
    });
}


function searchProducts() {
    const inputElement = document.getElementById('search-input');
    if (!inputElement) return;
    
    const keyword = inputElement.value.toLowerCase().trim(); 
    
    const filteredProducts = allProducts.filter(product => {
        const productName = (product.name || "").toLowerCase();
        return productName.includes(keyword);
    });
    
    renderProducts(filteredProducts);
}


function filterCategory(categoryKeyword, event) {
    if (event) event.preventDefault(); 

    // 1. IN RA ĐỂ KIỂM TRA TRƯỚC KHI LỌC
    console.log("==============================");
    console.log("👉 Nút bạn vừa bấm có từ khóa là:", categoryKeyword);
    console.log("📦 Món ăn đầu tiên Web nhận được từ DB là:", allProducts[0]);
    console.log("==============================");

    if (categoryKeyword === 'ALL') {
        renderProducts(allProducts);
        return;
    }

    const cleanKeyword = categoryKeyword.replace(/-/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    const filtered = allProducts.filter(product => {
        const catName = (product.category?.name || product.category || "").toString();
        const cleanCat = catName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const prodName = (product.name || "").toString();
        const cleanProd = prodName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const catCode = (product.categoryCode || "").toLowerCase();

        // Kiểm tra xem món nào được lọt vào danh sách
        const isMatch = cleanCat.includes(cleanKeyword) || cleanProd.includes(cleanKeyword) || catCode.includes(cleanKeyword);
        if (isMatch) {
            console.log("✅ Đã tìm trúng món:", product.name);
        }
        return isMatch;
    });

    console.log("🎯 Tổng số món ăn lọc được:", filtered.length);
    renderProducts(filtered);
    
    const grid = document.getElementById('product-grid');
    if(grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function addToCart(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    if (product.canOrder === false) return window.showToast('Món ăn hết. Vui lòng chọn món khác.', 'info');
    const maxQuantity = Math.max(0, Number(product.availableQuantity) || 0);

    const existingItem = cart.find(item => item._id === productId);
    if (existingItem) {
        if (existingItem.quantity >= maxQuantity) return window.showToast(`Món này chỉ còn tối đa ${maxQuantity} phần.`, 'info');
        existingItem.quantity += 1;
        existingItem.maxQuantity = maxQuantity;
        existingItem.lineTotal = existingItem.quantity * existingItem.unitPrice;
    } else {
        const imageUrl = (product.image && product.image.length > 0) ? product.image : "https://jollibee.com.vn/media/logo-footer.png";
        
        cart.push({
            _id: product._id,
            name: product.name,
            image: imageUrl, 
            quantity: 1,
            unitPrice: product.price,
            lineTotal: product.price,
            maxQuantity,
            selected: true
        });
    }

    updateCartUI();
    toggleCart(true); 
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total-price');
    const cartCountElement = document.getElementById('cart-count');
    const draftTabCount = document.getElementById('draft-tab-count');
    const selectAll = document.getElementById('cart-select-all');
    const selectedSummary = document.getElementById('cart-selected-summary');

    if (!cartItemsContainer) return;
    saveCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #666; margin-top: 20px;">Giỏ hàng đang trống</p>';
        cartTotalElement.innerText = '0 ₫';
        cartCountElement.innerText = '0';
        draftTabCount.innerText = '(0)';
        selectedSummary.innerText = 'Chưa chọn sản phẩm';
        selectAll.checked = false;
        selectAll.indeterminate = false;
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        if (item.selected !== false) total += item.lineTotal;
        totalItems += item.quantity;

        const formattedUnitPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice);
        const formattedLineTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.lineTotal);

        cartItemsContainer.innerHTML += `
            <div class="cart-item-row ${item.selected === false ? 'unselected' : ''}">
                <input class="cart-item-check" type="checkbox" aria-label="Chọn ${item.name}" ${item.selected === false ? '' : 'checked'} onchange="toggleCartItemSelection(${index}, this.checked)">
                <div class="cart-item-main">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: contain; border-radius: 8px; border: 1px solid #eee; padding: 2px;">
                    <div>
                        <strong style="color: #333; font-size: 14px;">${item.name}</strong>
                        <p style="margin: 5px 0; font-size: 13px; color: #666;">Đơn giá: ${formattedUnitPrice}</p>
                        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                            <button ${item.quantity <= 0 ? 'disabled' : ''} onclick="changeQuantity(${index}, -1)" class="cart-quantity-button">-</button>
                            <input class="cart-quantity-input" type="number" min="0" max="${item.maxQuantity ?? item.quantity}" value="${item.quantity}" onchange="setCartItemQuantity(${index}, this.value)" aria-label="Số lượng ${item.name}">
                            <button ${item.maxQuantity !== null && item.quantity >= item.maxQuantity ? 'disabled' : ''} onclick="changeQuantity(${index}, 1)" class="cart-quantity-button">+</button>
                        </div>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px;">
                    <span style="font-weight: bold; color: #e21b22; font-size: 15px;">${formattedLineTotal}</span>
                    <button onclick="removeFromCart(${index})" title="Xóa món này" style="background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" onmouseover="this.style.stroke='#e21b22'" onmouseout="this.style.stroke='#999'" style="transition: stroke 0.2s;">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
                </div>
            </div>
        `;
    });

    cartTotalElement.innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
    cartCountElement.innerText = totalItems;
    draftTabCount.innerText = `(${totalItems})`;
    const selectedItems = cart.filter(item => item.selected !== false);
    const selectedQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    selectedSummary.innerText = selectedQuantity ? `${selectedQuantity} sản phẩm được chọn` : 'Chưa chọn sản phẩm';
    selectAll.checked = selectedItems.length === cart.length;
    selectAll.indeterminate = selectedItems.length > 0 && selectedItems.length < cart.length;
}

function toggleCartItemSelection(index, checked) {
    if (!cart[index]) return;
    cart[index].selected = checked;
    updateCartUI();
}

function toggleSelectAllCartItems(checked) {
    cart.forEach(item => { item.selected = checked; });
    updateCartUI();
}

function changeQuantity(index, delta) {
    if (!cart[index]) return;
    setCartItemQuantity(index, cart[index].quantity + delta);
}

function setCartItemQuantity(index, rawValue) {
    const item = cart[index];
    if (!item) return;
    const requested = Number.parseInt(rawValue, 10);
    const maxQuantity = item.maxQuantity === null ? Math.max(0, requested || 0) : item.maxQuantity;
    item.quantity = Math.min(maxQuantity, Math.max(0, Number.isFinite(requested) ? requested : 0));
    item.lineTotal = item.quantity * item.unitPrice;
    updateCartUI();
}

async function removeFromCart(index) {
    if (await window.siteConfirm("Bạn có chắc muốn xóa món này khỏi giỏ hàng?", "Xóa món")) {
        cart.splice(index, 1); 
        updateCartUI(); 
    }
}

function toggleCart(forceShow = null) {
    const modal = document.getElementById('cart-modal');
    if(!modal) return;
    if (forceShow === true) {
        modal.style.display = 'flex';
    } else if (forceShow === false) {
        modal.style.display = 'none';
    } else {
        modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
    }
}

async function submitOrder() {
    if (orderSubmissionInProgress) return;
    if (cart.length === 0) return window.showToast("Giỏ hàng đang trống!", 'info');
    const selectedCartItems = cart.filter(item => item.selected !== false && item.quantity > 0);
    if (selectedCartItems.length === 0) return window.showToast("Vui lòng tick chọn ít nhất một sản phẩm để thanh toán.", 'info');

    if (!isLoggedIn) {
        const userWantsToLogin = await window.siteConfirm("Bạn cần đăng nhập tài khoản để tiếp tục đặt hàng.", "Đăng nhập để đặt hàng");
        
        if (userWantsToLogin) {
            window.location.href = "/admin/login.html"; 
        }
        return; 
    }

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;

    if (!name || !phone || !address) return window.showToast("Vui lòng điền đủ thông tin giao hàng!", 'error');
    
    const orderPayload = {
        customerName: name,
        customerPhone: phone,
        deliveryAddress: address,
        orderType: "delivery",
        source: "web",
        branchCode: "MAIN",
        checkoutToken: typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        items: selectedCartItems.map(item => ({
            productId: item._id, 
            product: item._id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal
        }))
    };
    
    const checkoutButton = document.querySelector('.btn-checkout');
    orderSubmissionInProgress = true;
    checkoutButton.disabled = true;
    checkoutButton.textContent = 'ĐANG GỬI ĐƠN...';
    try {
        const result = await window.customerOrders.placeOrder(orderPayload);
        window.showToast(result.message || "Đặt hàng thành công!", 'success');
        const orderedIds = new Set(selectedCartItems.map(item => item._id));
        cart = cart.filter(item => !orderedIds.has(item._id));
        updateCartUI();

    } catch (error) {
        console.error("Lỗi đặt hàng:", error);
        window.showToast(error.message || "Không thể kết nối đến Backend.", 'error');
    } finally {
        orderSubmissionInProgress = false;
        window.refreshProductAvailability?.();
        checkoutButton.disabled = false;
        checkoutButton.textContent = 'TIẾN HÀNH ĐẶT HÀNG';
    }
}
