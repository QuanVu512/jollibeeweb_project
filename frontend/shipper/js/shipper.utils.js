/* =========================================================
   SHIPPER UTILS
   Các hàm phụ trợ: format, trạng thái, thanh toán, bảo vệ HTML
========================================================= */

/* ===================== TRẠNG THÁI ĐƠN HÀNG ===================== */

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

function getStatusClass(status) {
  const statusClassMap = {
    ready_for_delivery: "status-ready",
    delivering: "status-delivering",
    completed: "status-completed",
    failed: "status-failed",
    cancelled: "status-cancelled",
    pending: "status-pending",
    preparing: "status-preparing",
  };

  return statusClassMap[status] || "status-default";
}

/* ===================== THÔNG TIN ĐƠN HÀNG ===================== */

function getOrderTotal(order) {
  return order.total || order.totalPrice || 0;
}

function getOrderNotes(order) {
  if (!order) return "";

  if (Array.isArray(order.notes)) {
    return order.notes.filter(Boolean).join(", ");
  }

  return (
    order.notes || order.note || order.customerNote || order.deliveryNote || ""
  );
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

function getPaymentMethodText(method) {
  const methodMap = {
    cod: "COD",
    cash: "Tiền mặt",
    banking: "Banking",
    bank: "Chuyển khoản",
    momo: "Ví MoMo",
    vnpay: "VNPay",
    online: "Online",
  };

  return methodMap[method] || method || "Chưa xác định";
}

function getPaymentStatusText(status) {
  const statusMap = {
    paid: "Đã thanh toán",
    unpaid: "Chưa thanh toán",
    pending: "Đang chờ",
    failed: "Thanh toán lỗi",
    refunded: "Đã hoàn tiền",
  };

  return statusMap[status] || status || "Chưa xác định";
}

function getNeedCollectAmount(order) {
  const method = order.payment?.method;
  const status = order.payment?.status;

  if ((method === "cod" || method === "cash") && status !== "paid") {
    return getOrderTotal(order);
  }

  return 0;
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
