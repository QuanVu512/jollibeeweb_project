<?php 
require_once 'xuly_donhang.php'; 
if (!isset($_SESSION['TenDangNhap'])) { header("Location: ../login.php"); exit(); }

// Lấy danh sách đơn đang chế biến (TrangThai = 1)
function layDonHang($conn, $loai) {
    return $conn->query("SELECT dh.*, kh.TenKH FROM DonHang dh JOIN KhachHang kh ON dh.MaKH = kh.MaKH 
                         WHERE dh.TrangThai = 1 AND dh.LoaiDon = $loai ORDER BY dh.NgayDat ASC");
}

$don_tai_cho = layDonHang($conn, 0);
$don_ship = layDonHang($conn, 1);
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Khu vực bếp Jollibee</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Nunito', sans-serif; box-sizing: border-box; }
        body { 
            background-color: #fff9e6; 
            background-image: url('data:image/svg+xml;utf8,<svg width="150" height="150" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="10" y="40" font-size="20" opacity="0.04">🍗</text><text x="70" y="80" font-size="20" opacity="0.04">🌶️</text></svg>');
            margin: 0; padding: 0; 
        }
        header { background-color: #fff; padding: 15px; text-align: center; border-bottom: 4px solid #d8262f; }
        header img { height: 75px; }
        .nav-menu { background-color: #2b2b2b; padding: 12px; text-align: center; }
        .nav-menu a { color: white; text-decoration: none; margin: 0 20px; font-weight: 700; text-transform: uppercase; }
        .nav-menu a.active { color: #f3a22f; }
        
        .kitchen-container { display: flex; gap: 20px; padding: 20px; max-width: 1400px; margin: 0 auto; }
        .column { flex: 1; background: rgba(255,255,255,0.5); border-radius: 15px; padding: 15px; border: 2px dashed #f3a22f; }
        .column-title { text-align: center; color: #d8262f; text-transform: uppercase; font-weight: 900; font-size: 24px; margin-bottom: 20px; }
        
        .ticket { background: #fff; border-top: 8px solid #f3a22f; border-radius: 12px; padding: 20px; box-shadow: 6px 6px 0px rgba(0,0,0,0.8); margin-bottom: 20px; }
        .qty { background: #d8262f; color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 10px; font-weight: 900; }
        .btn-action { color: white; border: none; padding: 15px; width: 100%; border-radius: 8px; cursor: pointer; font-weight: 900; margin-top: 15px; text-transform: uppercase; }
    
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
    <a href="quan_ly_don_hang.php">Xác nhận đơn hàng</a>
    <a href="bep_che_bien.php" class="active">Bếp chế biến</a>
</div>

<div class="kitchen-container">
    <div class="column">
        <h2 class="column-title">🍽️ Ăn tại chỗ</h2>
        <?php while($row = $don_tai_cho->fetch_assoc()): ?>
            <div class="ticket">
                <h3 style="margin:0; color:#d8262f;">Đơn #<?= $row['MaDH'] ?></h3>
                <p>Khách: <b><?= $row['TenKH'] ?></b> | Bàn: <?= $row['DiaChiGiao'] ?></p>
                <hr>
                <ul style="list-style:none; padding:0;">
                    <?php
                    $id = $row['MaDH'];
                    $ct = $conn->query("SELECT ct.*, m.TenMon FROM ChiTietDonHang ct JOIN MonAn m ON ct.MaMon = m.MaMon WHERE ct.MaDH = $id");
                    while($i = $ct->fetch_assoc()): ?>
                        <li style="padding:8px 0; border-bottom:1px solid #eee;">
                            <span class="qty"><?= $i['SoLuongMua'] ?></span> <b><?= $i['TenMon'] ?></b>
                        </li>
                    <?php endwhile; ?>
                </ul>
                <form action="xuly_donhang.php" method="POST">
                    <input type="hidden" name="ma_dh" value="<?= $row['MaDH'] ?>">
                    <button type="submit" name="action" value="serve" class="btn-action" style="background:#007bff; box-shadow: 0 4px 0 #0056b3;">🍽️ PHỤC VỤ XONG</button>
                </form>
            </div>
        <?php endwhile; ?>
    </div>

    <div class="column">
        <h2 class="column-title">🛵 Giao hàng / Ship</h2>
        <?php while($row = $don_ship->fetch_assoc()): ?>
            <div class="ticket">
                <h3 style="margin:0; color:#d8262f;">Đơn #<?= $row['MaDH'] ?></h3>
                <p>Khách: <b><?= $row['TenKH'] ?></b> | Đ/C: <?= $row['DiaChiGiao'] ?></p>
                <hr>
                <ul style="list-style:none; padding:0;">
                    <?php
                    $id = $row['MaDH'];
                    $ct = $conn->query("SELECT ct.*, m.TenMon FROM ChiTietDonHang ct JOIN MonAn m ON ct.MaMon = m.MaMon WHERE ct.MaDH = $id");
                    while($i = $ct->fetch_assoc()): ?>
                        <li style="padding:8px 0; border-bottom:1px solid #eee;">
                            <span class="qty"><?= $i['SoLuongMua'] ?></span> <b><?= $i['TenMon'] ?></b>
                        </li>
                    <?php endwhile; ?>
                </ul>
                <form action="xuly_donhang.php" method="POST">
                    <input type="hidden" name="ma_dh" value="<?= $row['MaDH'] ?>">
                    <button type="submit" name="action" value="done" class="btn-action" style="background:#28a745; box-shadow: 0 4px 0 #1e7e34;">✓ GỌI SHIPPER</button>
                </form>
            </div>
        <?php endwhile; ?>
    </div>
</div>
</body>
</html>