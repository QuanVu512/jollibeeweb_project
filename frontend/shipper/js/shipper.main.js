const API_URL = "/api/v1/shipper/orders";

let currentTab = "new";
let allOrders = [];

document.addEventListener("DOMContentLoaded", () => {
  setupTabEvents();
  setupModalEvents();
  setupGlobalActionEvents();
  setupLogoutButton();

  loadShipperProfile();

  showTab(currentTab);
  loadAllOrders();

  setInterval(() => {
    loadAllOrders();
  }, 10000);
});


function setupTabEvents() {
  document.querySelectorAll(".nav-link").forEach((button) => {
    button.addEventListener("click", () => {
      showTab(button.dataset.tab);
    });
  });
}

function setupModalEvents() {
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
}

function setupGlobalActionEvents() {
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
}


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
  if (!box) return;

  box.innerHTML = "";

  if (orders.length === 0) {
    box.innerHTML = renderEmptyState("📦", "Chưa có đơn mới");
    return;
  }

  orders.forEach((order) => {
    box.innerHTML += renderOrderCard(order, "new");
  });
}

async function loadShippingOrders() {
  const data = await requestApi(`${API_URL}/shipping`);
  const orders = data.data?.items || [];

  saveOrdersToMemory(orders);

  const box = document.getElementById("shipping-orders");
  const count = document.getElementById("shipping-count");

  if (count) count.textContent = orders.length;
  if (!box) return;

  box.innerHTML = "";

  if (orders.length === 0) {
    box.innerHTML = renderEmptyState("🛵", "Chưa có đơn đang giao");
    return;
  }

  orders.forEach((order) => {
    box.innerHTML += renderOrderCard(order, "shipping");
  });
}

async function loadHistoryOrders() {
  const data = await requestApi(`${API_URL}/history`);
  const orders = data.data?.items || [];

  saveOrdersToMemory(orders);

  const box = document.getElementById("history-orders");
  const count = document.getElementById("history-count");

  if (count) count.textContent = orders.length;
  if (!box) return;

  box.innerHTML = "";

  if (orders.length === 0) {
    box.innerHTML = renderEmptyState("📜", "Chưa có lịch sử giao hàng");
    return;
  }

  orders.forEach((order) => {
    box.innerHTML += renderOrderCard(order, "history");
  });
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
