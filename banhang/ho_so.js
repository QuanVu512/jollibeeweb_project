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

    loadProfile();
  }

  const profileForm = document.querySelector("#profile-form");
  const btnSave = document.querySelector("#btn-save");

  async function loadProfile() {
    try {
      const res = await window.BanhangApi.request("/profile");
      const emp = res.data.employee;

      document.querySelector("#fullName").value = emp.fullName || "";
      document.querySelector("#phone").value = emp.phone || "";
      document.querySelector("#hometown").value = emp.hometown || "";
      document.querySelector("#email").value = emp.email || "";
      document.querySelector("#gender").value = emp.gender || "";

      if (emp.birthDate) {
        // Format ISO Date (YYYY-MM-DDT00:00:00.000Z) to YYYY-MM-DD
        const d = new Date(emp.birthDate);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        document.querySelector("#birthDate").value = `${yyyy}-${mm}-${dd}`;
      }
    } catch (err) {
      alert("Lỗi khi tải thông tin hồ sơ: " + err.message);
    }
  }

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.querySelector("#fullName").value;
    const phone = document.querySelector("#phone").value;
    const hometown = document.querySelector("#hometown").value;
    const email = document.querySelector("#email").value;
    const birthDate = document.querySelector("#birthDate").value;
    const gender = document.querySelector("#gender").value;

    btnSave.disabled = true;
    btnSave.textContent = "Đang lưu thay đổi...";

    try {
      await window.BanhangApi.request("/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          phone,
          hometown,
          email,
          birthDate,
          gender
        })
      });

      alert("Cập nhật thông tin hồ sơ thành công!");
      location.reload();
    } catch (err) {
      alert("Lỗi cập nhật hồ sơ: " + err.message);
      btnSave.disabled = false;
      btnSave.textContent = "Lưu thay đổi";
    }
  });
});
