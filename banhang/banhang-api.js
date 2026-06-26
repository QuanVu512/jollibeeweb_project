(function exposeApi(global) {
  const API_BASE = "/api/v1/banhang";

  function ensureToastContainer() {
    let container = document.querySelector("#banhang-toast-container");
    if (container) return container;

    container = document.createElement("div");
    container.id = "banhang-toast-container";
    Object.assign(container.style, {
      position: "fixed",
      top: "18px",
      right: "18px",
      zIndex: "9999",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      maxWidth: "360px"
    });
    document.body.appendChild(container);
    return container;
  }

  function toast(message, type = "info", timeout = 3800) {
    const colors = {
      success: ["#1f8f4d", "#eaf8f0"],
      error: ["#d8262f", "#fff0f1"],
      warning: ["#b7791f", "#fff7e6"],
      info: ["#2b5c9e", "#eef5ff"]
    };
    const [accent, background] = colors[type] || colors.info;
    const item = document.createElement("div");
    item.textContent = message || "Thao tác đã hoàn tất.";
    Object.assign(item.style, {
      background,
      color: "#2b2b2b",
      borderLeft: `5px solid ${accent}`,
      boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
      borderRadius: "8px",
      padding: "13px 15px",
      fontWeight: "800",
      lineHeight: "1.35"
    });

    ensureToastContainer().appendChild(item);
    window.setTimeout(() => {
      item.style.opacity = "0";
      item.style.transform = "translateX(10px)";
      item.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      window.setTimeout(() => item.remove(), 220);
    }, timeout);
  }

  function confirmAction(message, options = {}) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "10000",
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      });

      const dialog = document.createElement("div");
      Object.assign(dialog.style, {
        width: "min(420px, 100%)",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 20px 48px rgba(0,0,0,0.22)",
        padding: "22px"
      });

      const text = document.createElement("p");
      text.textContent = message || "Bạn muốn tiếp tục thao tác này?";
      Object.assign(text.style, {
        margin: "0 0 18px 0",
        color: "#2b2b2b",
        fontSize: "17px",
        fontWeight: "800",
        lineHeight: "1.45"
      });

      const actions = document.createElement("div");
      Object.assign(actions.style, {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        flexWrap: "wrap"
      });

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.textContent = options.cancelText || "Hủy";
      Object.assign(cancelButton.style, {
        border: "0",
        borderRadius: "8px",
        padding: "10px 16px",
        fontWeight: "900",
        cursor: "pointer",
        background: "#ececec",
        color: "#2b2b2b"
      });

      const confirmButton = document.createElement("button");
      confirmButton.type = "button";
      confirmButton.textContent = options.confirmText || "Xác nhận";
      Object.assign(confirmButton.style, {
        border: "0",
        borderRadius: "8px",
        padding: "10px 16px",
        fontWeight: "900",
        cursor: "pointer",
        background: "#d8262f",
        color: "#fff"
      });

      function close(answer) {
        document.removeEventListener("keydown", onKeyDown);
        overlay.remove();
        resolve(answer);
      }

      function onKeyDown(event) {
        if (event.key === "Escape") close(false);
      }

      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) close(false);
      });
      cancelButton.addEventListener("click", () => close(false));
      confirmButton.addEventListener("click", () => close(true));
      document.addEventListener("keydown", onKeyDown);

      actions.append(cancelButton, confirmButton);
      dialog.append(text, actions);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      confirmButton.focus();
    });
  }

  async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      ...options,
      headers
    });

    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
      if (response.status === 401) {
        location.replace("/admin/login.html");
      }
      const error = new Error(payload?.message || "Không thể kết nối với máy chủ.");
      error.status = response.status;
      throw error;
    }

    return payload;
  }

  global.BanhangApi = { request };
  global.BanhangUi = { toast, confirm: confirmAction };
})(window);
