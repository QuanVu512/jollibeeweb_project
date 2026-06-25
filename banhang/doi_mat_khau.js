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

    // Phân quyền hiển thị thanh menu
    if (user.role === "kitchen") {
      const nav1 = document.querySelector("#nav-cashier-only-1");
      const nav2 = document.querySelector("#nav-cashier-only-2");
      if (nav1) nav1.remove();
      if (nav2) nav2.remove();
    } else if (user.role === "cashier") {
      const navKitchen = document.querySelector("#nav-kitchen-only");
      if (navKitchen) navKitchen.remove();
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
  }

  const passwordForm = document.querySelector("#password-form");
  const btnSubmit = document.querySelector("#btn-submit");

  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const oldPassword = document.querySelector("#oldPassword").value;
    const newPassword = document.querySelector("#newPassword").value;
    const confirmPassword = document.querySelector("#confirmPassword").value;

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu mới không khớp!");
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Đang cập nhật...";

    try {
      await window.BanhangApi.request("/password", {
        method: "PATCH",
        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      });

      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.");
      location.replace("/admin/login.html");
    } catch (err) {
      alert("Lỗi đổi mật khẩu: " + err.message);
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Cập nhật mật khẩu";
    }
  });
});
