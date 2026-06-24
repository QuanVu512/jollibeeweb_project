<?php 
session_start();
require '../includes/connect.php';
$quyen = strtolower($_SESSION['Quyen'] ?? '');
if (!isset($_SESSION['TenDangNhap']) || ($quyen !== 'shipper' && $quyen !== 'admin')) {
    header("Location: ../login.php");
    exit();
}
$newOrders = $conn->query("
    SELECT dh.*, kh.TenKH, kh.SDT 
    FROM DonHang dh
    JOIN KhachHang kh ON dh.MaKH = kh.MaKH
    WHERE dh.TrangThai = 2
");

$shipping = $conn->query("
    SELECT dh.*, kh.TenKH, kh.SDT 
    FROM DonHang dh
    JOIN KhachHang kh ON dh.MaKH = kh.MaKH
    WHERE dh.TrangThai = 3
");

$history = $conn->query("
    SELECT dh.*, kh.TenKH 
    FROM DonHang dh
    JOIN KhachHang kh ON dh.MaKH = kh.MaKH
    WHERE dh.TrangThai IN (4,5)
");
?>

<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Giao hàng</title>
    <link rel="icon" type="image/x-icon" href="https://jollibee.com.vn/media/favicon/default/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet">

    <style>
    * {
        font-family: 'Nunito', sans-serif;
        box-sizing: border-box;
    }

    body {
        background-color: #fdf5e6;
        margin: 0;

        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><text x='10' y='40' font-size='20' opacity='0.08'>🍅</text><text x='80' y='20' font-size='20' opacity='0.08'>🍗</text><text x='60' y='100' font-size='20' opacity='0.08'>🌶️</text></svg>");
    }

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

    .nav-menu {
        background: #2b2b2b;
        text-align: center;
        padding: 12px;
    }

    .nav-menu a {
        cursor: pointer;
        color: white;
        text-decoration: none;
        margin: 0 20px;
        font-weight: bold;
    }

    .nav-menu a.active {
        color: #f3a22f;
    }

    .nav-menu a:hover {
        color: #f3a22f
    }

    .container {
        max-width: 900px;
        margin: 30px auto;
    }

    .title {
        text-align: center;
        color: #d8262f;
        font-size: 28px;
        font-weight: 900;
        margin: 20px 0;
        margin-top: 30px;

    }

    .card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin: 20px 15px;
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
        border-left: 6px solid #d8262f;
    }

    .card:hover {
        transform: translateY(-3px);
        transition: 0.2s;
    }

    .card.new {
        border-left: 6px solid #f3c623;
        /* vàng */
    }

    .card.shipping {
        border-left: 6px solid #28a745;
        /* xanh */
    }

    .card.history {
        border-left: 6px solid #999;
        opacity: 0.7;
    }

    .btn {
        padding: 10px 18px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        text-decoration: none;
        color: white;
        margin-right: 10px;
    }

    .btn:hover {
        opacity: 0.85;
    }

    .accept {
        background: #28a745
    }

    .reject {
        background: #6c757d
    }

    .done {
        background: #28a745
    }

    .fail {
        background: #dc3545;
    }

    .badge {
        background: #d8262f;
        color: white;
        padding: 5px 12px;
        border-radius: 20px;
        font-weight: bold;
        co
    }
    </style>
</head>

<body>

    <div class="header-jollibee">
        <div class="logo">
            <img src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/images/logo.png">
            <span>Jollibee</span>
        </div>
    </div>

    <div class="nav-menu">
        <a onclick="showTab('new')" id="tab-new">📦 Đơn mới</a>
        <a onclick="showTab('shipping')" id="tab-shipping">🚚 Đang giao</a>
        <a onclick="showTab('history')" id="tab-history">📜 Lịch sử</a>
    </div>

    <div class="container">

        <div id="content-new" class="tab-content">

            <h2 class="title">
                📦 Đơn mới
                <span class="badge"><?= $newOrders->num_rows ?></span>
            </h2>

            <?php while($row = $newOrders->fetch_assoc()) { ?>
            <div class="card new">
                <b>Đơn #<?= $row['MaDH'] ?></b><br>
                👤 <?= $row['TenKH'] ?><br>
                📞 <?= $row['SDT'] ?><br>
                📍 <?= $row['DiaChiGiao'] ?><br><br>
                💰 <?= number_format($row['TongTien']) ?>đ <br>
                ⏱ <?= $row['NgayDat'] ?><br><br>

                <a class="btn accept" href="nhan_don.php?madh=<?= $row['MaDH'] ?>">Nhận</a>
                <a class="btn reject" href="huy_don.php?madh=<?= $row['MaDH'] ?>">Hủy</a>
                <a class="btn" style="background:#007bff" href="chi_tiet_don_hang.php?madh=<?= $row['MaDH'] ?>">
                    Xem chi tiết
                </a>
            </div>
            <?php } ?>

        </div>

        <div id="content-shipping" class="tab-content" style="display:none">

            <h2 class="title">🚚 Đang giao</h2>

            <?php while($ship = $shipping->fetch_assoc()) { ?>
            <div class="card shipping">
                <b>Đơn #<?= $ship['MaDH'] ?></b><br>
                👤 <?= $ship['TenKH'] ?><br>
                📍 <?= $ship['DiaChiGiao'] ?><br><br>
                💰 <?= number_format($ship['TongTien']) ?>đ <br>
                ⏱ <?= $ship['NgayDat'] ?><br><br>

                <a class="btn done" href="hoan_thanh.php?madh=<?= $ship['MaDH'] ?>">
                    Đã giao
                </a>
                <a class="btn fail" href="that_bai.php?madh=<?= $ship['MaDH'] ?>">
                    Thất bại
                </a>
                <a class="btn" style="background:#007bff" href="chi_tiet_don_hang.php?madh=<?= $ship['MaDH'] ?>">
                    Xem chi tiết
                </a>
            </div>
            <?php } ?>

        </div>

        <div id="content-history" class="tab-content" style="display:none">

            <h2 class="title">📜 Lịch sử</h2>

            <?php while($his = $history->fetch_assoc()) { ?>
            <div class="card history">
                <b>Đơn #<?= $his['MaDH'] ?></b><br>
                👤 <?= $his['TenKH'] ?><br>
                📍 <?= $his['DiaChiGiao'] ?><br>
                💰 <?= number_format($his['TongTien']) ?>đ <br>
                ⏱ <?= $his['NgayDat'] ?><br><br>
                <?php if($his['TrangThai'] == 4){ ?>
                <span style="color:green">✔ Hoàn thành</span>
                <?php } else if($his['TrangThai'] == 5){ ?>
                <span style="color:red">❌ Thất bại</span>
                <?php } ?>
            </div>
            <?php } ?>
        </div>

        <div id="popup" style="
display:none;
position:fixed;
top:20px;
right:20px;
background:#d8262f;
color:white;
padding:15px;
border-radius:10px;">
            🔔 Có đơn mới!
        </div>

        <script>
        let hasNew = <?= $newOrders->num_rows ?>;

        if (hasNew > 0) {
            let popup = document.getElementById("popup");
            popup.style.display = "block";

            setTimeout(() => popup.style.display = "none", 3000);
        }
        </script>
        <script>
        function showTab(tab) {
            document.getElementById("content-new").style.display = "none";
            document.getElementById("content-shipping").style.display = "none";
            document.getElementById("content-history").style.display = "none";

            document.getElementById("content-" + tab).style.display = "block";

            document.getElementById("tab-new").style.color = "white";
            document.getElementById("tab-shipping").style.color = "white";
            document.getElementById("tab-history").style.color = "white";

            document.getElementById("tab-" + tab).style.color = "#f3a22f";
            setInterval(() => {
                location.reload();
            }, 10000);
        }
        </script>

</body>

</html>