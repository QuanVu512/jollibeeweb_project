document.addEventListener("DOMContentLoaded", () => {
  // Chờ RoleGuard tải xong
  let checkRoleGuard = setInterval(() => {
    if (window.RoleGuard && window.RoleGuard.user) {
      clearInterval(checkRoleGuard);
      initPage();
    }
  }, 100);

  function initPage() {
    const user = window.RoleGuard.user;
    document.querySelector("#staff-name").textContent = user.displayName || user.username;

    // Phân quyền trên thanh menu: Bếp không được thấy/vào các trang tạo đơn/xác nhận
    if (user.role === "kitchen") {
      const nav1 = document.querySelector("#nav-cashier-only-1");
      const nav2 = document.querySelector("#nav-cashier-only-2");
      if (nav1) nav1.remove();
      if (nav2) nav2.remove();
    }

    const btnLogout = document.querySelector("#btn-logout");
    btnLogout.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await fetch("/api/v1/auth/logout", { method: "POST" });
        location.replace("/admin/login.html");
      } catch (err) {
        alert("Đăng xuất thất bại!");
      }
    });

    loadPreparingOrders();
    // Tự động tải lại mỗi 10 giây để hiển thị đơn hàng mới
    setInterval(loadPreparingOrders, 10000);
  }

  const dineInTickets = document.querySelector("#dine-in-tickets");
  const deliveryTickets = document.querySelector("#delivery-tickets");

  async function loadPreparingOrders() {
    try {
      const res = await window.BanhangApi.request("/orders/preparing");
      renderTickets(res.data.items);
    } catch (err) {
      dineInTickets.innerHTML = `<p style="color: red;">Lỗi: ${err.message}</p>`;
      deliveryTickets.innerHTML = `<p style="color: red;">Lỗi: ${err.message}</p>`;
    }
  }

  function renderTickets(orders) {
    const dineInOrders = orders.filter(o => o.orderType === "dine_in");
    const deliveryOrders = orders.filter(o => o.orderType === "delivery" || o.orderType === "pickup");

    // 1. Render Ăn tại chỗ
    if (dineInOrders.length === 0) {
      dineInTickets.innerHTML = `<p style="text-align: center; color: #888; padding: 20px 0;">Không có đơn ăn tại chỗ</p>`;
    } else {
      dineInTickets.innerHTML = dineInOrders.map(order => `
        <div class="ticket" id="ticket-${order._id}">
          <h3 style="margin: 0 0 10px 0; color: #d8262f; display: flex; justify-content: space-between;">
            <span>Đơn #${order.orderCode}</span>
            <span style="font-size: 13px; color: #666; font-weight: normal;">Bàn: ${order.deliveryAddress || "Chưa ghi"}</span>
          </h3>
          <p style="margin: 5px 0;">Khách: <b>${order.customerName || "Khách lẻ"}</b></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${order.items.map(item => `
              <li style="padding: 8px 0; border-bottom: 1px solid #eee; display: flex; align-items: center;">
                <span class="qty">${item.quantity}</span>
                <b>${item.name}</b>
              </li>
            `).join("")}
          </ul>
          <button class="btn-action btn-serve" data-id="${order._id}" style="background:#007bff; box-shadow: 0 4px 0 #0056b3;">🍽️ PHỤC VỤ XONG</button>
        </div>
      `).join("");

      // Gắn sự kiện phục vụ xong
      dineInTickets.querySelectorAll(".btn-serve").forEach(btn => {
        btn.addEventListener("click", () => handleServe(btn.dataset.id, btn));
      });
    }

    // 2. Render Giao hàng / Mang đi
    if (deliveryOrders.length === 0) {
      deliveryTickets.innerHTML = `<p style="text-align: center; color: #888; padding: 20px 0;">Không có đơn ship / mang về</p>`;
    } else {
      deliveryTickets.innerHTML = deliveryOrders.map(order => {
        const typeLabel = order.orderType === "pickup" ? "Mang về" : "Ship";
        return `
          <div class="ticket" id="ticket-${order._id}" style="border-top-color: #28a745;">
            <h3 style="margin: 0 0 10px 0; color: #28a745; display: flex; justify-content: space-between;">
              <span>Đơn #${order.orderCode}</span>
              <span style="font-size: 13px; color: #666; font-weight: normal; text-transform: uppercase;">${typeLabel}</span>
            </h3>
            <p style="margin: 5px 0;">Khách: <b>${order.customerName || "Khách lẻ"}</b></p>
            <p style="margin: 5px 0; font-size: 13px; color: #555;">Đ/C: ${order.deliveryAddress || "Không có"}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${order.items.map(item => `
                <li style="padding: 8px 0; border-bottom: 1px solid #eee; display: flex; align-items: center;">
                  <span class="qty" style="background-color: #28a745;">${item.quantity}</span>
                  <b>${item.name}</b>
                </li>
              `).join("")}
            </ul>
            <button class="btn-action btn-ready" data-id="${order._id}" style="background:#28a745; box-shadow: 0 4px 0 #1e7e34;">🛵 LÀM XONG</button>
          </div>
        `;
      }).join("");

      // Gắn sự kiện làm xong
      deliveryTickets.querySelectorAll(".btn-ready").forEach(btn => {
        btn.addEventListener("click", () => handleReady(btn.dataset.id, btn));
      });
    }
  }

  async function handleServe(id, btn) {
    if (!confirm("Xác nhận phục vụ xong đơn này?")) return;
    try {
      btn.disabled = true;
      await window.BanhangApi.request(`/orders/${id}/serve`, { method: "PATCH" });
      loadPreparingOrders();
    } catch (err) {
      alert("Lỗi: " + err.message);
      btn.disabled = false;
    }
  }

  async function handleReady(id, btn) {
    if (!confirm("Xác nhận đơn hàng đã chế biến xong, chờ giao hàng?")) return;
    try {
      btn.disabled = true;
      await window.BanhangApi.request(`/orders/${id}/ready`, { method: "PATCH" });
      loadPreparingOrders();
    } catch (err) {
      alert("Lỗi: " + err.message);
      btn.disabled = false;
    }
  }
});
