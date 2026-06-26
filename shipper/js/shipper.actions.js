/* =========================================================
   SHIPPER ACTIONS
   Xử lý các thao tác: nhận đơn, hoàn thành, thất bại, modal, gọi điện, bản đồ
========================================================= */

/* ===================== HÀNH ĐỘNG ĐƠN HÀNG ===================== */

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
  const confirmComplete = confirm("Bạn xác nhận đã giao thành công đơn này?");

  if (!confirmComplete) return;

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

/* ===================== MODAL CHI TIẾT ĐƠN HÀNG ===================== */

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

  content.innerHTML = renderOrderDetailModal(order);
  modal.classList.add("show");
}

function closeDetailModal() {
  const modal = document.getElementById("order-detail-modal");
  const content = document.getElementById("order-detail-content");

  if (modal) modal.classList.remove("show");
  if (content) content.innerHTML = "";
}

/* ===================== GỌI ĐIỆN / MỞ BẢN ĐỒ ===================== */

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

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;

  window.open(mapUrl, "_blank");
}

/* ===================== THÔNG TIN TÀI KHOẢN SHIPPER ===================== */

function loadShipperProfile() {
  const shipperName = document.getElementById("shipper-name");
  const shipperCode = document.getElementById("shipper-code");

  // Tạm thời hiển thị dữ liệu demo.
  // Sau này có thể thay bằng API /api/v1/auth/me nếu backend cho quyền shipper.
  if (shipperName) {
    shipperName.textContent = "An Moi";
  }

  if (shipperCode) {
    shipperCode.textContent = "SP001";
  }
}

function setupLogoutButton() {
  const logoutBtn = document.getElementById("logout-btn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    const confirmLogout = confirm("Bạn có chắc muốn đăng xuất không?");

    if (!confirmLogout) return;

    logoutBtn.disabled = true;
    logoutBtn.textContent = "Đang đăng xuất...";

    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    } finally {
      location.replace("/admin/login.html");
    }
  });
}
