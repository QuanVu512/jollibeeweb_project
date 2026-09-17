document.addEventListener("DOMContentLoaded", () => {
  let checkRoleGuard = setInterval(() => {
    if (window.RoleGuard && window.RoleGuard.user) {
      clearInterval(checkRoleGuard);
      initPage();
    }
  }, 100);

  let currentUser = null;
  let availableProducts = [];
  let currentEditingOrder = null;
  let editingCart = [];
  let currentCancellingOrder = null;
  let currentConfirmingOrder = null;
  let verifiedAdminPassword = null;
  let pendingAdminAction = null;

  function initPage() {
    currentUser = window.RoleGuard.user;
    const staffNameEl = document.querySelector("#staff-name");
    if (staffNameEl) {
      staffNameEl.textContent = currentUser.displayName || currentUser.username;
    }

    const btnLogout = document.querySelector("#btn-logout");
    if (btnLogout) {
      btnLogout.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await fetch("/api/v1/auth/logout", { method: "POST" });
          location.replace("/admin/login.html");
        } catch (err) {
          alert("Đăng xuất thất bại!");
        }
      });
    }

    loadProducts();
    loadOrders();
    setupModals();

    // Tự động đồng bộ danh sách đơn mỗi 5 giây khi không mở modal
    setInterval(() => {
      const hasActiveModal = document.querySelector(".modal-overlay.active");
      if (!hasActiveModal) {
        loadOrders(true);
      }
    }, 5000);
  }

  function formatDateTime(val) {
    const d = val ? new Date(val) : new Date();
    if (isNaN(d.getTime())) {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    }
    const pad = (n) => String(n).padStart(2, "0");
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  }

  async function loadProducts() {
    try {
      const res = await window.BanhangApi.request("/products");
      availableProducts = res.data.items || [];
      populateAddProductSelect();
    } catch (err) {
      console.warn("Không thể tải danh sách món cho modal sửa:", err.message);
    }
  }

  function populateAddProductSelect() {
    const select = document.querySelector("#edit-add-product-select");
    if (!select) return;
    select.innerHTML = '<option value="">-- Chọn món để thêm --</option>' +
      availableProducts.map(p => `<option value="${p._id}">${p.name} - ${formatPrice(p.price)}đ</option>`).join("");
  }

  async function loadOrders(isBackground = false) {
    const unprintedList = document.querySelector("#unprinted-orders-list");
    const printedList = document.querySelector("#printed-orders-list");
    if (!isBackground) {
      if (unprintedList) unprintedList.innerHTML = '<p style="text-align: center; color: #888; padding: 25px 0;">Đang tải danh sách...</p>';
      if (printedList) printedList.innerHTML = '<p style="text-align: center; color: #888; padding: 25px 0;">Đang tải danh sách...</p>';
    }
    try {
      const res = await window.BanhangApi.request("/orders/pending");
      let items = res.data.items || [];
      // Bỏ các đơn pickup
      items = items.filter(o => o.orderType !== "pickup");
      renderOrders(items);
    } catch (err) {
      if (!isBackground) {
        if (unprintedList) unprintedList.innerHTML = `<p style="color: red; text-align: center; padding: 20px 0;">Lỗi khi tải đơn: ${err.message}</p>`;
        if (printedList) printedList.innerHTML = `<p style="color: red; text-align: center; padding: 20px 0;">Lỗi khi tải đơn: ${err.message}</p>`;
      }
    }
  }

  function renderOrders(orders) {
    const unprintedList = document.querySelector("#unprinted-orders-list");
    const printedList = document.querySelector("#printed-orders-list");
    const unprintedCountEl = document.querySelector("#unprinted-count");
    const printedCountEl = document.querySelector("#printed-count");

    const orderList = Array.isArray(orders) ? orders : [];

    // Sắp xếp thứ tự cũ đến mới (đơn mới sẽ ở cuối)
    const sortedOrders = [...orderList].sort((a, b) => {
      const timeA = new Date(a.orderedAt || a.createdAt).getTime() || 0;
      const timeB = new Date(b.orderedAt || b.createdAt).getTime() || 0;
      return timeA - timeB;
    });

    const unprintedOrders = sortedOrders.filter(o => !Boolean(o.isInvoicePrinted || o.status === "preparing"));
    const printedOrders = sortedOrders.filter(o => Boolean(o.isInvoicePrinted || o.status === "preparing"));

    if (unprintedCountEl) unprintedCountEl.textContent = `${unprintedOrders.length} đơn`;
    if (printedCountEl) printedCountEl.textContent = `${printedOrders.length} đơn`;

    function renderCard(order, isPrinted) {
      const formattedDate = formatDateTime(order.orderedAt || order.createdAt);
      const isDelivery = order.orderType === "delivery";
      const orderTypeLabel = isDelivery
        ? "🛵 Giao hàng / Ship"
        : "🍽️ Đặt tại bàn";

      const invoiceBadge = isPrinted
        ? `<span class="badge-tag badge-printed">📄 Đã in hóa đơn</span>`
        : `<span class="badge-tag badge-unprinted">⏳ Chưa in hóa đơn</span>`;

      const paymentLabel = order.payment?.method === "card"
        ? "Thẻ POS"
        : (order.payment?.method === "e_wallet" || order.payment?.method === "qr" ? "Quét mã QR / Ví" : (order.payment?.method === "cod" ? "COD" : "Tiền mặt"));

      const canEditOrCancel = order.status !== "completed" && order.status !== "cancelled";

      return `
        <div class="order-card" id="order-${order._id}" style="border-left: 6px solid ${isPrinted ? '#28a745' : '#d8262f'}; ${order.status === 'cancelled' ? 'opacity: 0.7; border-left-color: #888;' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 900; font-size: 16px; color: ${isPrinted ? '#28a745' : '#d8262f'};">Đơn #${order.orderCode}</span>
            <div>
              ${invoiceBadge}
              <span class="badge-tag badge-table">${isDelivery ? '🛵 Giao đi' : '🍽️ ' + (order.tableNumber ? `Bàn ${order.tableNumber}` : 'Tại quầy')}</span>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 6px;">
            <span>Khách: <b>${order.customerName || "Khách lẻ"}</b> ${order.customerPhone ? `(${order.customerPhone})` : ""}</span>
            <span>🕒 ${formattedDate}</span>
          </div>
          <p style="margin: 4px 0; font-size: 13px;">Hình thức: <span style="color: #f3a22f; font-weight: bold;">${orderTypeLabel}</span></p>
          <p style="margin: 4px 0; font-size: 13px;">${isDelivery ? 'Địa chỉ' : 'Số bàn'}: <b style="color: #d8262f;">${isDelivery ? (order.deliveryAddress || "Không có") : (order.tableNumber ? `Bàn ${order.tableNumber}` : "Tại quầy")}</b></p>
          ${order.notes ? `<p style="margin: 4px 0; font-size: 13px; color: #777;">Ghi chú: <i>${order.notes}</i></p>` : ""}
          ${order.cancellationReason ? `<p style="margin: 4px 0; font-size: 13px; color: #d8262f;">Lý do hủy: <b>${order.cancellationReason}</b></p>` : ""}
          <p style="margin: 4px 0; font-size: 13px;">Thanh toán: <b>${paymentLabel}</b></p>
          <p style="margin: 8px 0 0 0; font-size: 13px;">Tổng tiền: <span style="color:#d8262f; font-weight:900; font-size: 20px;">${formatPrice(order.total)}đ</span></p>

          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #eee; display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; align-items: center;">
            ${!isPrinted ? `
              <button class="btn btn-red btn-confirm-order" data-id="${order._id}">Xác nhận</button>
              <button class="btn btn-blue btn-edit-order" data-id="${order._id}">✏️ Sửa đơn</button>
              <button class="btn btn-gray btn-cancel-order" data-id="${order._id}">❌ Hủy đơn</button>
            ` : `
              <button class="btn btn-outline btn-view-invoice" data-id="${order._id}">Chi tiết <span class="emoji">🍝</span></button>
              ${canEditOrCancel ? `
                <button class="btn btn-blue btn-edit-order" data-id="${order._id}">✏️ Sửa đơn</button>
                <button class="btn btn-gray btn-cancel-order" data-id="${order._id}">❌ Hủy đơn</button>
              ` : ''}
            `}
          </div>
        </div>
      `;
    }

    if (unprintedList) {
      if (unprintedOrders.length === 0) {
        unprintedList.innerHTML = `
          <div class="empty-col-message">
            <span class="emoji" style="font-size: 28px;">🎉</span>
            <p style="margin: 8px 0 0 0;">Không có đơn hàng nào chưa in hóa đơn.</p>
          </div>
        `;
      } else {
        unprintedList.innerHTML = unprintedOrders.map(o => renderCard(o, false)).join("");
      }
    }

    if (printedList) {
      if (printedOrders.length === 0) {
        printedList.innerHTML = `
          <div class="empty-col-message">
            <span class="emoji" style="font-size: 28px;">📄</span>
            <p style="margin: 8px 0 0 0;">Không có đơn hàng nào đã in hóa đơn.</p>
          </div>
        `;
      } else {
        printedList.innerHTML = printedOrders.map(o => renderCard(o, true)).join("");
      }
    }

    attachOrderEventListeners(sortedOrders);
  }

  function attachOrderEventListeners(orders) {
    // Nút "Xác nhận" -> Mở modal chi tiết đơn và in hóa đơn
    document.querySelectorAll(".btn-confirm-order").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        const order = orders.find((o) => o._id === id);
        if (!order) return;
        handleOpenConfirmOrderModal(order);
      });
    });

    // Chi tiết xem hóa đơn đã in
    document.querySelectorAll(".btn-view-invoice").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        const order = orders.find((o) => o._id === id);
        if (!order) return;
        currentConfirmingOrder = null;
        showReceiptModal(order, false);
      });
    });

    // Sửa đơn
    document.querySelectorAll(".btn-edit-order").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        const order = orders.find((o) => o._id === id);
        if (!order) return;
        handleStartEditOrder(order);
      });
    });

    // Hủy đơn
    document.querySelectorAll(".btn-cancel-order").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        const order = orders.find((o) => o._id === id);
        if (!order) return;
        handleStartCancelOrder(order);
      });
    });
  }

  // ==================== XÁC NHẬN & IN HÓA ĐƠN ====================
  function handleOpenConfirmOrderModal(order) {
    currentConfirmingOrder = order;
    showReceiptModal(order, true);
  }

  async function handlePrintInvoice(order) {
    try {
      // Đánh dấu đã in trên server
      await window.BanhangApi.request(`/orders/${order._id}/invoice`, { method: "POST" });
      order.isInvoicePrinted = true;
      order.invoicePrintedAt = new Date();
    } catch (err) {
      console.warn("Lỗi cập nhật trạng thái in:", err.message);
    }

    showReceiptModal(order, false);
  }

  function showReceiptModal(order, isConfirming = false) {
    const modal = document.querySelector("#invoice-modal");
    if (!modal) return;

    const formattedDate = formatDateTime(order.orderedAt || order.createdAt);
    const isDelivery = order.orderType === "delivery";
    const orderTypeLabel = isDelivery ? "Giao hàng / Ship" : "Đặt tại bàn";
    const paymentLabel = order.payment?.method === "card"
      ? "Thẻ POS"
      : (order.payment?.method === "e_wallet" || order.payment?.method === "qr" ? "Quét mã QR / Ví" : (order.payment?.method === "cod" ? "COD" : "Tiền mặt"));

    const infoEl = document.querySelector("#receipt-info");
    if (infoEl) {
      infoEl.innerHTML = `
        <div style="display: flex; justify-content: space-between;"><b>Hóa đơn:</b> #${order.orderCode}</div>
        <div style="display: flex; justify-content: space-between;"><b>Thời gian:</b> ${formattedDate}</div>
        <div style="display: flex; justify-content: space-between;"><b>Thu ngân:</b> ${currentUser?.displayName || currentUser?.username || "Thu ngân"}</div>
        <div style="display: flex; justify-content: space-between;"><b>Hình thức:</b> <span style="color: #d8262f; font-weight: bold;">${orderTypeLabel}</span></div>
        <div style="display: flex; justify-content: space-between;"><b>Số bàn:</b> <b>${order.tableNumber ? `Bàn ${order.tableNumber}` : "Quầy"}</b></div>
        <div style="display: flex; justify-content: space-between;"><b>Khách hàng:</b> ${order.customerName || "Khách lẻ"} ${order.customerPhone ? `(${order.customerPhone})` : ""}</div>
        ${order.notes ? `<div style="display: flex; justify-content: space-between; color: #777;"><b>Ghi chú:</b> <i>${order.notes}</i></div>` : ""}
      `;
    }

    const itemsEl = document.querySelector("#receipt-items-body");
    if (itemsEl) {
      itemsEl.innerHTML = (order.items || []).map(item => `
        <tr>
          <td>${item.name}</td>
          <td align="center">${item.quantity}</td>
          <td align="right">${formatPrice(item.unitPrice)}</td>
          <td align="right"><b>${formatPrice(item.lineTotal)}</b></td>
        </tr>
      `).join("");
    }

    const totalEl = document.querySelector("#receipt-total-section");
    if (totalEl) {
      totalEl.innerHTML = `
        <div class="row"><span>Tạm tính:</span> <span>${formatPrice(order.subtotal || order.total)}đ</span></div>
        ${order.discount ? `<div class="row"><span>Giảm giá:</span> <span>-${formatPrice(order.discount)}đ</span></div>` : ""}
        <div class="row grand-total"><span>TỔNG CỘNG:</span> <span>${formatPrice(order.total)}đ</span></div>
        <div class="row" style="margin-top: 6px; font-weight: bold;">
          <span>Phương thức TT:</span> <span>${paymentLabel}</span>
        </div>
      `;
    }

    const titleEl = document.querySelector("#receipt-modal-title");
    if (titleEl) {
      titleEl.textContent = isConfirming ? "CHI TIẾT ĐƠN & HÓA ĐƠN" : "CHI TIẾT HÓA ĐƠN ĐÃ IN";
    }

    const btnPrint = document.querySelector("#btn-print-receipt");
    if (btnPrint) {
      if (isConfirming) {
        btnPrint.style.display = "block";
        btnPrint.textContent = "🖨️ In hóa đơn & Chuyển bếp";
        btnPrint.disabled = false;
      } else {
        // Chi tiết đã in bill -> Bỏ nút in lại, chỉ hiển thị nút Đóng
        btnPrint.style.display = "none";
      }
    }

    modal.classList.add("active");
  }

  // ==================== SỬA ĐƠN HÀNG ====================
  function handleStartEditOrder(order) {
    currentEditingOrder = order;
    verifiedAdminPassword = null;

    // Đơn đã in bill (hóa đơn tài chính) -> Luôn yêu cầu nhập mật khẩu Quản trị viên
    const isPrinted = Boolean(order.isInvoicePrinted || order.status === "preparing");
    if (isPrinted) {
      showAdminAuthModal(order, "edit");
      return;
    }

    openEditOrderModal(order);
  }

  function openEditOrderModal(order) {
    const modal = document.querySelector("#edit-order-modal");
    if (!modal) return;

    document.querySelector("#edit-order-code").textContent = `#${order.orderCode}`;
    document.querySelector("#edit-table-number").value = order.tableNumber || order.deliveryAddress || "";
    document.querySelector("#edit-customer-name").value = order.customerName || "";
    document.querySelector("#edit-notes").value = order.notes || "";

    const isPrinted = Boolean(order.isInvoicePrinted || order.status === "preparing");
    const warnEl = document.querySelector("#edit-order-status-warn");
    if (isPrinted) {
      warnEl.style.display = "block";
      warnEl.innerHTML = "⚠️ <b>Lưu ý:</b> Đơn hàng này đã in hóa đơn trước đó. Bạn đang chỉnh sửa với quyền Quản trị viên đã xác thực.";
    } else {
      warnEl.style.display = "none";
    }

    // Clone items
    editingCart = (order.items || []).map(item => ({
      productId: item.product?._id || item.product || item._id,
      productCode: item.productCode || "",
      name: item.name,
      price: item.unitPrice,
      quantity: item.quantity
    }));

    renderEditCartItems();
    modal.classList.add("active");
  }

  function renderEditCartItems() {
    const tbody = document.querySelector("#edit-items-body");
    const totalEl = document.querySelector("#edit-calculated-total");
    if (!tbody) return;

    if (editingCart.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" align="center" style="padding: 15px; color: #888;">Chưa có món nào trong đơn. Vui lòng thêm món bên dưới.</td></tr>`;
      totalEl.textContent = "0đ";
      return;
    }

    let calculatedTotal = 0;
    tbody.innerHTML = editingCart.map((item, index) => {
      const lineTotal = item.quantity * item.price;
      calculatedTotal += lineTotal;
      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px;"><b>${item.name}</b></td>
          <td align="center" style="padding: 8px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              <button type="button" class="btn-qty-minus" data-index="${index}" style="width: 24px; height: 24px; border: 1px solid #ddd; background: #f8f8f8; cursor: pointer; border-radius: 4px; font-weight: bold;">-</button>
              <input type="number" class="edit-qty-input" data-index="${index}" value="${item.quantity}" min="1" style="width: 45px; text-align: center; border: 1px solid #ddd; border-radius: 4px; padding: 2px;">
              <button type="button" class="btn-qty-plus" data-index="${index}" style="width: 24px; height: 24px; border: 1px solid #ddd; background: #f8f8f8; cursor: pointer; border-radius: 4px; font-weight: bold;">+</button>
            </div>
          </td>
          <td align="right" style="padding: 8px;">${formatPrice(item.price)}đ</td>
          <td align="right" style="padding: 8px; font-weight: bold; color: #d8262f;">${formatPrice(lineTotal)}đ</td>
          <td align="center" style="padding: 8px;">
            <button type="button" class="btn-delete-item" data-index="${index}" style="background: none; border: none; color: #d8262f; cursor: pointer; font-size: 16px; font-weight: bold;">✕</button>
          </td>
        </tr>
      `;
    }).join("");

    totalEl.textContent = formatPrice(calculatedTotal) + "đ";

    // Attach qty handlers
    tbody.querySelectorAll(".btn-qty-minus").forEach((b) => {
      b.addEventListener("click", () => {
        const idx = Number(b.dataset.index);
        if (editingCart[idx].quantity > 1) {
          editingCart[idx].quantity--;
          renderEditCartItems();
        } else {
          editingCart.splice(idx, 1);
          renderEditCartItems();
        }
      });
    });

    tbody.querySelectorAll(".btn-qty-plus").forEach((b) => {
      b.addEventListener("click", () => {
        const idx = Number(b.dataset.index);
        editingCart[idx].quantity++;
        renderEditCartItems();
      });
    });

    tbody.querySelectorAll(".edit-qty-input").forEach((inp) => {
      inp.addEventListener("change", (e) => {
        const idx = Number(inp.dataset.index);
        const val = parseInt(e.target.value);
        if (val > 0) {
          editingCart[idx].quantity = val;
        } else {
          editingCart.splice(idx, 1);
        }
        renderEditCartItems();
      });
    });

    tbody.querySelectorAll(".btn-delete-item").forEach((b) => {
      b.addEventListener("click", () => {
        const idx = Number(b.dataset.index);
        editingCart.splice(idx, 1);
        renderEditCartItems();
      });
    });
  }

  // ==================== HỦY ĐƠN HÀNG ====================
  function handleStartCancelOrder(order) {
    currentCancellingOrder = order;
    verifiedAdminPassword = null;

    // Đơn đã in bill (hóa đơn tài chính) -> Luôn yêu cầu xác thực Quản trị viên
    const isPrinted = Boolean(order.isInvoicePrinted || order.status === "preparing");
    if (isPrinted) {
      showAdminAuthModal(order, "cancel");
      return;
    }

    openCancelOrderModal(order);
  }

  function openCancelOrderModal(order) {
    const modal = document.querySelector("#cancel-order-modal");
    if (!modal) return;
    document.querySelector("#cancel-order-code").textContent = `#${order.orderCode}`;
    document.querySelector("#cancel-reason-select").value = "Khách đổi ý hủy món";
    document.querySelector("#cancel-reason-custom").value = "";
    document.querySelector("#cancel-reason-custom").style.display = "none";
    modal.classList.add("active");
  }

  // ==================== XÁC THỰC ADMIN ====================
  function showAdminAuthModal(order, action) {
    pendingAdminAction = action;
    const modal = document.querySelector("#admin-auth-modal");
    if (!modal) return;
    const pwdInput = document.querySelector("#admin-auth-password");
    if (pwdInput) pwdInput.value = "";
    const errBox = document.querySelector("#admin-auth-error");
    if (errBox) {
      errBox.style.display = "none";
      errBox.textContent = "";
    }
    modal.classList.add("active");
    setTimeout(() => pwdInput?.focus(), 150);
  }

  // ==================== SETUP MODAL EVENTS ====================
  function setupModals() {
    // 1. Receipt Modal close & print
    const invoiceModal = document.querySelector("#invoice-modal");
    document.querySelector("#btn-close-receipt")?.addEventListener("click", (e) => {
      e.preventDefault();
      invoiceModal.classList.remove("active");
      currentConfirmingOrder = null;
    });

    const btnPrintReceipt = document.querySelector("#btn-print-receipt");
    btnPrintReceipt?.addEventListener("click", async (e) => {
      e.preventDefault();
      window.print();

      // Khi bấm in hóa đơn xong thì đơn mới thành preparing
      if (currentConfirmingOrder && currentConfirmingOrder.status === "pending") {
        btnPrintReceipt.disabled = true;
        btnPrintReceipt.textContent = "Đang chuyển bếp...";

        try {
          await window.BanhangApi.request(`/orders/${currentConfirmingOrder._id}/accept`, {
            method: "PATCH"
          });

          window.BanhangUi.toast("Đã in hóa đơn và chuyển đơn hàng sang trạng thái bếp chế biến (Preparing)!", "success", 4000);
          invoiceModal.classList.remove("active");
          currentConfirmingOrder = null;
          loadOrders();
        } catch (err) {
          window.BanhangUi.toast("Lỗi xác nhận đơn: " + err.message, "error", 5000);
          btnPrintReceipt.disabled = false;
          btnPrintReceipt.textContent = "🖨️ In hóa đơn";
        }
      }
    });

    // 2. Edit Order Modal
    const editModal = document.querySelector("#edit-order-modal");
    document.querySelector("#btn-cancel-edit-order")?.addEventListener("click", (e) => {
      e.preventDefault();
      editModal.classList.remove("active");
      currentEditingOrder = null;
    });

    document.querySelector("#btn-add-item-to-edit")?.addEventListener("click", (e) => {
      e.preventDefault();
      const select = document.querySelector("#edit-add-product-select");
      const qtyInput = document.querySelector("#edit-add-product-qty");
      const prodId = select.value;
      const qty = parseInt(qtyInput.value) || 1;

      if (!prodId) {
        alert("Vui lòng chọn món ăn cần thêm!");
        return;
      }

      const prod = availableProducts.find(p => p._id === prodId);
      if (!prod) return;

      const existing = editingCart.find(item => item.productId === prodId);
      if (existing) {
        existing.quantity += qty;
      } else {
        editingCart.push({
          productId: prod._id,
          productCode: prod.productCode || "",
          name: prod.name,
          price: prod.price,
          quantity: qty
        });
      }

      select.value = "";
      qtyInput.value = 1;
      renderEditCartItems();
    });

    document.querySelector("#btn-save-edit-order")?.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!currentEditingOrder) return;
      if (editingCart.length === 0) {
        alert("Đơn hàng phải có ít nhất 1 món ăn!");
        return;
      }

      const tableNumber = document.querySelector("#edit-table-number").value.trim();
      const customerName = document.querySelector("#edit-customer-name").value.trim();
      const notes = document.querySelector("#edit-notes").value.trim();

      const payload = {
        tableNumber,
        deliveryAddress: tableNumber,
        customerName,
        notes,
        items: editingCart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      if (verifiedAdminPassword) {
        payload.adminPassword = verifiedAdminPassword;
      }

      const btnSave = document.querySelector("#btn-save-edit-order");
      btnSave.disabled = true;
      btnSave.textContent = "Đang lưu...";

      try {
        const wasPrinted = Boolean(currentEditingOrder.isInvoicePrinted || currentEditingOrder.status === "preparing");

        const result = await window.BanhangApi.request(`/orders/${currentEditingOrder._id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });

        editModal.classList.remove("active");
        const updatedOrder = result?.data?.order;
        currentEditingOrder = null;
        verifiedAdminPassword = null;

        window.BanhangUi.toast("Đã cập nhật đơn hàng thành công!", "success");

        // Đơn đã in bill mới hỏi in lại, còn đơn chưa in bill chỉ cập nhật và tải lại danh sách
        if (wasPrinted) {
          if (confirm("Đơn hàng đã được cập nhật. Bạn có muốn in lại hóa đơn mới không?")) {
            await handlePrintInvoice(updatedOrder);
          } else {
            loadOrders();
          }
        } else {
          loadOrders();
        }
      } catch (err) {
        window.BanhangUi.toast("Lỗi cập nhật đơn: " + err.message, "error", 5000);
        alert("Lỗi cập nhật đơn: " + err.message);
      } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Lưu thay đổi & Cập nhật";
      }
    });

    // 3. Cancel Order Modal
    const cancelModal = document.querySelector("#cancel-order-modal");
    const reasonSelect = document.querySelector("#cancel-reason-select");
    const reasonCustom = document.querySelector("#cancel-reason-custom");

    reasonSelect?.addEventListener("change", (e) => {
      if (e.target.value === "other") {
        reasonCustom.style.display = "block";
        reasonCustom.focus();
      } else {
        reasonCustom.style.display = "none";
      }
    });

    document.querySelector("#btn-close-cancel-modal")?.addEventListener("click", (e) => {
      e.preventDefault();
      cancelModal.classList.remove("active");
      currentCancellingOrder = null;
    });

    document.querySelector("#btn-confirm-cancel-order")?.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!currentCancellingOrder) return;
      let finalReason = reasonSelect.value;
      if (finalReason === "other") {
        finalReason = reasonCustom.value.trim() || "Thu ngân hủy đơn hàng";
      }

      const payload = { reason: finalReason };
      if (verifiedAdminPassword) {
        payload.adminPassword = verifiedAdminPassword;
      }

      const btnConfirm = document.querySelector("#btn-confirm-cancel-order");
      btnConfirm.disabled = true;
      btnConfirm.textContent = "Đang hủy...";

      try {
        await window.BanhangApi.request(`/orders/${currentCancellingOrder._id}/cancel`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });

        window.BanhangUi.toast("Đã hủy đơn hàng thành công và hoàn trả kho nguyên liệu!", "success", 4500);
        cancelModal.classList.remove("active");
        currentCancellingOrder = null;
        loadOrders();
      } catch (err) {
        window.BanhangUi.toast("Lỗi hủy đơn: " + err.message, "error", 5000);
        alert("Lỗi hủy đơn: " + err.message);
      } finally {
        btnConfirm.disabled = false;
        btnConfirm.textContent = "Xác nhận hủy đơn";
      }
    });

    // 4. Admin Auth Modal
    const adminModal = document.querySelector("#admin-auth-modal");
    const pwdInput = document.querySelector("#admin-auth-password");
    const errBox = document.querySelector("#admin-auth-error");

    pwdInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        document.querySelector("#btn-confirm-admin-auth")?.click();
      }
    });

    pwdInput?.addEventListener("input", () => {
      if (errBox) errBox.style.display = "none";
    });

    document.querySelector("#btn-close-admin-auth")?.addEventListener("click", (e) => {
      e.preventDefault();
      adminModal.classList.remove("active");
      pendingAdminAction = null;
    });

    document.querySelector("#btn-confirm-admin-auth")?.addEventListener("click", async (e) => {
      if (e) e.preventDefault();
      const pwd = pwdInput ? pwdInput.value.trim() : "";
      if (!pwd) {
        if (errBox) {
          errBox.textContent = "⚠️ Vui lòng nhập mật khẩu Quản trị viên!";
          errBox.style.display = "block";
        }
        alert("Vui lòng nhập mật khẩu Quản trị viên!");
        pwdInput?.focus();
        return;
      }

      const btnAuth = document.querySelector("#btn-confirm-admin-auth");
      btnAuth.disabled = true;
      btnAuth.textContent = "Đang kiểm tra...";

      try {
        await window.BanhangApi.request("/verify-admin", {
          method: "POST",
          body: JSON.stringify({ adminPassword: pwd })
        });

        verifiedAdminPassword = pwd;
        if (errBox) errBox.style.display = "none";
        adminModal.classList.remove("active");
        window.BanhangUi.toast("Xác thực Quản trị viên thành công!", "success");

        if (pendingAdminAction === "edit" && currentEditingOrder) {
          openEditOrderModal(currentEditingOrder);
        } else if (pendingAdminAction === "cancel" && currentCancellingOrder) {
          openCancelOrderModal(currentCancellingOrder);
        }
      } catch (err) {
        const msg = err.message || "Mật khẩu Quản trị viên không chính xác!";
        if (errBox) {
          errBox.textContent = `❌ ${msg}`;
          errBox.style.display = "block";
        }
        window.BanhangUi.toast(msg, "error", 4000);
        alert(`❌ Xác thực Quản trị viên thất bại: ${msg}`);
        pwdInput?.select();
      } finally {
        btnAuth.disabled = false;
        btnAuth.textContent = "Xác nhận quyền";
      }
    });
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price || 0);
  }
});

