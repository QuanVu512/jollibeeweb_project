const API_URL = "/api/v1/shipper/orders";

let currentTab = "new";
let allOrders = [];

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-link").forEach((button) => {
    button.addEventListener("click", () => {
      showTab(button.dataset.tab);
    });
  });

  const modal = document.getElementById("order-detail-modal");

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target.id === "order-detail-modal") {
        closeDetailModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDetailModal();
    }
  });

  showTab(currentTab);
  loadAllOrders();

  setInterval(() => {
    loadAllOrders();
  }, 10000);
});

function showTab(tab) {
  if (!tab) return;

  currentTab = tab;

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.style.display = "none";
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  const selectedContent = document.getElementById("content-" + tab);
  const selectedTab = document.getElementById("tab-" + tab);

  if (selectedContent) selectedContent.style.display = "block";
  if (selectedTab) selectedTab.classList.add("active");
}

async function requestApi(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });

  let data = {};

  try {
    data = await res.json();
  } catch (_error) {
    data = {};
  }

  if (!res.ok || data.success === false) {
    alert(data.message || "Có lỗi xảy ra khi gọi API.");
    throw new Error(data.message || "API Error");
  }

  return data;
}

function saveOrdersToMemory(orders) {
  allOrders = [
    ...allOrders.filter((oldOrder) => {
      return !orders.some(
        (newOrder) => String(newOrder._id) === String(oldOrder._id),
      );
    }),
    ...orders,
  ];
}

async function loadAllOrders() {
  try {
    allOrders = [];

    await loadNewOrders();
    await loadShippingOrders();
    await loadHistoryOrders();

    showTab(currentTab);
  } catch (error) {
    console.error("Lỗi tải đơn hàng:", error);
  }
}

async function loadNewOrders() {
  const data = await requestApi(`${API_URL}/new`);

  const orders = data.data?.items || [];
  saveOrdersToMemory(orders);

  const box = document.getElementById("new-orders");
  const count = document.getElementById("new-count");

  if (count) count.textContent = orders.length;
  box.innerHTML = "";

  if (orders.length === 0) {
    box.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <div class="empty-text">Chưa có đơn mới</div>
      </div>
    `;
    return;
  }

  orders.forEach((order) => {
    box.innerHTML += `
      <div class="card new">
        <b>Đơn #${escapeHtml(order.orderCode || order._id)}</b><br>
        👤 ${escapeHtml(order.customerName || "Chưa có tên")}<br>
        📞 ${escapeHtml(order.customerPhone || order.phone || "Chưa có SĐT")}<br>
        📍 ${escapeHtml(order.deliveryAddress || order.address || "Chưa có địa chỉ")}<br><br>
        💰 ${formatMoney(getOrderTotal(order))}đ <br>
        ⏱ ${formatDate(order.orderedAt || order.createdAt)}<br><br>

        <button class="btn accept" type="button" data-action="accept" data-id="${order._id}">Nhận</button>
        <button class="btn reject" type="button" data-action="cancel" data-id="${order._id}">Hủy</button>
        <button class="btn detail" type="button" data-action="detail" data-id="${order._id}">Xem chi tiết</button>
      </div>
    `;
  });
}

async function loadShippingOrders() {
  const data = await requestApi(`${API_URL}/shipping`);

  const orders = data.data?.items || [];
  saveOrdersToMemory(orders);

  const box = document.getElementById("shipping-orders");
  const count = document.getElementById("shipping-count");

  if (count) count.textContent = orders.length;
  box.innerHTML = "";

  if (orders.length === 0) {
    box.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛵</div>
        <div class="empty-text">Chưa có đơn đang giao</div>
      </div>
    `;
    return;
  }

  orders.forEach((order) => {
    box.innerHTML += `
      <div class="card shipping">
        <b>Đơn #${escapeHtml(order.orderCode || order._id)}</b><br>
        👤 ${escapeHtml(order.customerName || "Chưa có tên")}<br>
        📞 ${escapeHtml(order.customerPhone || order.phone || "Chưa có SĐT")}<br>
        📍 ${escapeHtml(order.deliveryAddress || order.address || "Chưa có địa chỉ")}<br><br>
        💰 ${formatMoney(getOrderTotal(order))}đ <br>
        ⏱ ${formatDate(order.orderedAt || order.createdAt)}<br><br>

        <button class="btn done" type="button" data-action="complete" data-id="${order._id}">Đã giao</button>
        <button class="btn fail" type="button" data-action="fail" data-id="${order._id}">Thất bại</button>
        <button class="btn detail" type="button" data-action="detail" data-id="${order._id}">Xem chi tiết</button>
      </div>
    `;
  });
}

