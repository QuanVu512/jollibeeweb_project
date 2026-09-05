

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
