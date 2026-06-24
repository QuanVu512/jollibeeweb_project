<?php
require '../includes/connect.php';
session_start();

$madh = $_GET['madh'];

// cập nhật trạng thái thất bại
$conn->query("
    UPDATE DonHang 
    SET TrangThai = 5
    WHERE MaDH = $madh
");

header("Location: shipper.php");
?>