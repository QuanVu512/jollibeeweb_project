(function exposeApi(global) {
  const API_BASE = "/api/v1/banhang";

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
})(window);
