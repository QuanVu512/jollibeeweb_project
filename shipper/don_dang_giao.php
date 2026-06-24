<?php
require '../includes/connect.php';
session_start();

$quyen = strtolower($_SESSION['Quyen'] ?? '');
if (!isset($_SESSION['TenDangNhap']) || ($quyen !== 'shipper' && $quyen !== 'admin')) {
    header("Location: ../login.php");
    exit();
}

$sql = "SELECT * FROM DonHang 
        WHERE TrangThai = 3";

$result = $conn->query($sql);
?>

<h2 style="text-align:center">📦 Đơn đang giao</h2>

<?php while($row = $result->fetch_assoc()) { ?>
<div style="background:white;margin:10px;padding:15px;border-radius:10px">
    Đơn #<?= $row['MaDH'] ?>

    <a href="hoan_thanh.php?madh=<?= $row['MaDH'] ?>"
       style="background:green;color:white;padding:8px;text-decoration:none">
       Đã giao xong
    </a>
</div>
<?php } ?>