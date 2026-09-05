function renderEmptyState(icon, text) {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <div class="empty-text">${escapeHtml(text)}</div>
    </div>
  `;
}

function renderOrderCard(order, type) {
  const orderCode = order.orderCode || order._id;
  const customerName = order.customerName || "Chưa có tên";
  const customerPhone = order.customerPhone || order.phone || "Chưa có SĐT";
  const deliveryAddress =
    order.deliveryAddress || order.address || "Chưa có địa chỉ";

  const total = getOrderTotal(order);
  const time = formatDate(order.orderedAt || order.createdAt);
  const statusText = convertStatus(order.status);
  const statusClass = getStatusClass(order.status);

  const paymentMethod = getPaymentMethodText(order.payment?.method);
  const paymentStatus = getPaymentStatusText(order.payment?.status);
  const needCollect = getNeedCollectAmount(order);

  const failureReason =
    order.failureReason && type === "history"
      ? `
        <div class="order-failure">
          📌 Lý do: ${escapeHtml(order.failureReason)}
        </div>
      `
      : "";

  return `
    <div class="order-card ${type}">
      <div class="order-card-header">
        <div>
          <div class="order-code">Đơn #${escapeHtml(orderCode)}</div>
          <div class="order-time">⏱ ${escapeHtml(time)}</div>
        </div>

        <div class="order-price-box">
          <div class="order-total">${formatMoney(total)}đ</div>
          <span class="order-status ${statusClass}">
            ${escapeHtml(statusText)}
          </span>
        </div>
      </div>

      <div class="order-info">
        <div class="order-info-item">
          <span class="order-info-icon">👤</span>
          <span>${escapeHtml(customerName)}</span>
        </div>

        <div class="order-info-item">
          <span class="order-info-icon">📞</span>
          <span>${escapeHtml(customerPhone)}</span>
        </div>

        <div class="order-info-item order-address">
          <span class="order-info-icon">📍</span>
          <span>${escapeHtml(deliveryAddress)}</span>
        </div>
      </div>

      <div class="order-payment-mini">
        <span>💳 ${escapeHtml(paymentMethod)} - ${escapeHtml(paymentStatus)}</span>
        <span>💰 Cần thu: ${formatMoney(needCollect)}đ</span>
      </div>

      ${failureReason}

      <div class="order-actions">
        ${renderCardActionButtons(order, type)}
      </div>
    </div>
  `;
}

function renderCardActionButtons(order, type) {
  if (type === "new") {
    return `
      <button class="btn accept" type="button" data-action="accept" data-id="${order._id}">
        Nhận
      </button>

      <button class="btn detail" type="button" data-action="detail" data-id="${order._id}">
        Xem chi tiết
      </button>
    `;
  }

  if (type === "shipping") {
    return `
      <button class="btn done" type="button" data-action="complete" data-id="${order._id}">
        Đã giao
      </button>

      <button class="btn fail" type="button" data-action="fail" data-id="${order._id}">
        Thất bại
      </button>

      <button class="btn detail" type="button" data-action="detail" data-id="${order._id}">
        Xem chi tiết
      </button>
    `;
  }

  return `
    <button class="btn detail" type="button" data-action="detail" data-id="${order._id}">
      Xem chi tiết
    </button>
  `;
}

function renderOrderDetailModal(order) {
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
  const statusClass = getStatusClass(order.status);

  const paymentMethod = getPaymentMethodText(order.payment?.method);
  const paymentStatus = getPaymentStatusText(order.payment?.status);
  const paymentStatusClass =
    order.payment?.status === "paid" ? "paid" : "unpaid";
  const needCollect = getNeedCollectAmount(order);

  const orderNotes = getOrderNotes(order);

  return `
    <h2 class="detail-title">Chi tiết đơn hàng</h2>

    ${renderModalHeader(orderCode, orderTime, statusText, statusShort, statusClass)}

    ${renderCustomerInfo(customerName, customerPhone, deliveryAddress)}

    ${renderOrderNotes(orderNotes)}

    ${renderMoneySummary(subtotal, shippingFee, discount, total)}

    ${renderPaymentInfo(paymentMethod, paymentStatus, paymentStatusClass, needCollect)}

    ${renderOrderItemsTable(order.items || [], total)}

    ${renderFailureReason(order.failureReason)}

    <div class="modal-actions">
      <button class="modal-btn close" type="button" data-action="modal-close">
        × Đóng
      </button>

      ${renderModalActionButton(order)}
    </div>
  `;
}

function renderModalHeader(
  orderCode,
  orderTime,
  statusText,
  statusShort,
  statusClass,
) {
  return `
    <div class="detail-header-box">
      <div class="detail-order-icon">🛍️</div>

      <div class="detail-order-main">
        <div class="detail-order-code">Đơn #${escapeHtml(orderCode)}</div>

        <span class="detail-status ${statusClass}">
          ${escapeHtml(statusText)}
        </span>

        <div class="detail-time">⏱ ${escapeHtml(orderTime)}</div>
      </div>

      <div class="detail-status-pill ${statusClass}">
        ${escapeHtml(statusShort)}
      </div>
    </div>
  `;
}

function renderCustomerInfo(customerName, customerPhone, deliveryAddress) {
  return `
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

          <button
            class="info-action"
            type="button"
            onclick="callCustomer('${escapeAttribute(customerPhone)}')"
          >
            Gọi ngay
          </button>
        </div>

        <div class="info-row">
          <div class="info-icon">📍</div>
          <div class="info-label">Địa chỉ giao hàng</div>
          <div class="info-value">${escapeHtml(deliveryAddress)}</div>

          <button
            class="info-action"
            type="button"
            onclick="openMap('${escapeAttribute(deliveryAddress)}')"
          >
            Xem bản đồ
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderOrderNotes(orderNotes) {
  return `
    <div class="detail-section">
      <div class="detail-section-title">Ghi chú đơn hàng</div>

      <div class="note-box ${orderNotes ? "has-note" : "no-note"}">
        <div class="note-icon">📝</div>

        <div class="note-content">
          <div class="note-label">Ghi chú từ khách hàng</div>
          <div class="note-text">
            ${escapeHtml(orderNotes || "Không có ghi chú")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderMoneySummary(subtotal, shippingFee, discount, total) {
  return `
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
  `;
}

function renderPaymentInfo(
  paymentMethod,
  paymentStatus,
  paymentStatusClass,
  needCollect,
) {
  return `
    <div class="detail-section">
      <div class="detail-section-title">Thông tin thanh toán</div>

      <div class="payment-box">
        <div class="payment-item">
          <div class="payment-icon">💳</div>

          <div>
            <div class="payment-label">Phương thức</div>
            <div class="payment-value">${escapeHtml(paymentMethod)}</div>
          </div>
        </div>

        <div class="payment-item">
          <div class="payment-icon">⚠️</div>

          <div>
            <div class="payment-label">Trạng thái</div>

            <div class="payment-value">
              <span class="payment-status ${paymentStatusClass}">
                ${escapeHtml(paymentStatus)}
              </span>
            </div>
          </div>
        </div>

        <div class="payment-item">
          <div class="payment-icon">💰</div>

          <div>
            <div class="payment-label">Khách cần thu</div>
            <div class="payment-value payment-money">
              ${formatMoney(needCollect)}đ
            </div>
          </div>
        </div>
      </div>

      <div class="payment-note">
        ${
          needCollect > 0
            ? "Shipper cần thu tiền khi giao hàng"
            : "Đơn hàng đã thanh toán, shipper không cần thu tiền"
        }
      </div>
    </div>
  `;
}

function renderOrderItemsTable(items, total) {
  return `
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
          ${renderOrderItems(items)}

          <tr class="table-total-row">
            <td colspan="3">Tổng cộng</td>
            <td class="table-total-price">${formatMoney(total)}đ</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
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

function renderFailureReason(failureReason) {
  if (!failureReason) return "";

  return `
    <div class="detail-section">
      <div class="detail-section-title">Lý do giao thất bại</div>

      <div class="info-box">
        <div class="info-row">
          <div class="info-icon">⚠️</div>
          <div class="info-label">Lý do</div>
          <div class="info-value">${escapeHtml(failureReason)}</div>
          <div></div>
        </div>
      </div>
    </div>
  `;
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
