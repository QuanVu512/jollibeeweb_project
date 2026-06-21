<?php 
require_once 'xuly_donhang.php'; 
if (!isset($_SESSION['TenDangNhap'])) { header("Location: ../login.php"); exit(); }

if (isset($_POST['add_to_cart'])) {
    $id = $_POST['ma_mon'];
    if (!isset($_SESSION['cart'][$id])) { $_SESSION['cart'][$id] = ['ten' => $_POST['ten_mon'], 'gia' => $_POST['gia'], 'sl' => 1]; } 
    else { $_SESSION['cart'][$id]['sl']++; }
}
if (isset($_POST['update_cart'])) {
    $id = $_POST['ma_mon']; $sl = intval($_POST['sl']);
    if ($sl > 0) $_SESSION['cart'][$id]['sl'] = $sl; else unset($_SESSION['cart'][$id]);
}
if (isset($_POST['remove'])) { unset($_SESSION['cart'][$_POST['ma_mon']]); }

$result_mon = $conn->query("SELECT * FROM MonAn WHERE TrangThai = 1 AND SoLuong > 0");
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Tạo đơn tại quầy</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Nunito', sans-serif; box-sizing: border-box; }
        body { background-color: #fdf5e6; background-image: url('data:image/svg+xml;utf8,<svg width="150" height="150" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="10" y="40" font-size="20" opacity="0.04">🍗</text><text x="70" y="80" font-size="20" opacity="0.04">🌶️</text></svg>'); margin: 0; padding: 0; }
        header { background-color: #fff; padding: 15px; text-align: center; border-bottom: 4px solid #d8262f; }
        header img { height: 75px; }
        .nav-menu { background-color: #2b2b2b; padding: 12px; text-align: center; }
        .nav-menu a { color: white; text-decoration: none; margin: 0 20px; font-weight: 700; text-transform: uppercase; }
        .nav-menu a.active { color: #f3a22f; }
        .main-container { display: flex; max-width: 1200px; margin: 30px auto; gap: 20px; padding: 0 20px; }
        .menu-side { flex: 2; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
        .food-card { background: #fff; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #eee; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
        .btn-add { background: #d8262f; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-weight: 900; margin-top: 10px; }
        .cart-side { flex: 1; background: #fff; padding: 25px; border-radius: 15px; border: 2px solid #ffefef; box-shadow: 0 10px 20px rgba(0,0,0,0.05); height: fit-content; }
        .btn-order { background: #28a745; color: white; width: 100%; padding: 15px; border: none; border-radius: 8px; font-weight: 900; cursor: pointer; margin-top: 20px; box-shadow: 0 4px 0 #1e7e34; }

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
    <a href="tao_don_hang.php" class="active">Tạo đơn tại quầy</a>
    <a href="quan_ly_don_hang.php">Xác nhận đơn hàng</a>
    <a href="bep_che_bien.php">Bếp chế biến</a>
</div>
<div class="main-container">
    <div class="menu-side">
        <?php while($m = $result_mon->fetch_assoc()): ?>
            <div class="food-card">
                <h4 style="margin: 0 0 10px 0; min-height: 45px; color: #2b2b2b;"><?= $m['TenMon'] ?></h4>
                <p style="color: #d8262f; font-weight: 900; font-size: 18px;"><?= number_format($m['Gia'], 0, ',', '.') ?>đ</p>
                <form method="POST">
                    <input type="hidden" name="ma_mon" value="<?= $m['MaMon'] ?>">
                    <input type="hidden" name="ten_mon" value="<?= $m['TenMon'] ?>">
                    <input type="hidden" name="gia" value="<?= $m['Gia'] ?>">
                    <button type="submit" name="add_to_cart" class="btn-add">THÊM +</button>
                </form>
            </div>
        <?php endwhile; ?>
    </div>
    <div class="cart-side">
        <h3 style="color: #d8262f; margin-top: 0;">🛒 Giỏ hàng quầy</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <?php $total = 0; if(!empty($_SESSION['cart'])): foreach($_SESSION['cart'] as $id => $item): $total += $item['gia'] * $item['sl']; ?>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><b><?= $item['ten'] ?></b></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><form method="POST"><input type="hidden" name="ma_mon" value="<?= $id ?>"><input type="number" name="sl" value="<?= $item['sl'] ?>" onchange="this.form.submit()" style="width:40px;"><input type="hidden" name="update_cart" value="1"></form></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;" align="right"><form method="POST"><input type="hidden" name="ma_mon" value="<?= $id ?>"><button type="submit" name="remove" style="background:none;border:none;color:red;cursor:pointer;">✕</button></form></td>
            </tr>
            <?php endforeach; endif; ?>
        </table>
        <h2 style="text-align: right; color: #d8262f; margin: 20px 0;"><?= number_format($total, 0, ',', '.') ?>đ</h2>
        <form action="xuly_donhang.php" method="POST">
            <p><b>Hình thức:</b></p>
            <select name="loai_don" style="width:100%; padding:10px; margin-bottom:10px; border-radius: 5px; border: 1px solid #ddd;">
                <option value="0">🍽️ Ăn tại chỗ (Phục vụ)</option>
                <option value="1">Mang về / Ship</option>
            </select>
            <input type="text" name="dia_chi" placeholder="Số bàn..." required style="width:100%; padding:10px; border: 1px solid #ddd; border-radius: 5px;">
            <button type="submit" name="action" value="create_order" class="btn-order">THANH TOÁN ➔</button>
        </form>
    </div>
</div>
</body>
</html>