<?php
session_start();

if (!isset($_SESSION['TenDangNhap']) || strtolower($_SESSION['Quyen']) !== 'admin') {
    header("Location: ../login.php");
    exit();
}

include '../includes/connect.php';
$message = ""; 

if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
    $id_xoa = (int)$_GET['id'];
    
    $check_admin = $conn->query("SELECT TenDangNhap FROM NhanVien WHERE MaNV = $id_xoa")->fetch_assoc();
    if ($check_admin && $check_admin['TenDangNhap'] === $_SESSION['TenDangNhap']) {
        $message = "<div class='alert error'>Không thể tự xóa hồ sơ của chính mình!</div>";
    } else {
        if ($check_admin['TenDangNhap'] != NULL) {
            $conn->query("DELETE FROM TaiKhoan WHERE TenDangNhap = '" . $check_admin['TenDangNhap'] . "'");
        }
        if ($conn->query("DELETE FROM NhanVien WHERE MaNV = $id_xoa")) {
            $message = "<div class='alert success'>Xóa nhân viên thành công</div>";
        }
    }
}

if (isset($_POST['btn_them'])) {
    $tennv = mysqli_real_escape_string($conn, $_POST['tennv']);
    $sdt = mysqli_real_escape_string($conn, $_POST['sdt']);
    $ngaysinh = mysqli_real_escape_string($conn, $_POST['ngaysinh']);
    $gioitinh = mysqli_real_escape_string($conn, $_POST['gioitinh']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $quequan = mysqli_real_escape_string($conn, $_POST['quequan']);

    $sql_nhan_vien = "INSERT INTO NhanVien (TenNV, SDT, NgaySinh, GioiTinh, Email, QueQuan) 
                      VALUES ('$tennv', '$sdt', '$ngaysinh', '$gioitinh', '$email', '$quequan')";
    if ($conn->query($sql_nhan_vien)) {
        $message = "<div class='alert success'>✔ Thêm hồ sơ nhân viên thành công! (Hãy sang Quản lý tài khoản để cấp quyền)</div>";
    } else {
        $message = "<div class='alert error'>✖ Lỗi thêm dữ liệu!</div>";
    }
}

if (isset($_POST['btn_capnhat'])) {
    $manv = (int)$_POST['manv'];
    $tennv = mysqli_real_escape_string($conn, $_POST['tennv']);
    $sdt = mysqli_real_escape_string($conn, $_POST['sdt']);
    $ngaysinh = mysqli_real_escape_string($conn, $_POST['ngaysinh']);
    $gioitinh = mysqli_real_escape_string($conn, $_POST['gioitinh']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $quequan = mysqli_real_escape_string($conn, $_POST['quequan']);

    $sql_update_nv = "UPDATE NhanVien SET TenNV='$tennv', SDT='$sdt', NgaySinh='$ngaysinh', GioiTinh='$gioitinh', Email='$email', QueQuan='$quequan' WHERE MaNV=$manv";
    if ($conn->query($sql_update_nv)) {
        $message = "<div class='alert success'>✔ Cập nhật hồ sơ thành công!</div>";
    } else {
        $message = "<div class='alert error'>✖ Lỗi cập nhật dữ liệu!</div>";
    }
}

$is_edit = false;
$edit_data = [];
if (isset($_GET['edit'])) {
    $is_edit = true;
    $edit_id = (int)$_GET['edit'];
    $result_get = $conn->query("SELECT * FROM NhanVien WHERE MaNV = $edit_id");
    if ($result_get->num_rows > 0) {
        $edit_data = $result_get->fetch_assoc();
    }
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Quản lý nhân sự</title>
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
        .main-container { max-width: 1300px; margin: 40px auto; padding: 0 20px; display: grid; grid-template-columns: 350px 1fr; gap: 30px; align-items: start; }
        .card { background: #ffffff; padding: 25px 30px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); border-top: 4px solid #e21b22; }
        .card-logo { text-align: center; margin-bottom: 10px; }
        .card-logo img { height: 60px; }
        .card-title { color: #333; font-size: 18px; font-weight: 700; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eaeaea; text-transform: uppercase; text-align: center; }
        .form-row { display: flex; gap: 15px; }
        .form-col { flex: 1; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 5px; font-size: 13px; color: #555; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px; background: #fafafa; }
        .form-group input:focus, .form-group select:focus { border-color: #e21b22; background: #fff; outline: none; }
        .btn-submit { width: 100%; background: #e21b22; color: white; border: none; padding: 14px; font-size: 15px; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 10px; }
        .btn-submit:hover { background: #b71116; }
        .btn-cancel { width: 100%; background: #6c757d; color: white; border: none; padding: 10px; font-size: 14px; font-weight: bold; border-radius: 8px; text-decoration: none; display: block; text-align: center; margin-top: 10px; }
        .table-responsive { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table th, table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        table th { background-color: #f8f9fa; font-weight: 700; color: #444; border-bottom: 2px solid #ddd; }
        table tr:hover { background-color: #fff9f9; }
        .badge-none { background: #6c757d; padding: 5px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; color: white; }
        .badge-ok { background: #198754; padding: 5px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; color: white; }
        .action-links a { font-weight: 600; font-size: 13px; text-decoration: none; margin-right: 10px; }
        .btn-edit { color: #0d6efd; }
        .btn-delete { color: #dc3545; }
        .alert { padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: 600; font-size: 14px; text-align: center; }
        .success { background: #d1e7dd; color: #0f5132; border-left: 5px solid #198754; }
        .error { background: #f8d7da; color: #842029; border-left: 5px solid #dc3545; }
    </style>
</head>
<body>
<div class="sidebar">
    <h2>JOLLIBEE ADMIN</h2>
    <a href="index.php">Quản lý Tài khoản</a>
    <a href="staff.php" class="active">Hồ sơ Nhân viên</a> 
    <a href="report.php">Báo cáo Thống kê</a> 
</div>
<div class="top-navbar">
    <div class="logo">
        <a href="index.php"><img src="https://jollibee.com.vn/static/version1775056506/frontend/Jollibee/default/vi_VN/images/logo.png" alt="Logo"></a>
    </div>
    <div class="user-action">
        <span>Chào, Admin <span class="user-name"><?php echo $_SESSION['TenHienThi']; ?></span></span>
        <a href="../logout.php" class="btn-logout">Đăng xuất</a>
    </div>
</div>

<div class="main-container">
    
    <div class="card form-section">
        <div class="card-logo">
            <img src="https://jollibee.com.vn/static/version1775056506/frontend/Jollibee/default/vi_VN/images/logo.png" alt="Mascot">
        </div>
        <h2 class="card-title"><?php echo $is_edit ? 'Sửa Hồ Sơ' : 'Thêm Nhân Viên'; ?></h2>
        <?php echo $message; ?>
        
        <form action="staff.php" method="POST">
            <?php if ($is_edit): ?>
                <input type="hidden" name="manv" value="<?php echo $edit_data['MaNV']; ?>">
            <?php endif; ?>

            <div class="form-group">
                <label>Họ và tên nhân viên</label>
                <input type="text" name="tennv" value="<?php echo $is_edit ? htmlspecialchars($edit_data['TenNV']) : ''; ?>" required placeholder="Nhập họ tên của nhân viên">
            </div>

            <div class="form-row">
                <div class="form-col form-group">
                    <label>Giới tính</label>
                    <select name="gioitinh">
                        <option value="Nam" <?php echo ($is_edit && isset($edit_data['GioiTinh']) && $edit_data['GioiTinh'] == 'Nam') ? 'selected' : ''; ?>>Nam</option>
                        <option value="Nữ" <?php echo ($is_edit && isset($edit_data['GioiTinh']) && $edit_data['GioiTinh'] == 'Nữ') ? 'selected' : ''; ?>>Nữ</option>
                    </select>
                </div>
                <div class="form-col form-group">
                    <label>Ngày sinh</label>
                    <input type="date" name="ngaysinh" value="<?php echo $is_edit && isset($edit_data['NgaySinh']) ? $edit_data['NgaySinh'] : ''; ?>">
                </div>
            </div>

            <div class="form-row">
                <div class="form-col form-group">
                    <label>Số điện thoại</label>
                    <input type="text" name="sdt" value="<?php echo $is_edit ? htmlspecialchars($edit_data['SDT']) : ''; ?>" placeholder="Nhập SDT">
                </div>
                <div class="form-col form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="<?php echo $is_edit && isset($edit_data['Email']) ? htmlspecialchars($edit_data['Email']) : ''; ?>" placeholder="Nhập mail">
                </div>
            </div>

            <div class="form-group">
                <label>Quê quán</label>
                <input type="text" name="quequan" value="<?php echo $is_edit && isset($edit_data['QueQuan']) ? htmlspecialchars($edit_data['QueQuan']) : ''; ?>" placeholder="Nhập quê quán">
            </div>

            <?php if ($is_edit): ?>
                <button type="submit" name="btn_capnhat" class="btn-submit">Lưu Cập Nhật</button>
                <a href="staff.php" class="btn-cancel">Hủy Chỉnh Sửa</a>
            <?php else: ?>
                <button type="submit" name="btn_them" class="btn-submit">Lưu Hồ Sơ</button>
            <?php endif; ?>
        </form>
    </div>

    <div class="card table-section">
        <div class="card-logo">
            <img src="https://jollibee.com.vn/static/version1775056506/frontend/Jollibee/default/vi_VN/images/logo.png" alt="Mascot">
        </div>
        <h2 class="card-title">Danh Sách Nhân Sự</h2>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Mã NV</th>
                        <th>Họ tên</th>
                        <th>Giới tính</th>
                        <th>SDT</th>
                        <th>Tên tài khoản</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $result_list = $conn->query("SELECT * FROM NhanVien ORDER BY MaNV DESC");
                    if ($result_list->num_rows > 0) {
                        while ($row = $result_list->fetch_assoc()) {
                            echo "<tr>";
                            echo "<td><strong>NV" . $row['MaNV'] . "</strong></td>";
                            echo "<td>" . htmlspecialchars($row['TenNV']) . "</td>";
                            echo "<td>" . htmlspecialchars($row['GioiTinh'] ?? '') . "</td>";
                            echo "<td>" . htmlspecialchars($row['SDT']) . "</td>";
                            
                            if (empty($row['TenDangNhap'])) {
                                echo "<td><span class='badge-none'>Chưa cấp tài khoản</span></td>";
                            } else {
                                echo "<td><span class='badge-ok'>" . htmlspecialchars($row['TenDangNhap']) . "</span></td>";
                            }

                            echo "<td class='action-links'>
                                    <a href='staff.php?edit=" . $row['MaNV'] . "' class='btn-edit'>Sửa</a>
                                    <a href='staff.php?action=delete&id=" . $row['MaNV'] . "' class='btn-delete' onclick=\"return confirm('Xóa hồ sơ nhân viên này?');\">Xóa</a>
                                  </td>";
                            echo "</tr>";
                        }
                    } else {
                        echo "<tr><td colspan='6' style='text-align:center;'>Chưa có dữ liệu.</td></tr>";
                    }
                    ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

</body>
</html>