async function loadHistoryOrders() {
  const data = await requestApi(`${API_URL}/history`);

  const orders = data.data?.items || [];
  saveOrdersToMemory(orders);

  const box = document.getElementById("history-orders");
  const count = document.getElementById("history-count");

  if (count) count.textContent = orders.length;
  box.innerHTML = "";

  if (orders.length === 0) {
    box.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📜</div>
        <div class="empty-text">Chưa có lịch sử giao hàng</div>
      </div>
    `;
    return;
  }

  orders.forEach((order) => {
    const statusText =
      order.status === "completed"
        ? '<span style="color:green">✔ Hoàn thành</span>'
        : '<span style="color:red">❌ Thất bại</span>';

    const failureReason = order.failureReason
      ? `<br>📌 Lý do: ${escapeHtml(order.failureReason)}`
      : "";

    box.innerHTML += `
      <div class="card history">
        <b>Đơn #${escapeHtml(order.orderCode || order._id)}</b><br>
        👤 ${escapeHtml(order.customerName || "Chưa có tên")}<br>
        📞 ${escapeHtml(order.customerPhone || order.phone || "Chưa có SĐT")}<br>
        📍 ${escapeHtml(order.deliveryAddress || order.address || "Chưa có địa chỉ")}<br>
        💰 ${formatMoney(getOrderTotal(order))}đ <br>
        ⏱ ${formatDate(order.orderedAt || order.createdAt)}<br><br>
        ${statusText}
        ${failureReason}<br><br>
        <button class="btn detail" type="button" data-action="detail" data-id="${order._id}">Xem chi tiết</button>
      </div>
    `;
  });
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === "modal-close") {
    closeDetailModal();
    return;
  }

  if (action === "accept") {
    await acceptOrder(id);
    return;
  }

  if (action === "cancel") {
    await cancelOrder(id);
    return;
  }

  if (action === "complete") {
    await completeOrder(id);
    return;
  }

  if (action === "fail") {
    await failOrder(id);
    return;
  }

  if (action === "detail") {
    viewDetail(id);
    return;
  }
});

async function acceptOrder(id) {
  try {
    await requestApi(`${API_URL}/${id}/accept`, {
      method: "PATCH",
    });

    closeDetailModal();
    await loadAllOrders();
    showTab("shipping");
  } catch (error) {
    console.error("Lỗi nhận đơn:", error);
  }
}

async function completeOrder(id) {
  try {
    await requestApi(`${API_URL}/${id}/complete`, {
      method: "PATCH",
    });

    closeDetailModal();
    await loadAllOrders();
    showTab("history");
  } catch (error) {
    console.error("Lỗi hoàn thành đơn:", error);
  }
}

async function failOrder(id) {
  const reason = prompt("Nhập lý do giao thất bại:", "Khách không nghe máy");

  if (reason === null) return;

  try {
    await requestApi(`${API_URL}/${id}/fail`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    });

    closeDetailModal();
    await loadAllOrders();
    showTab("history");
  } catch (error) {
    console.error("Lỗi cập nhật thất bại:", error);
  }
}

async function cancelOrder(id) {
  const confirmCancel = confirm("Bạn có chắc muốn hủy nhận đơn này không?");

  if (!confirmCancel) return;

  try {
    await requestApi(`${API_URL}/${id}/cancel`, {
      method: "PATCH",
    });

    closeDetailModal();
    await loadAllOrders();
    showTab("new");
  } catch (error) {
    console.error("Lỗi hủy đơn:", error);
  }
}

function viewDetail(id) {
  const order = allOrders.find((item) => String(item._id) === String(id));

  if (!order) {
    alert("Không tìm thấy chi tiết đơn hàng.");
    return;
  }

  const modal = document.getElementById("order-detail-modal");
  const content = document.getElementById("order-detail-content");

  if (!modal || !content) {
    alert("Chưa cấu hình modal chi tiết đơn hàng trong file HTML.");
    return;
  }

  const orderCode = order.orderCode || order._id;
  const customerName = order.customerName || "Chưa có tên";
  const customerPhone = order.customerPhone || order.phone || "Chưa có SĐT";
  const deliveryAddress =
    order.deliveryAddress || order.address || "Chưa có địa chỉ";

  const subtotal = Number(order.subtotal || getOrderTotal(order) || 0);
  const shippingFee = Number(order.shippingFee || 0);
  const discount = Number(order.discount || 0);
  const total = Number(
    getOrderTotal(order) || subtotal + shippingFee - discount,
  );

  const orderTime = formatDate(order.orderedAt || order.createdAt);
  const statusText = convertStatus(order.status);
  const statusShort = getShortStatus(order.status);

  content.innerHTML = `
    <h2 class="detail-title">Chi tiết đơn hàng</h2>

    <div class="detail-header-box">
      <div class="detail-order-icon">🛍️</div>

      <div class="detail-order-main">
        <div class="detail-order-code">Đơn #${escapeHtml(orderCode)}</div>
        <span class="detail-status">${escapeHtml(statusText)}</span>
        <div class="detail-time">⏱ ${escapeHtml(orderTime)}</div>
      </div>

      <div class="detail-status-pill">${escapeHtml(statusShort)}</div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Thông tin khách hàng</div>

      <div class="info-box">
        <div class="info-row">
          <div class="info-icon">👤</div>
          <div class="info-label">Họ và tên</div>
          <div class="info-value">${escapeHtml(customerName)}</div>
          <div></div>
        </div>

        <div class="info-row">
          <div class="info-icon">📞</div>
          <div class="info-label">Số điện thoại</div>
          <div class="info-value">${escapeHtml(customerPhone)}</div>
          <button class="info-action" type="button" onclick="callCustomer('${escapeAttribute(customerPhone)}')">
            Gọi ngay
          </button>
        </div>

        <div class="info-row">
          <div class="info-icon">📍</div>
          <div class="info-label">Địa chỉ giao hàng</div>
          <div class="info-value">${escapeHtml(deliveryAddress)}</div>
          <button class="info-action" type="button" onclick="openMap('${escapeAttribute(deliveryAddress)}')">
            Xem bản đồ
          </button>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Thông tin đơn hàng</div>

      <div class="summary-box">
        <div class="summary-item">
          <div class="summary-label">Tạm tính</div>
          <div class="summary-value">${formatMoney(subtotal)}đ</div>
        </div>

        <div class="summary-item">
          <div class="summary-label">Phí giao hàng</div>
          <div class="summary-value">${formatMoney(shippingFee)}đ</div>
        </div>

        <div class="summary-item">
          <div class="summary-label">Giảm giá</div>
          <div class="summary-value">${formatMoney(discount)}đ</div>
        </div>

        <div class="summary-item">
          <div class="summary-label">Tổng thanh toán</div>
          <div class="summary-value total">${formatMoney(total)}đ</div>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Danh sách món</div>

      <table class="detail-table">
        <thead>
          <tr>
            <th>Món ăn</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>

        <tbody>
          ${renderOrderItems(order.items || [])}

          <tr class="table-total-row">
            <td colspan="3">Tổng cộng</td>
            <td class="table-total-price">${formatMoney(total)}đ</td>
          </tr>
        </tbody>
      </table>
    </div>

    ${
      order.failureReason
        ? `
          <div class="detail-section">
            <div class="detail-section-title">Lý do giao thất bại</div>
            <div class="info-box">
              <div class="info-row">
                <div class="info-icon">⚠️</div>
                <div class="info-label">Lý do</div>
                <div class="info-value">${escapeHtml(order.failureReason)}</div>
                <div></div>
              </div>
            </div>
          </div>
        `
        : ""
    }

    <div class="modal-actions">
      <button class="modal-btn close" type="button" data-action="modal-close">
        × Đóng
      </button>

      ${renderModalActionButton(order)}
    </div>
  `;

  modal.classList.add("show");
}

function renderOrderItems(items) {
  if (!items || items.length === 0) {
    return `
      <tr>
        <td colspan="4" style="text-align:center; color:#777;">
          Chưa có dữ liệu món ăn
        </td>
      </tr>
    `;
  }

  return items
    .map((item) => {
      const name = item.name || item.productName || "Món ăn";
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice || item.price || 0);
      const lineTotal = Number(item.lineTotal || unitPrice * quantity || 0);

      return `
        <tr>
          <td>
            <div class="food-cell">
              <span class="food-icon">${getFoodIcon(name)}</span>
              <span>${escapeHtml(name)}</span>
            </div>
          </td>
          <td>${quantity}</td>
          <td>${formatMoney(unitPrice)}đ</td>
          <td>${formatMoney(lineTotal)}đ</td>
        </tr>
      `;
    })
    .join("");
}

function renderModalActionButton(order) {
  if (order.status === "ready_for_delivery") {
    return `
      <button class="modal-btn primary" type="button" data-action="accept" data-id="${order._id}">
        ✓ Nhận đơn
      </button>
    `;
  }

  if (order.status === "delivering") {
    return `
      <button class="modal-btn success" type="button" data-action="complete" data-id="${order._id}">
        ✓ Đã giao
      </button>

      <button class="modal-btn danger" type="button" data-action="fail" data-id="${order._id}">
        ✕ Thất bại
      </button>
    `;
  }

  return `
    <button class="modal-btn primary" type="button" data-action="modal-close">
      Đã hiểu
    </button>
  `;
}

function closeDetailModal() {
  const modal = document.getElementById("order-detail-modal");
  const content = document.getElementById("order-detail-content");

  if (modal) {
    modal.classList.remove("show");
  }

  if (content) {
    content.innerHTML = "";
  }
}

function callCustomer(phone) {
  if (!phone || phone === "Chưa có SĐT") {
    alert("Đơn hàng chưa có số điện thoại.");
    return;
  }

  window.location.href = `tel:${phone}`;
}

function openMap(address) {
  if (!address || address === "Chưa có địa chỉ") {
    alert("Đơn hàng chưa có địa chỉ giao hàng.");
    return;
  }

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  window.open(mapUrl, "_blank");
}

function convertStatus(status) {
  const statusMap = {
    ready_for_delivery: "Chờ shipper nhận",
    delivering: "Đang giao",
    completed: "Hoàn thành",
    failed: "Giao thất bại",
    cancelled: "Đã hủy",
    pending: "Chờ xử lý",
    preparing: "Đang chuẩn bị",
  };

  return statusMap[status] || status || "Chưa xác định";
}

function getShortStatus(status) {
  const statusMap = {
    ready_for_delivery: "Chờ shipper nhận",
    delivering: "Đang giao",
    completed: "Đã hoàn thành",
    failed: "Giao thất bại",
    cancelled: "Đã hủy",
    pending: "Chờ xử lý",
    preparing: "Đang chuẩn bị",
  };

  return statusMap[status] || "Đơn giao hàng";
}

function getOrderTotal(order) {
  return order.total || order.totalPrice || 0;
}

function getFoodIcon(name) {
  const lowerName = String(name || "").toLowerCase();

  if (
    lowerName.includes("pepsi") ||
    lowerName.includes("coca") ||
    lowerName.includes("nước")
  ) {
    return "🥤";
  }

  if (lowerName.includes("burger")) {
    return "🍔";
  }

  if (lowerName.includes("mì") || lowerName.includes("spaghetti")) {
    return "🍝";
  }

  if (lowerName.includes("gà")) {
    return "🍗";
  }

  if (lowerName.includes("khoai")) {
    return "🍟";
  }

  return "🍽️";
}

function formatMoney(value) {
  if (!value) return "0";
  return Number(value).toLocaleString("vi-VN");
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll('"', "&quot;");
}
