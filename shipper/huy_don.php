<?php
require '../includes/connect.php';
session_start();

$quyen = strtolower($_SESSION['Quyen'] ?? '');
if (!isset($_SESSION['TenDangNhap']) || ($quyen !== 'shipper' && $quyen !== 'admin')) {
    header("Location: ../login.php");
    exit();
}
$madh = $_GET['madh'];

$conn->query("UPDATE DonHang 
              SET TrangThai = 1
              WHERE MaDH = $madh");

header("Location: shipper.php");
?>