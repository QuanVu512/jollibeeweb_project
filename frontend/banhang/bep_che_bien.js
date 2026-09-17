(function () {
  function formatDateTime(val) {
    const d = val ? new Date(val) : new Date();
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price || 0);
  }

  function canCompleteKitchenOrders() {
    const role = window.RoleGuard?.user?.role;
    if (!role) return true; // Default allowed since role-guard already checked allowed roles
    return role === "kitchen" || role === "cashier" || role === "admin";
  }

  function disabledKitchenButton() {
    return `
      <button type="button" class="btn-ticket" disabled title="Cần đăng nhập tài khoản có quyền" style="background:#8d8d8d; color:#fff; box-shadow:none; cursor:not-allowed;">
        CHƯA CÓ QUYỀN
      </button>
    `;
  }

  function showKitchenResult(result, fallbackMessage) {
    const inventory = result?.data?.inventory;
    const type = inventory?.missingRecipes?.length ? "warning" : "success";
    if (window.BanhangUi?.toast) {
      window.BanhangUi.toast(result?.message || fallbackMessage, type, type === "warning" ? 6500 : 3800);
    } else {
      alert(result?.message || fallbackMessage);
    }
  }

  function showReceiptModal(order) {
    const modal = document.querySelector("#invoice-modal");
    if (!modal) return;

    const formattedDate = formatDateTime(order.orderedAt || order.createdAt);
    const isDelivery = order.orderType === "delivery";
    const orderTypeLabel = isDelivery ? "Giao hàng / Ship" : "Ăn tại chỗ";
    const paymentLabel = order.payment?.method === "card"
      ? "Thẻ POS"
      : (order.payment?.method === "e_wallet" || order.payment?.method === "qr" ? "Quét mã QR / Ví" : (order.payment?.method === "cod" ? "COD" : "Tiền mặt"));

    const infoEl = document.querySelector("#receipt-info");
    if (infoEl) {
      infoEl.innerHTML = `
        <div style="display: flex; justify-content: space-between;"><b>Hóa đơn:</b> #${order.orderCode}</div>
        <div style="display: flex; justify-content: space-between;"><b>Thời gian:</b> ${formattedDate}</div>
        <div style="display: flex; justify-content: space-between;"><b>Hình thức:</b> <span style="color: #d8262f; font-weight: bold;">${orderTypeLabel}</span></div>
        <div style="display: flex; justify-content: space-between;"><b>${isDelivery ? 'Địa chỉ' : 'Số bàn'}:</b> <b>${isDelivery ? (order.deliveryAddress || "Không có") : (order.tableNumber ? `Bàn ${order.tableNumber}` : "Tại quầy")}</b></div>
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
          <td align="right">${formatPrice(item.unitPrice || item.price)}đ</td>
          <td align="right"><b>${formatPrice(item.lineTotal || (item.unitPrice || item.price || 0) * item.quantity)}đ</b></td>
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

    modal.classList.add("active");
  }

  async function loadPreparingOrders() {
    const dineInTickets = document.querySelector("#dine-in-tickets");
    const deliveryTickets = document.querySelector("#delivery-tickets");

    try {
      if (!window.BanhangApi) {
        console.warn("BanhangApi chưa sẵn sàng.");
        return;
      }
      const res = await window.BanhangApi.request("/orders/preparing");
      const items = res?.data?.items || [];
      renderTickets(items);
    } catch (err) {
      console.error("Lỗi khi tải đơn bếp:", err);
      if (dineInTickets) {
        dineInTickets.innerHTML = `<p style="color: red; text-align: center; padding: 15px 0;">Lỗi khi tải đơn: ${err.message}</p>`;
      }
      if (deliveryTickets) {
        deliveryTickets.innerHTML = `<p style="color: red; text-align: center; padding: 15px 0;">Lỗi khi tải đơn: ${err.message}</p>`;
      }
    }
  }

  function renderTickets(orders) {
    const dineInTickets = document.querySelector("#dine-in-tickets");
    const deliveryTickets = document.querySelector("#delivery-tickets");
    if (!dineInTickets || !deliveryTickets) return;

    const orderList = (Array.isArray(orders) ? [...orders] : []).sort((a, b) => {
      const timeA = new Date(a.orderedAt || a.createdAt).getTime() || 0;
      const timeB = new Date(b.orderedAt || b.createdAt).getTime() || 0;
      return timeA - timeB;
    });
    // Mọi đơn không phải delivery thì chuyển sang cột Ăn tại chỗ (bao gồm dine_in, mang đi...)
    const dineInOrders = orderList.filter((o) => o.orderType !== "delivery");
    const deliveryOrders = orderList.filter((o) => o.orderType === "delivery");
    const canComplete = canCompleteKitchenOrders();

    // 1. Cột ăn tại chỗ: Có nút Chi tiết và nút Phục vụ khách
    if (dineInOrders.length === 0) {
      dineInTickets.innerHTML = `<p style="text-align: center; color: #888; padding: 20px 0;">Không có đơn ăn tại chỗ</p>`;
    } else {
      dineInTickets.innerHTML = dineInOrders.map((order) => {
        const tableStr = order.tableNumber ? `Bàn ${order.tableNumber}` : (order.deliveryAddress || "Tại quầy");
        const formattedDate = formatDateTime(order.orderedAt || order.createdAt);
        return `
          <div class="ticket" id="ticket-${order._id}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 900; font-size: 16px; color: #d8262f;">Đơn #${order.orderCode}</span>
              <span style="font-size: 13px; color: #d8262f; font-weight: bold; background: #ffebee; padding: 3px 8px; border-radius: 4px;">🍽️ ${tableStr}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 6px;">
              <span>Khách: <b>${order.customerName || "Khách lẻ"}</b></span>
              <span>🕒 ${formattedDate}</span>
            </div>
            ${order.notes ? `<p style="margin: 6px 0; font-size: 13px; color: #d8262f; background: #fff5f5; padding: 6px 10px; border-radius: 6px; border-left: 3px solid #d8262f;">📝 <b>Ghi chú:</b> <i>${order.notes}</i></p>` : ""}
            <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${(order.items || []).map((item) => `
                <li style="padding: 8px 0; border-bottom: 1px solid #eee; display: flex; align-items: center;">
                  <span class="qty">${item.quantity}</span>
                  <b>${item.name}</b>
                </li>
              `).join("")}
            </ul>
            <div class="ticket-actions">
              <button type="button" class="btn-ticket btn-details" data-id="${order._id}">Chi tiết</button>
              ${canComplete
                ? `<button type="button" class="btn-ticket btn-serve" data-id="${order._id}"><span class="emoji">🍽️</span> Phục vụ khách</button>`
                : disabledKitchenButton()}
            </div>
          </div>
        `;
      }).join("");

      dineInTickets.querySelectorAll(".btn-details").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const order = orderList.find(o => o._id === btn.dataset.id);
          if (order) showReceiptModal(order);
        });
      });

      if (canComplete) {
        dineInTickets.querySelectorAll(".btn-serve").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            handleServe(btn.dataset.id, btn);
          });
        });
      }
    }

    // 2. Cột giao hàng / ship: Có nút Chi tiết và nút Sẵn sàng ship
    if (deliveryOrders.length === 0) {
      deliveryTickets.innerHTML = `<p style="text-align: center; color: #888; padding: 20px 0;">Không có đơn ship / giao hàng</p>`;
    } else {
      deliveryTickets.innerHTML = deliveryOrders.map((order) => {
        const formattedDate = formatDateTime(order.orderedAt || order.createdAt);
        return `
          <div class="ticket" id="ticket-${order._id}" style="border-top-color: #28a745;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 900; font-size: 16px; color: #28a745;">Đơn #${order.orderCode}</span>
              <span style="font-size: 13px; color: #28a745; font-weight: bold; background: #eaf8f0; padding: 3px 8px; border-radius: 4px;">🛵 GIAO HÀNG</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 4px;">
              <span>Khách: <b>${order.customerName || "Khách lẻ"}</b> ${order.customerPhone ? `(${order.customerPhone})` : ""}</span>
              <span>🕒 ${formattedDate}</span>
            </div>
            <p style="margin: 4px 0; font-size: 13px; color: #555;">Đ/C: <b>${order.deliveryAddress || "Không có"}</b></p>
            ${order.notes ? `<p style="margin: 6px 0; font-size: 13px; color: #d8262f; background: #fff5f5; padding: 6px 10px; border-radius: 6px; border-left: 3px solid #d8262f;">📝 <b>Ghi chú:</b> <i>${order.notes}</i></p>` : ""}
            <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${(order.items || []).map((item) => `
                <li style="padding: 8px 0; border-bottom: 1px solid #eee; display: flex; align-items: center;">
                  <span class="qty" style="background-color: #28a745;">${item.quantity}</span>
                  <b>${item.name}</b>
                </li>
              `).join("")}
            </ul>
            <div class="ticket-actions">
              <button type="button" class="btn-ticket btn-details" data-id="${order._id}">Chi tiết</button>
              ${canComplete
                ? `<button type="button" class="btn-ticket btn-ready" data-id="${order._id}"><span class="emoji">🛵</span> Sẵn sàng ship</button>`
                : disabledKitchenButton()}
            </div>
          </div>
        `;
      }).join("");

      deliveryTickets.querySelectorAll(".btn-details").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const order = orderList.find(o => o._id === btn.dataset.id);
          if (order) showReceiptModal(order);
        });
      });

      if (canComplete) {
        deliveryTickets.querySelectorAll(".btn-ready").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            handleReady(btn.dataset.id, btn);
          });
        });
      }
    }
  }

  async function handleServe(id, btn) {
    const confirmed = window.BanhangUi?.confirm
      ? await window.BanhangUi.confirm("Xác nhận phục vụ xong đơn này cho khách?", { confirmText: "Phục vụ khách" })
      : confirm("Xác nhận phục vụ xong đơn này cho khách?");
    if (!confirmed) return;

    try {
      btn.disabled = true;
      btn.textContent = "Đang xử lý...";
      const result = await window.BanhangApi.request(`/orders/${id}/serve`, { method: "PATCH" });
      showKitchenResult(result, "Đơn hàng đã được phục vụ.");
      loadPreparingOrders();
    } catch (err) {
      if (window.BanhangUi?.toast) {
        window.BanhangUi.toast("Lỗi: " + err.message, "error", 5600);
      }
      alert("Lỗi phục vụ đơn: " + err.message);
      btn.disabled = false;
      btn.innerHTML = '<span class="emoji">🍽️</span> Phục vụ khách';
    }
  }

  async function handleReady(id, btn) {
    const confirmed = window.BanhangUi?.confirm
      ? await window.BanhangUi.confirm("Xác nhận đơn hàng đã chế biến xong, sẵn sàng ship?", { confirmText: "Sẵn sàng ship" })
      : confirm("Xác nhận đơn hàng đã chế biến xong, sẵn sàng ship?");
    if (!confirmed) return;

    try {
      btn.disabled = true;
      btn.textContent = "Đang xử lý...";
      const result = await window.BanhangApi.request(`/orders/${id}/ready`, { method: "PATCH" });
      showKitchenResult(result, "Đơn hàng đã sẵn sàng giao.");
      loadPreparingOrders();
    } catch (err) {
      if (window.BanhangUi?.toast) {
        window.BanhangUi.toast("Lỗi: " + err.message, "error", 5600);
      }
      alert("Lỗi cập nhật đơn: " + err.message);
      btn.disabled = false;
      btn.innerHTML = '<span class="emoji">🛵</span> Sẵn sàng ship';
    }
  }

  function initPage() {
    // 1. Tải đơn ngay lập tức không cần đợi
    loadPreparingOrders();
    setInterval(loadPreparingOrders, 4000);

    // 2. Setup modal sự kiện
    document.querySelector("#btn-close-receipt")?.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector("#invoice-modal")?.classList.remove("active");
    });

    // 3. Cập nhật tên nhân viên và thanh điều hướng
    function syncUser() {
      const user = window.RoleGuard?.user;
      if (!user) return;
      const staffNameEl = document.querySelector("#staff-name");
      if (staffNameEl) {
        staffNameEl.textContent = user.displayName || user.username;
      }
      if (user.role === "kitchen") {
        document.querySelector("#nav-cashier-only-1")?.remove();
        document.querySelector("#nav-cashier-only-2")?.remove();
      }
    }

    syncUser();
    let pollCount = 0;
    const pollRole = setInterval(() => {
      pollCount++;
      if (window.RoleGuard?.user) {
        clearInterval(pollRole);
        syncUser();
      } else if (pollCount > 30) {
        clearInterval(pollRole);
      }
    }, 100);

    // 4. Đăng xuất
    const btnLogout = document.querySelector("#btn-logout");
    btnLogout?.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await fetch("/api/v1/auth/logout", { method: "POST" });
        location.replace("/admin/login.html");
      } catch (err) {
        if (window.BanhangUi?.toast) {
          window.BanhangUi.toast("Đăng xuất thất bại.", "error");
        } else {
          location.replace("/admin/login.html");
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
