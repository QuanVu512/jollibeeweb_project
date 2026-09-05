let allProducts = []; 
let cart = [];
let isLoggedIn = false;

document.addEventListener('DOMContentLoaded', () => {
    const guestMenu = document.getElementById('guest-menu');
    const userMenu = document.getElementById('user-menu');
    const displayName = document.getElementById('display-user-name');
    const btnLogout = document.getElementById('btn-logout');

    // ==================== PHẦN THÔNG BÁO KHÁCH HÀNG ====================
    // Vùng này dùng cho nút chuông thông báo trên homepage khách hàng.
    // Nếu cần sửa giao diện/thay đổi cách lấy thông báo, bạn chỉnh trong vùng này.
    const notificationWrapper = document.getElementById('notification-wrapper');
    const notificationButton = document.getElementById('notification-button');
    const notificationPanel = document.getElementById('notification-panel');
    const notificationClose = document.getElementById('notification-close');
    const notificationList = document.getElementById('notification-list');
    const notificationCount = document.getElementById('notification-count');
    let notificationsLoaded = false;
    let notificationsReady = false;
    // ================== HẾT PHẦN KHAI BÁO THÔNG BÁO ==================

    async function checkLoginStatus() {
        try {
            const response = await fetch('http://localhost:3000/api/v1/auth/me');
            const result = await response.json();

            if (response.ok && result.success) {
                isLoggedIn = true;

                guestMenu.style.display = 'none';
                userMenu.style.display = 'flex';

                if (result.data.user.role === 'customer' && notificationWrapper) {
                    notificationWrapper.style.display = 'flex';
                    setupNotifications();
                }
                displayName.textContent = result.data.user.displayName || result.data.user.fullName || "Khách hàng";
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
            const response = await fetch('http://localhost:3000/api/v1/customer/notifications?limit=8', {
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

    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:3000/api/v1/products');
            if (!response.ok) {
                throw new Error("Không thể kết nối đến API");
            }

            const jsonResponse = await response.json();
            allProducts = jsonResponse.data.items; 
            renderProducts(allProducts);

        } catch (error) {
            console.error("Lỗi lấy sản phẩm, đang dùng dữ liệu giả:", error);

            const mockProducts = [
                { _id: "1", name: "2 Miếng Gà Giòn Vui Vẻ", price: 70000, image: "https://jollibee.com.vn/media/catalog/product/cache/42b2ab66a7ec6a6443cba394ba0d15e2/2/m/2m_g_gi_n.png" },
                { _id: "2", name: "Mì Ý Sốt Xúc Xích", price: 40000, image: "https://jollibee.com.vn/media/catalog/product/cache/42b2ab66a7ec6a6443cba394ba0d15e2/m/_/m_y.png" },
                { _id: "3", name: "Combo 1 Người Gà Sốt Cay", price: 85000, image: "https://jollibee.com.vn/media/catalog/product/cache/42b2ab66a7ec6a6443cba394ba0d15e2/1/m/1m_g_cay_1_khoai_v_a_1_pepsi_l_n.png" },
                { _id: "4", name: "Burger Tôm Gà", price: 35000, image: "https://jollibee.com.vn/media/catalog/product/cache/42b2ab66a7ec6a6443cba394ba0d15e2/b/u/burger_g_.png" }
            ];
            allProducts = mockProducts;
            renderProducts(allProducts);
        }
    }

    checkLoginStatus();
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
            <button onclick="addToCart('${product._id}')" style="background-color: #e21b22; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 20px; cursor: pointer; width: 100%; transition: background 0.2s;">Thêm vào giỏ</button>
        `;

        productCard.onmouseover = () => productCard.style.transform = 'scale(1.05)';
        productCard.onmouseleave = () => productCard.style.transform = 'scale(1)';

        productGrid.appendChild(productCard);
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

    const existingItem = cart.find(item => item._id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.lineTotal = existingItem.quantity * existingItem.unitPrice;
    } else {
        const imageUrl = (product.image && product.image.length > 0) ? product.image : "https://jollibee.com.vn/media/logo-footer.png";
        
        cart.push({
            _id: product._id,
            name: product.name,
            image: imageUrl, 
            quantity: 1,
            unitPrice: product.price,
            lineTotal: product.price
        });
    }

    updateCartUI();
    toggleCart(true); 
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total-price');
    const cartCountElement = document.getElementById('cart-count');

    if (!cartItemsContainer) return; 

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #666; margin-top: 20px;">Giỏ hàng đang trống</p>';
        cartTotalElement.innerText = '0 ₫';
        cartCountElement.innerText = '0';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        total += item.lineTotal;
        totalItems += item.quantity;

        const formattedUnitPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice);
        const formattedLineTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.lineTotal);

        cartItemsContainer.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 15px 0;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: contain; border-radius: 8px; border: 1px solid #eee; padding: 2px;">
                    <div>
                        <strong style="color: #333; font-size: 14px;">${item.name}</strong>
                        <p style="margin: 5px 0; font-size: 13px; color: #666;">Đơn giá: ${formattedUnitPrice}</p>
                        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                            <button onclick="changeQuantity(${index}, -1)" style="width: 25px; height: 25px; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 4px;">-</button>
                            <span style="font-weight: bold;">${item.quantity}</span>
                            <button onclick="changeQuantity(${index}, 1)" style="width: 25px; height: 25px; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 4px;">+</button>
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
        `;
    });

    cartTotalElement.innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
    cartCountElement.innerText = totalItems;
}

function changeQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    } else {
        cart[index].lineTotal = cart[index].quantity * cart[index].unitPrice;
    }
    updateCartUI();
}

function removeFromCart(index) {
    if (confirm("Bạn có chắc muốn xóa món này khỏi giỏ hàng?")) {
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
    if (cart.length === 0) return alert("Giỏ hàng đang trống!");

    if (!isLoggedIn) {
        const userWantsToLogin = confirm("Bạn cần đăng nhập tài khoản để tiếp tục đặt hàng!\n\nNhấn 'OK' để sang trang Đăng nhập.\nNhấn 'Hủy' (Cancel) để ở lại.");
        
        if (userWantsToLogin) {
            window.location.href = "/admin/login.html"; 
        }
        return; 
    }

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;

    if (!name || !phone || !address) return alert("Vui lòng điền đủ thông tin giao hàng!");
    
    const orderPayload = {
        customerName: name,
        customerPhone: phone,
        deliveryAddress: address,
        orderType: "delivery",
        source: "web",
        branchCode: "MAIN",
        items: cart.map(item => ({
            productId: item._id, 
            product: item._id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal
        }))
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'  
            },
            body: JSON.stringify(orderPayload) 
        });
        
        const result = await response.json();

        if (response.ok) {
            alert("Chúc mừng! Đơn hàng của bạn đã được tạo thành công!");
            cart = [];
            updateCartUI();
            toggleCart(false);
            
            document.getElementById('cust-name').value = '';
            document.getElementById('cust-phone').value = '';
            document.getElementById('cust-address').value = '';
        } else {
            alert("Lỗi từ server: " + (result.message || "Không thể tạo đơn hàng"));
        }

    } catch (error) {
        console.error("Lỗi khi bắn API:", error);
        alert("Không thể kết nối đến Backend. Vui lòng kiểm tra lại Server!");
    }
}
