<?php 
require_once 'xuly_donhang.php'; 
if (!isset($_SESSION['TenDangNhap'])) { header("Location: ../login.php"); exit(); }
$res = $conn->query("SELECT dh.*, kh.TenKH, kh.SDT FROM DonHang dh JOIN KhachHang kh ON dh.MaKH = kh.MaKH WHERE dh.TrangThai = 0 ORDER BY dh.NgayDat ASC");
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Xác nhận đơn hàng</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Nunito', sans-serif; box-sizing: border-box; }
        body { 
            background-color: #fdf5e6; 
            background-image: url('data:image/svg+xml;utf8,<svg width="150" height="150" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="10" y="40" font-size="20" opacity="0.04">🍅</text><text x="60" y="90" font-size="20" opacity="0.04">🌶️</text><text x="80" y="20" font-size="20" opacity="0.04">🍗</text></svg>');
            margin: 0; padding: 0; 
        }
        header { background-color: #fff; padding: 15px; text-align: center; border-bottom: 4px solid #d8262f; position: relative; z-index: 10; }
        header img { height: 75px; }
        .nav-menu { background-color: #2b2b2b; padding: 12px; text-align: center; }
        .nav-menu a { color: white; text-decoration: none; margin: 0 20px; font-weight: 700; text-transform: uppercase; }
        .nav-menu a.active { color: #f3a22f; }
        .container { max-width: 900px; margin: 40px auto; position: relative; z-index: 10; }
        .decor { position: absolute; font-size: 60px; z-index: 1; pointer-events: none; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1)); }
        .decor-1 { top: -20px; left: -80px; transform: rotate(-15deg); }
        .order-card { background: #fff; border-radius: 15px; margin-bottom: 25px; padding: 25px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); position: relative; border-left: 6px solid #d8262f; }
        .btn { padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 800; text-transform: uppercase; transition: 0.2s; }
        .btn-red { background: #d8262f; color: white; box-shadow: 0 4px 0 #a81c23; }
        .btn-gray { background: #6e716e; color: white; box-shadow: 0 4px 0 #4a4d4a; margin-left: 8px; }
        .btn-outline { background: white; border: 2px solid #d8262f; color: #d8262f; margin-right: 10px; }
        .details { display: none; background: #fffaf5; padding: 20px; border-radius: 10px; border: 1px solid #ffe0e0; margin-top: 15px; }
    
    /* --- Đoạn code CSS mới --- */
header { display: flex; justify-content: center; align-items: center; position: relative; } /* Căn giữa logo và giữ vị trí cho avatar */
.user-menu { position: absolute; right: 30px; display: inline-block; }
.avatar-btn { background: #fff; border: 2px solid #d8262f; border-radius: 50px; padding: 5px 15px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 700; color: #d8262f; }
.avatar-btn img { width: 35px; height: 35px; border-radius: 50%; }
.dropdown-content { display: none; position: absolute; right: 0; background-color: white; min-width: 200px; box-shadow: 0px 8px 16px rgba(0,0,0,0.2); border-radius: 8px; overflow: hidden; border: 1px solid #eee; }
.dropdown-content a { color: #2b2b2b; padding: 12px 16px; text-decoration: none; display: block; font-size: 14px; text-align: left; border-bottom: 1px solid #eee; }
.dropdown-content a:hover { background-color: #fdf5e6; color: #d8262f; }
.user-menu:hover .dropdown-content { display: block; }
    </style>
</head>
<body>
<header><img src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/images/logo.png">
<div class="user-menu">
        <div class="avatar-btn">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="User">
            <span><?= $_SESSION['TenDangNhap'] ?></span>
        </div>
        <div class="dropdown-content">
            <a href="ho_so.php">👤 Sửa hồ sơ bản thân</a>
            <a href="doi_mat_khau.php">🔑 Đổi mật khẩu</a>
            <a href="../logout.php" style="color: #d8262f; border-bottom: none;">🚪 Đăng xuất</a>
        </div>
    </div>
</header>
<div class="nav-menu">
    <a href="tao_don_hang.php">Tạo đơn tại quầy</a>
    <a href="quan_ly_don_hang.php" class="active">Xác nhận đơn hàng</a>
    <a href="bep_che_bien.php">Bếp chế biến</a>
</div>
<div class="container">
    <h2 style="text-align: center; color: #d8262f; font-weight: 900; text-transform: uppercase;">CHỈNH SỬA HỒ SƠ</h2>
    
    <?php
    $user = $_SESSION['TenDangNhap'];
    // 1. Kiểm tra quyền để biết lấy dữ liệu từ bảng nào
    $acc = $conn->query("SELECT Quyen FROM TaiKhoan WHERE TenDangNhap = '$user'")->fetch_assoc();
    $quyen = $acc['Quyen'];

    // 2. Truy vấn dữ liệu tương ứng theo bảng
    if ($quyen == 'Khach') {
        $res = $conn->query("SELECT * FROM KhachHang WHERE TenDangNhap = '$user'");
        $data = $res->fetch_assoc();
        $ho_ten = $data['TenKH'] ?? '';
        $dia_chi = $data['DiaChi'] ?? '';
        // Bảng KhachHang của bạn không có các cột dưới đây nên để trống
        $ngay_sinh = ''; $gioi_tinh = ''; $email = ''; 
    } else {
        $res = $conn->query("SELECT * FROM NhanVien WHERE TenDangNhap = '$user'");
        $data = $res->fetch_assoc();
        $ho_ten = $data['TenNV'] ?? '';
        $dia_chi = $data['QueQuan'] ?? '';
        // Lấy dữ liệu từ bảng NhanVien (dòng 155-159 trong file .sql của bạn)
        $ngay_sinh = $data['NgaySinh'] ?? '';
        $gioi_tinh = $data['GioiTinh'] ?? '';
        $email = $data['Email'] ?? '';
    }
    $sdt = $data['SDT'] ?? '';
    ?>

    <div class="order-card">
        <form action="xuly_taikhoan.php" method="POST">
            <p>Tên đăng nhập: <b><?= $user ?></b> (Quyền: <?= $quyen ?>)</p>
            
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <label>Họ và Tên:</label>
                    <input type="text" name="ho_ten" value="<?= $ho_ten ?>" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-top:5px;">
                </div>
                <div style="flex: 1;">
                    <label>Email:</label>
                    <input type="email" name="email" value="<?= $email ?>" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-top:5px;">
                </div>
            </div>

            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <label>Ngày sinh:</label>
                    <input type="date" name="ngay_sinh" value="<?= $ngay_sinh ?>" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-top:5px;">
                </div>
                <div style="flex: 1;">
                    <label>Giới tính:</label>
                    <select name="gioi_tinh" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-top:5px;">
                        <option value="Nam" <?= ($gioi_tinh == 'Nam') ? 'selected' : '' ?>>Nam</option>
                        <option value="Nữ" <?= ($gioi_tinh == 'Nữ') ? 'selected' : '' ?>>Nữ</option>
                        <option value="Khác" <?= ($gioi_tinh == 'Khác') ? 'selected' : '' ?>>Khác</option>
                    </select>
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <label>Số điện thoại:</label>
                <input type="text" name="sdt" value="<?= $sdt ?>" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-top:5px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label>Địa chỉ / Quê quán:</label>
                <textarea name="dia_chi" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-top:5px; height:60px;"><?= $dia_chi ?></textarea>
            </div>

            <input type="hidden" name="quyen_user" value="<?= $quyen ?>">
            <button type="submit" name="btn_save_profile" class="btn btn-red">LƯU THÔNG TIN</button>
        </form>
    </div>
</div>
<script>
    function toggleDet(id) {
        var x = document.getElementById("det-" + id);
        x.style.display = (x.style.display === "none" || x.style.display === "") ? "block" : "none";
    }
</script>
</body>
</html>