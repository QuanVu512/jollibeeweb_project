document.addEventListener("DOMContentLoaded", () => {
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
        alert("Đăng xuất thất bại!");
      }
    });

    loadPendingOrders();
  }

  const ordersContainer = document.querySelector("#orders-container");

  async function loadPendingOrders() {
    try {
      const res = await window.BanhangApi.request("/orders/pending");
      renderOrders(res.data.items);
    } catch (err) {
      ordersContainer.innerHTML = `<p style="color: red; text-align: center;">Lỗi khi tải đơn hàng: ${err.message}</p>`;
    }
  }

  function renderOrders(orders) {
    if (!orders || orders.length === 0) {
      ordersContainer.innerHTML = `<p style="text-align: center; color: #888; font-weight: bold; padding: 40px 0; background: #fff; border-radius: 10px;"><span class="emoji">🎉</span> Hiện tại không có đơn hàng nào chờ xác nhận.</p>`;
      return;
    }

    ordersContainer.innerHTML = orders.map(order => {
      const formattedDate = new Date(order.orderedAt).toLocaleString("vi-VN");
      const orderTypeLabel = order.orderType === "delivery" ? "Giao hàng / Ship" : (order.orderType === "pickup" ? "Mang về" : "Ăn tại chỗ");
      return `
        <div class="order-card" id="order-${order._id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px;">
            <div>
              <h3 style="margin: 0 0 10px 0; color: #2b2b2b;">Đơn hàng #${order.orderCode} <span style="font-size: 13px; color: #666; font-weight: normal;">(${formattedDate})</span></h3>
              <p style="margin: 5px 0;">Khách hàng: <b>${order.customerName || "Khách lẻ"}</b> ${order.customerPhone ? `(${order.customerPhone})` : ""}</p>
              <p style="margin: 5px 0;">Hình thức: <span style="color: #f3a22f; font-weight: bold;">${orderTypeLabel}</span></p>
              <p style="margin: 5px 0;">Địa chỉ/Bàn: <b style="color: #555;">${order.deliveryAddress || "Không có"}</b></p>
              <p style="margin: 10px 0 0 0;">Tổng tiền: <span style="color:#d8262f; font-weight:900; font-size: 22px;">${formatPrice(order.total)}đ</span></p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button class="btn btn-outline btn-toggle-details" data-id="${order._id}">Chi tiết <span class="emoji">🍝</span></button>
              <button class="btn btn-red btn-accept" data-id="${order._id}">Chấp nhận</button>
              <button class="btn btn-gray btn-cancel" data-id="${order._id}">Hủy</button>
            </div>
          </div>

          <div class="details" id="det-${order._id}">
            <table class="details-table">
              <thead>
                <tr>
                  <th align="left">Món ăn</th>
                  <th align="center">SL</th>
                  <th align="right">Đơn giá</th>
                  <th align="right">Tổng cộng</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td><b>${item.name}</b></td>
                    <td align="center">${item.quantity}</td>
                    <td align="right">${formatPrice(item.unitPrice)}đ</td>
                    <td align="right"><b>${formatPrice(item.lineTotal)}đ</b></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join("");

    ordersContainer.querySelectorAll(".btn-toggle-details").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const detailsEl = document.querySelector(`#det-${id}`);
        detailsEl.classList.toggle("show");
      });
    });

    ordersContainer.querySelectorAll(".btn-accept").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("Bạn muốn duyệt đơn hàng này?")) return;
        try {
          btn.disabled = true;
          await window.BanhangApi.request(`/orders/${id}/accept`, { method: "PATCH" });
          alert("Đã duyệt đơn hàng!");
          loadPendingOrders();
        } catch (err) {
          alert("Lỗi: " + err.message);
          btn.disabled = false;
        }
      });
    });

    ordersContainer.querySelectorAll(".btn-cancel").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const reason = prompt("Nhập lý do hủy đơn:");
        if (reason === null) return;
        
        try {
          btn.disabled = true;
          await window.BanhangApi.request(`/orders/${id}/cancel`, {
            method: "PATCH",
            body: JSON.stringify({ reason: reason || "Thu ngân hủy đơn hàng" })
          });
          alert("Đã hủy đơn hàng!");
          loadPendingOrders();
        } catch (err) {
          alert("Lỗi: " + err.message);
          btn.disabled = false;
        }
      });
    });
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price);
  }
});
