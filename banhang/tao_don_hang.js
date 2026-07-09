document.addEventListener("DOMContentLoaded", async () => {
  let checkRoleGuard = setInterval(() => {
    if (window.RoleGuard && window.RoleGuard.user) {
      clearInterval(checkRoleGuard);
      initPage();
    }
  }, 100);

  function initPage() {
    const user = window.RoleGuard.user;
    document.querySelector("#staff-name").textContent = user.displayName || user.username;

    const btnLogout = document.querySelector("#btn-logout");
    btnLogout.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await fetch("/api/v1/auth/logout", { method: "POST" });
        location.replace("/admin/login.html");
      } catch (err) {
        window.BanhangUi.toast("Đăng xuất thất bại.", "error");
      }
    });

    loadProducts();
  }

  let products = [];
  let cart = {};

  const menuContainer = document.querySelector("#menu-container");
  const cartItems = document.querySelector("#cart-items");
  const cartTotal = document.querySelector("#cart-total");
  const btnSubmitOrder = document.querySelector("#btn-submit-order");
  const orderForm = document.querySelector("#order-form");

  async function loadProducts() {
    try {
      const res = await window.BanhangApi.request("/products");
      products = res.data.items;
      renderProducts();
    } catch (err) {
      menuContainer.innerHTML = `<p style="color: red; text-align: center; grid-column: 1/-1;">Lỗi khi tải thực đơn: ${err.message}</p>`;
    }
  }

  function renderProducts() {
    if (products.length === 0) {
      menuContainer.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: #888;">Không có món ăn nào đang hoạt động.</p>`;
      return;
    }

    menuContainer.innerHTML = products.map(p => `
      <div class="food-card">
        <h4 style="margin: 0 0 10px 0; min-height: 45px; color: #2b2b2b; font-size: 15px;">${p.name}</h4>
        <p style="color: #d8262f; font-weight: 900; font-size: 18px; margin: 5px 0;">${formatPrice(p.price)}đ</p>
        <button class="btn-add" data-id="${p._id}">THÊM +</button>
      </div>
    `).join("");

    menuContainer.querySelectorAll(".btn-add").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const product = products.find(p => p._id === id);
        addToCart(product);
      });
    });
  }

  function addToCart(product) {
    if (cart[product._id]) {
      cart[product._id].quantity++;
    } else {
      cart[product._id] = { product, quantity: 1 };
    }
    renderCart();
  }

  function updateQuantity(productId, qty) {
    const quantity = parseInt(qty);
    if (quantity > 0) {
      cart[productId].quantity = quantity;
    } else {
      delete cart[productId];
    }
    renderCart();
  }

  function removeFromCart(productId) {
    delete cart[productId];
    renderCart();
  }

  function renderCart() {
    const keys = Object.keys(cart);
    if (keys.length === 0) {
      cartItems.innerHTML = `
        <tr>
          <td colspan="3" align="center" style="color: #888; padding: 20px 0;">Giỏ hàng trống</td>
        </tr>
      `;
      cartTotal.textContent = "0đ";
      btnSubmitOrder.disabled = true;
      return;
    }

    let total = 0;
    cartItems.innerHTML = keys.map(key => {
      const item = cart[key];
      const itemTotal = item.product.price * item.quantity;
      total += itemTotal;

      return `
        <tr>
          <td style="padding: 10px 0;"><b>${item.product.name}</b></td>
          <td style="padding: 10px 0;">
            <input type="number" class="qty-input" data-id="${item.product._id}" value="${item.quantity}" min="1">
          </td>
          <td style="padding: 10px 0; font-weight: bold; color: #d8262f;" align="right">
            ${formatPrice(itemTotal)}đ
            <button class="btn-remove" data-id="${item.product._id}" style="margin-left: 10px;">✕</button>
          </td>
        </tr>
      `;
    }).join("");

    cartTotal.textContent = formatPrice(total) + "đ";
    btnSubmitOrder.disabled = false;

    cartItems.querySelectorAll(".qty-input").forEach(input => {
      input.addEventListener("change", (e) => {
        updateQuantity(input.dataset.id, e.target.value);
      });
    });

    cartItems.querySelectorAll(".btn-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        removeFromCart(btn.dataset.id);
      });
    });
  }

  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const orderType = document.querySelector("#order-type").value;
    const deliveryAddress = document.querySelector("#delivery-address").value;
    const customerName = document.querySelector("#customer-name").value;
    const customerPhone = document.querySelector("#customer-phone").value;

    const itemsPayload = Object.keys(cart).map(key => ({
      productId: key,
      quantity: cart[key].quantity
    }));

    btnSubmitOrder.disabled = true;
    btnSubmitOrder.textContent = "Đang đặt hàng...";

    try {
      const result = await window.BanhangApi.request("/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName,
          customerPhone,
          orderType,
          deliveryAddress,
          items: itemsPayload
        })
      });

      const orderCode = result?.data?.order?.orderCode;
      window.BanhangUi.toast(
        orderCode ? `Đã tạo đơn ${orderCode}. Đơn đã chuyển xuống bếp.` : "Đặt hàng thành công. Đơn đã chuyển xuống bếp.",
        "success",
        4500
      );
      cart = {};
      orderForm.reset();
      renderCart();
      btnSubmitOrder.textContent = "Đặt hàng";
    } catch (err) {
      window.BanhangUi.toast("Lỗi đặt đơn: " + err.message, "error", 5200);
      btnSubmitOrder.disabled = false;
      btnSubmitOrder.textContent = "Đặt hàng";
    }
  });

  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price);
  }
});
