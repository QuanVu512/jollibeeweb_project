<?php
session_start();

if (!isset($_SESSION['TenDangNhap']) || strtolower($_SESSION['Quyen']) !== 'admin') {
    header("Location: ../login.php");
    exit();
}

include '../includes/connect.php';
$message = ""; 

if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
    $id_xoa = mysqli_real_escape_string($conn, $_GET['id']);
    if ($id_xoa !== $_SESSION['TenDangNhap']) {
        $conn->query("UPDATE NhanVien SET TenDangNhap = NULL WHERE TenDangNhap = '$id_xoa'");
        
        if ($conn->query("DELETE FROM TaiKhoan WHERE TenDangNhap = '$id_xoa'")) {
            $message = "<div class='alert success'>Xóa tài khoản thành công</div>";
        }
    } else {
        $message = "<div class='alert error'>Bạn không thể tự xóa tài khoản của chính mình!</div>";
    }
}

if (isset($_POST['btn_cap_tk'])) {
    $manv = (int)$_POST['manv'];
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = md5(mysqli_real_escape_string($conn, $_POST['password']));
    $quyen = mysqli_real_escape_string($conn, $_POST['quyen']);

    $check_sql = "SELECT * FROM TaiKhoan WHERE TenDangNhap = '$username'";
    if ($conn->query($check_sql)->num_rows > 0) {
        $message = "<div class='alert error'>✖ Tên đăng nhập đã tồn tại!</div>";
    } else {
        $sql_tk = "INSERT INTO TaiKhoan (TenDangNhap, MatKhau, Quyen, TrangThai) VALUES ('$username', '$password', '$quyen', 1)";
        if ($conn->query($sql_tk)) {
            $conn->query("UPDATE NhanVien SET TenDangNhap = '$username' WHERE MaNV = $manv");
            $message = "<div class='alert success'>✔ Cấp tài khoản thành công!</div>";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Quản lý tài khoản</title>
    <link rel="icon" type="image/x-icon" href="https://jollibee.com.vn/media/favicon/default/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
         /* Sidebar Menu (Dùng chung style với các trang admin khác) */
        .sidebar { width: 250px; background: #2c3e50; color: white; height: 100vh; position: fixed; display: flex; flex-direction: column; }
        .sidebar h2 { text-align: center; padding: 20px; margin: 0; background: #e74c3c; font-weight: 800; letter-spacing: 1px; }
        .sidebar a { padding: 15px 25px; color: #ecf0f1; text-decoration: none; display: block; font-weight: 600; transition: 0.3s; border-left: 4px solid transparent; }
        .sidebar a:hover, .sidebar a.active { background: #34495e; border-left: 4px solid #e74c3c; color: #fff; }
        
        /* Main Content */
        .main-content { margin-left: 250px; padding: 30px; }
        .header-top { display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 30px; }
        .user-info { font-weight: bold; color: #333; }
        .logout-btn { color: #e74c3c; text-decoration: none; font-weight: bold; border: 1px solid #e74c3c; padding: 5px 15px; border-radius: 5px; transition: 0.3s; }
        .logout-btn:hover { background: #e74c3c; color: white; }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Open Sans', sans-serif; }
        body { background-color: #f0f2f5; color: #333; }
        .top-navbar { background-color: #ffffff; height: 70px; padding: 0 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 1000; }
        .top-navbar .logo img { height: 45px; }
        .top-navbar .user-action { display: flex; align-items: center; gap: 20px; font-weight: 600; }
        .user-name { color: #e21b22; text-decoration: none; border-bottom: 2px dashed #e21b22; padding-bottom: 2px;}
        .btn-logout { background: #e21b22; color: #fff; padding: 8px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; transition: 0.3s;}
        .btn-logout:hover { background: #b71116; }
        .main-container { max-width: 1200px; margin: 40px auto; padding: 0 20px; display: grid; grid-template-columns: 350px 1fr; gap: 30px; align-items: start; }
        .card { background: #ffffff; padding: 25px 30px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); border-top: 4px solid #e21b22; }
        .card-logo { text-align: center; margin-bottom: 10px; }
        .card-logo img { height: 60px; }
        .card-title { color: #333; font-size: 18px; font-weight: 700; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eaeaea; text-transform: uppercase; text-align: center; }
        .form-group { margin-bottom: 18px; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 13px; color: #555; }
        .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px; background: #fafafa; }
        .form-group input:focus, .form-group select:focus { border-color: #e21b22; background: #fff; outline: none; }
        .btn-submit { width: 100%; background: #e21b22; color: white; border: none; padding: 14px; font-size: 15px; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 10px; }
        .btn-submit:hover { background: #b71116; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table th, table td { padding: 15px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        table th { background-color: #f8f9fa; font-weight: 700; color: #444; border-bottom: 2px solid #ddd; }
        table tr:hover { background-color: #fff9f9; }
        .badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; display: inline-block;}
        .badge-admin { background: #212529; }
        .badge-thungan { background: #0d6efd; }
        .badge-bep { background: #fd7e14; }
        .badge-shipper { background: #198754; }
        .btn-delete { color: #dc3545; text-decoration: none; font-weight: 600; font-size: 13px;}
        .btn-delete:hover { color: #a71d2a; text-decoration: underline; }
        .alert { padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: 600; font-size: 14px; text-align: center; }
        .success { background: #d1e7dd; color: #0f5132; border-left: 5px solid #198754; }
        .error { background: #f8d7da; color: #842029; border-left: 5px solid #dc3545; }
    </style>
</head>
<body>
<div class="sidebar">
    <h2>JOLLIBEE ADMIN</h2>
    <a href="index.php" class="active">Quản lý Tài khoản</a>
    <a href="staff.php">Hồ sơ Nhân viên</a>
    <a href="report.php">Báo cáo Thống kê</a> 
</div>
<div class="top-navbar">
    <div class="logo">
        <a href="index.php"><img src="https://jollibee.com.vn/static/version1775056506/frontend/Jollibee/default/vi_VN/images/logo.png" alt="Logo"></a>
    </div>
    <div class="user-action">
        <span>Chào, Admin <a href="staff.php" class="user-name"><?php echo $_SESSION['TenHienThi']; ?></a></span>
        <a href="../logout.php" class="btn-logout">Đăng xuất</a>
    </div>
</div>

<div class="main-container">
    <div class="card form-section">
        <div class="card-logo">
            <img src="https://jollibee.com.vn/static/version1775056506/frontend/Jollibee/default/vi_VN/images/logo.png" alt="Mascot">
        </div>
        <h2 class="card-title">CẤP TÀI KHOẢN</h2>
        <?php echo $message; ?>
        <form action="" method="POST">
            
            <div class="form-group">
                <label>Chọn nhân viên cần cấp tài khoản</label>
                <select name="manv" required>
                    <option value="">-- Chọn nhân viên --</option>
                    <?php
                    $sql_nv_free = "SELECT MaNV, TenNV FROM NhanVien WHERE TenDangNhap IS NULL OR TenDangNhap = ''";
                    $res_nv_free = $conn->query($sql_nv_free);
                    if ($res_nv_free->num_rows > 0) {
                        while ($nv = $res_nv_free->fetch_assoc()) {
                            echo "<option value='" . $nv['MaNV'] . "'>NV" . $nv['MaNV'] . " - " . $nv['TenNV'] . "</option>";
                        }
                    } else {
                        echo "<option value='' disabled>Tất cả nhân viên đã có tài khoản</option>";
                    }
                    ?>
                </select>
            </div>

            <div class="form-group">
                <label>Tên đăng nhập</label>
                <input type="text" name="username" required placeholder="Nhập tên đăng nhập">
            </div>
            <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" name="password" required placeholder="Nhập mật khẩu">
            </div>
            <div class="form-group">
                <label>Vai trò</label>
                <select name="quyen">
                    <option value="ThuNgan">Thu ngân</option>
                    <option value="Bep">Nhân viên bếp</option>
                    <option value="Shipper">Nhân viên giao hàng</option>
                    <option value="Admin">Quản trị viên</option>
                </select>
            </div>
            <button type="submit" name="btn_cap_tk" class="btn-submit">Cấp tài khoản</button>
        </form>
    </div>

    <div class="card table-section">
        <div class="card-logo">
            <img src="https://jollibee.com.vn/static/version1775056506/frontend/Jollibee/default/vi_VN/images/logo.png" alt="Mascot">
        </div>
        <h2 class="card-title">Tài Khoản Hệ Thống</h2>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Tài khoản</th>
                        <th>Tên nhân viên</th>
                        <th>Vai trò</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $sql_list = "SELECT t.TenDangNhap, t.Quyen, n.TenNV 
                                 FROM TaiKhoan t 
                                 LEFT JOIN NhanVien n ON t.TenDangNhap = n.TenDangNhap 
                                 WHERE t.Quyen != 'Khach'
                                 ORDER BY FIELD(t.Quyen, 'Admin', 'ThuNgan', 'Bep', 'Shipper')";
                    $result_list = $conn->query($sql_list);

                    if ($result_list->num_rows > 0) {
                        while ($row = $result_list->fetch_assoc()) {
                            $badge_class = 'badge-admin';
                            $quyen_lower = strtolower($row['Quyen']);
                            if($quyen_lower == 'thungan') $badge_class = 'badge-thungan';
                            if($quyen_lower == 'bep') $badge_class = 'badge-bep';
                            if($quyen_lower == 'shipper') $badge_class = 'badge-shipper';

                            echo "<tr>";
                            echo "<td><strong>" . htmlspecialchars($row['TenDangNhap']) . "</strong></td>";
                            echo "<td>" . htmlspecialchars($row['TenNV'] ?? 'Chưa liên kết') . "</td>";
                            echo "<td><span class='badge {$badge_class}'>" . htmlspecialchars($row['Quyen']) . "</span></td>";
                            echo "<td>
                                    <a href='index.php?action=delete&id=" . $row['TenDangNhap'] . "' class='btn-delete' onclick=\"return confirm('Thu hồi tài khoản này? (Hồ sơ nhân viên vẫn sẽ được giữ lại)');\">Thu hồi</a>
                                  </td>";
                            echo "</tr>";
                        }
                    } else {
                        echo "<tr><td colspan='4' style='text-align:center;'>Chưa có dữ liệu.</td></tr>";
                    }
                    ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

</body>
</html>