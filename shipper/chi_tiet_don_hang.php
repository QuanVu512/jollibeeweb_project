<?php
require '../includes/connect.php';
session_start();

$madh = $_GET['madh'] ?? 0;

if($madh == 0){
    die("❌ Thiếu mã đơn hàng");
}   

$sql = "SELECT dh.*, kh.TenKH, kh.SDT 
        FROM DonHang dh
        JOIN KhachHang kh ON dh.MaKH = kh.MaKH
        WHERE dh.MaDH = $madh";

$order = $conn->query($sql)->fetch_assoc();

$items = $conn->query("
    SELECT ct.*, m.TenMon 
    FROM ChiTietDonHang ct
    JOIN MonAn m ON ct.MaMon = m.MaMon
    WHERE ct.MaDH = $madh
");
?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Chi tiết đơn</title>

<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet">

<style>
* { font-family: 'Nunito', sans-serif; box-sizing: border-box; }

body {
    background:#fdf5e6;
    margin:0;
}

/* HEADER giống shipper */
.header-jollibee {
    background: #e31837;
    height: 80px;
    display: flex;
    align-items: center;
    padding: 0 30px;
    position: relative;
}
.header-jollibee::after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    width: 220px;
    height: 100%;
    background: #f3c623;
    border-bottom-left-radius: 80px;
}
.logo {
    display: flex;
    align-items: center;
    color: white;
    font-weight: bold;
    font-size: 22px;
    z-index: 2;
}
.logo img {
    height: 50px;
    margin-right: 10px;
}

/* CONTAINER */
.container {
    max-width:900px;
    margin:30px auto;
}

/* CARD */
.card {
    background:white;
    border-radius:12px;
    padding:20px;
    margin:20px 15px;
    box-shadow:0 8px 15px rgba(0,0,0,0.08);
    border-left:6px solid #d8262f;
}

/* TITLE */
.title {
    text-align:center;
    color:#d8262f;
    font-size:26px;
    font-weight:900;
}

/* INFO */
.info p {
    margin:8px 0;
    font-size:16px;
}

/* FOOD ITEM */
.item {
    display:flex;
    justify-content:space-between;
    padding:10px 0;
    border-bottom:1px dashed #ddd;
}

/* TOTAL */
.total {
    text-align:right;
    font-weight:bold;
    font-size:18px;
    color:#28a745;
}

/* BUTTON */
.btn {
    padding:10px 18px;
    border-radius:6px;
    text-decoration:none;
    color:white;
    font-weight:bold;
    background:#d8262f;
}
.btn:hover { opacity:0.85 }
</style>

</head>

<body>

<!-- HEADER -->
<div class="header-jollibee">
    <div class="logo">
        <img src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/images/logo.png">
        <span>Jollibee</span>
    </div>
</div>

<div class="container">

<!-- THÔNG TIN -->
<div class="card">
    <div class="title">🧾 Đơn #<?= $order['MaDH'] ?></div>

    <div class="info">
        <p>👤 <?= $order['TenKH'] ?></p>
        <p>📞 <?= $order['SDT'] ?></p>
        <p>📍 <?= $order['DiaChiGiao'] ?></p>
        <p>⏱ <?= $order['NgayDat'] ?></p>
        <p style="color:#28a745;font-weight:bold">
            💰 <?= number_format($order['TongTien']) ?>đ
        </p>
    </div>
</div>

<!-- DANH SÁCH MÓN -->
<div class="card">
    <h3>🍔 Danh sách món</h3>

    <?php $tong = 0; ?>
    <?php while($item = $items->fetch_assoc()) { 
        $thanhtien = $item['SoLuongMua'] * $item['GiaMua'];
        $tong += $thanhtien;
    ?>
    <div class="item">
        <div>
            <?= $item['TenMon'] ?> x<?= $item['SoLuongMua'] ?>
        </div>
        <div>
            <?= number_format($thanhtien) ?>đ
        </div>
    </div>
    <?php } ?>

    <div class="total">
        Tổng: <?= number_format($tong) ?>đ
    </div>
</div>

<!-- BUTTON -->
<div style="text-align:center">
    <a href="shipper.php" class="btn">⬅ Quay lại</a>
</div>

</div>

</body>
</html>