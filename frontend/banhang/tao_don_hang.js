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
    loadActiveTables();
    setInterval(loadActiveTables, 8000);
  }

  let products = [];
  let cart = {};

  const menuContainer = document.querySelector("#menu-container");
  const cartItems = document.querySelector("#cart-items");
  const cartTotal = document.querySelector("#cart-total");
  const btnSubmitOrder = document.querySelector("#btn-submit-order");
  const orderForm = document.querySelector("#order-form");
  const tableInput = document.querySelector("#table-number");
  const tableWarning = document.querySelector("#table-warning");

  let activeTables = new Map(); // clean table number -> orderCode

  async function loadActiveTables() {
    try {
      const res = await window.BanhangApi.request("/orders/pending");
      const items = res?.data?.items || [];
      activeTables.clear();
      items.forEach(o => {
        if (o.orderType !== "delivery" && o.tableNumber) {
          const cleanTable = String(o.tableNumber).replace(/^Bàn\s*/i, "").trim();
          activeTables.set(cleanTable, o.orderCode);
        }
      });
      validateTableNumber();
    } catch (err) {
      console.warn("Không thể tải danh sách bàn đang hoạt động:", err.message);
    }
  }

  function validateTableNumber() {
    if (!tableInput) return true;
    const val = tableInput.value.trim();
    if (!val) {
      if (tableWarning) tableWarning.style.display = "none";
      tableInput.style.borderColor = "#ddd";
      return false;
    }
    const cleanVal = String(Number(val));
    if (activeTables.has(cleanVal)) {
      const code = activeTables.get(cleanVal);
      if (tableWarning) {
        tableWarning.textContent = `⚠️ Bàn số ${cleanVal} hiện đang có đơn hàng (#${code}) chưa hoàn tất! Vui lòng chọn số bàn khác.`;
        tableWarning.style.display = "block";
      }
      tableInput.style.borderColor = "#d8262f";
      return false;
    } else {
      if (tableWarning) tableWarning.style.display = "none";
      tableInput.style.borderColor = "#28a745";
      return true;
    }
  }

  tableInput?.addEventListener("input", validateTableNumber);
  tableInput?.addEventListener("change", validateTableNumber);

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

    menuContainer.innerHTML = products.map(p => {
      const hasStockInfo = p.availableServings !== null && p.availableServings !== undefined;
      const isOutOfStock = hasStockInfo && p.availableServings <= 0;

      const stockBadge = hasStockInfo
        ? (isOutOfStock
            ? `<p style="margin: 4px 0 8px 0; color: #d8262f; font-weight: 800; font-size: 13px;">⚠️ Hết nguyên liệu (0 suất)</p>`
            : `<p style="margin: 4px 0 8px 0; color: #28a745; font-weight: 700; font-size: 13px;">🟢 Còn lại: ${p.availableServings} suất</p>`)
        : `<p style="margin: 4px 0 8px 0; color: #888; font-size: 13px;">Sẵn sàng phục vụ</p>`;

      const btnHtml = isOutOfStock
        ? `<button class="btn-add" disabled style="background: #bbb; cursor: not-allowed; box-shadow: none;">HẾT NGUYÊN LIỆU</button>`
        : `<button class="btn-add" data-id="${p._id}">THÊM +</button>`;

      return `
        <div class="food-card">
          <h4 style="margin: 0 0 6px 0; min-height: 40px; color: #2b2b2b; font-size: 15px;">${p.name}</h4>
          <p style="color: #d8262f; font-weight: 900; font-size: 17px; margin: 4px 0;">${formatPrice(p.price)}đ</p>
          ${stockBadge}
          ${btnHtml}
        </div>
      `;
    }).join("");

    menuContainer.querySelectorAll(".btn-add:not([disabled])").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const product = products.find(p => p._id === id);
        if (product) addToCart(product);
      });
    });
  }

  function addToCart(product) {
    const hasStockInfo = product.availableServings !== null && product.availableServings !== undefined;
    if (hasStockInfo && product.availableServings <= 0) {
      window.BanhangUi.toast(`Món "${product.name}" hiện đã hết nguyên liệu (0 suất)!`, "error");
      return;
    }

    const currentQty = cart[product._id] ? cart[product._id].quantity : 0;
    const nextQty = currentQty + 1;

    // Kiểm tra nguyên liệu: nếu thiếu thì báo chỉ còn bao nhiêu suất đó
    if (hasStockInfo && nextQty > product.availableServings) {
      window.BanhangUi.toast(`Nguyên liệu không đủ! Món "${product.name}" trong kho chỉ còn ${product.availableServings} suất.`, "error");
      return;
    }

    if (cart[product._id]) {
      cart[product._id].quantity = nextQty;
    } else {
      cart[product._id] = { product, quantity: 1 };
    }
    renderCart();
  }

  function updateQuantity(productId, rawQty) {
    const item = cart[productId];
    if (!item) return;

    const qty = parseInt(rawQty, 10);
    // Kiểm tra số lượng món không được âm và phải lớn hơn 0
    if (isNaN(qty) || qty <= 0) {
      window.BanhangUi.toast("Số lượng món ăn không được âm và phải lớn hơn 0!", "error");
      item.quantity = 1;
      renderCart();
      return;
    }

    // Kiểm tra nguyên liệu: nếu thiếu thì báo chỉ còn bao nhiêu suất đó
    const p = item.product;
    const hasStockInfo = p && p.availableServings !== null && p.availableServings !== undefined;
    if (hasStockInfo && qty > p.availableServings) {
      window.BanhangUi.toast(`Nguyên liệu không đủ! Món "${p.name}" trong kho chỉ còn ${p.availableServings} suất.`, "error");
      item.quantity = p.availableServings > 0 ? p.availableServings : 1;
      renderCart();
      return;
    }

    item.quantity = qty;
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
          <td style="padding: 10px 0;">
            <b>${item.product.name}</b>
            <div style="font-size: 12px; color: #666;">${formatPrice(item.product.price)}đ / suất</div>
          </td>
          <td style="padding: 10px 0;" align="center">
            <input type="number" class="qty-input" data-id="${item.product._id}" value="${item.quantity}" min="1" step="1">
          </td>
          <td style="padding: 10px 0; font-weight: bold; color: #d8262f;" align="right">
            ${formatPrice(itemTotal)}đ
            <button class="btn-remove" data-id="${item.product._id}" style="margin-left: 10px;" title="Xóa món">✕</button>
          </td>
        </tr>
      `;
    }).join("");

    // Hiện tổng tiền
    cartTotal.textContent = formatPrice(total) + "đ";
    btnSubmitOrder.disabled = false;

    cartItems.querySelectorAll(".qty-input").forEach(input => {
      input.addEventListener("change", (e) => {
        updateQuantity(input.dataset.id, e.target.value);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "-" || e.key === "e") e.preventDefault();
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

    const keys = Object.keys(cart);
    if (keys.length === 0) {
      window.BanhangUi.toast("Giỏ hàng đang trống. Vui lòng chọn món!", "error");
      return;
    }

    // 1. Kiểm tra số lượng từng món không âm và > 0
    for (const key of keys) {
      const item = cart[key];
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty <= 0) {
        window.BanhangUi.toast(`Số lượng món "${item.product.name}" không hợp lệ. Số lượng phải lớn hơn 0!`, "error");
        return;
      }
      if (item.product.availableServings !== null && item.product.availableServings !== undefined && qty > item.product.availableServings) {
        window.BanhangUi.toast(`Nguyên liệu không đủ! Món "${item.product.name}" trong kho chỉ còn ${item.product.availableServings} suất.`, "error");
        return;
      }
    }

    // 2. Bắt buộc người dùng phải chọn/điền bàn và phải là số không âm
    const tableStr = tableInput ? tableInput.value.trim() : "";
    if (!tableStr) {
      window.BanhangUi.toast("Vui lòng nhập số bàn (bắt buộc).", "error");
      tableInput?.focus();
      return;
    }
    const tableNum = Number(tableStr);
    if (isNaN(tableNum) || tableNum < 0) {
      window.BanhangUi.toast("Số bàn phải là số không âm (từ 0 trở lên).", "error");
      tableInput?.focus();
      return;
    }

    // 3. Kiểm tra số bàn không được trùng với đơn đang phục vụ
    await loadActiveTables();
    const cleanTableNum = String(tableNum);
    if (activeTables.has(cleanTableNum)) {
      const code = activeTables.get(cleanTableNum);
      const msg = `Bàn số ${cleanTableNum} hiện đang có đơn hàng (#${code}) chưa hoàn tất! Vui lòng chọn số bàn khác.`;
      if (tableWarning) {
        tableWarning.textContent = `⚠️ ${msg}`;
        tableWarning.style.display = "block";
      }
      if (tableInput) tableInput.style.borderColor = "#d8262f";
      window.BanhangUi.toast(msg, "error", 5000);
      alert(msg);
      tableInput?.focus();
      return;
    }

    const customerName = document.querySelector("#customer-name")?.value.trim() || "";
    const paymentMethod = document.querySelector("#payment-method")?.value || "cash";
    const notes = document.querySelector("#order-notes")?.value.trim() || "";

    const itemsPayload = keys.map(key => ({
      productId: key,
      quantity: cart[key].quantity
    }));

    btnSubmitOrder.disabled = true;
    btnSubmitOrder.textContent = "Đang đặt món...";

    try {
      const result = await window.BanhangApi.request("/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName,
          notes,
          orderType: "dine_in",
          tableNumber: String(tableNum),
          deliveryAddress: `Bàn ${tableNum}`,
          paymentMethod,
          items: itemsPayload
        })
      });

      const createdOrder = result?.data?.order;
      const orderCode = createdOrder?.orderCode;

      window.BanhangUi.toast(
        orderCode
          ? `Đã tạo đơn #${orderCode} thành công! Đang chuyển sang màn hình chờ xác nhận...`
          : "Đặt món thành công! Đang chuyển sang màn hình chờ xác nhận...",
        "success",
        2500
      );

      // Chuyển đơn đó sang màn hình chờ xác nhận
      setTimeout(() => {
        window.location.href = "quan_ly_don_hang.html";
      }, 1200);

    } catch (err) {
      const msg = err.message || "Lỗi khi đặt món.";
      if (tableWarning && (msg.includes("Bàn số") || msg.includes("số bàn") || msg.includes("chưa hoàn tất"))) {
        tableWarning.textContent = `⚠️ ${msg}`;
        tableWarning.style.display = "block";
        if (tableInput) tableInput.style.borderColor = "#d8262f";
      }
      window.BanhangUi.toast(msg, "error", 5000);
      alert(msg);
      btnSubmitOrder.disabled = false;
      btnSubmitOrder.textContent = "ĐẶT MÓN";
    }
  });

  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price);
  }
});
