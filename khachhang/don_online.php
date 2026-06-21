<?php
session_start();
$host = "localhost"; $user = "root"; $pass = ""; $db = "jollibee_db";
$conn = new mysqli($host, $user, $pass, $db);
$conn->set_charset("utf8mb4");

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_SESSION['cart'])) {
    $ten_kh = $conn->real_escape_string($_POST['hoten']); // Sửa theo tên field form của bạn
    $sdt = $conn->real_escape_string($_POST['sdt']);
    $dia_chi = $conn->real_escape_string($_POST['diachi']);
    
    // 1. Kiểm tra khách hàng đã tồn tại chưa
    $res_kh = $conn->query("SELECT MaKH FROM KhachHang WHERE SDT = '$sdt'");
    if ($res_kh->num_rows > 0) {
        $ma_kh = $res_kh->fetch_assoc()['MaKH'];
    } else {
        $conn->query("INSERT INTO KhachHang (TenKH, SDT, DiaChi, TenDangNhap) VALUES ('$ten_kh', '$sdt', '$dia_chi', 'khach1')");
        $ma_kh = $conn->insert_id;
    }

    // 2. Tính tổng tiền
    $tong_tien = 0;
    foreach ($_SESSION['cart'] as $item) { $tong_tien += $item['gia'] * $item['sl']; }

    // 3. Tạo đơn hàng: GÁN CỨNG LoaiDon = 1 (Ship) để quản lý biết đây là đơn online
    $sql_dh = "INSERT INTO DonHang (MaKH, TongTien, DiaChiGiao, TrangThai, LoaiDon) 
               VALUES ($ma_kh, $tong_tien, '$dia_chi', 0, 1)";
    
    if ($conn->query($sql_dh)) {
        $ma_dh = $conn->insert_id;
        foreach ($_SESSION['cart'] as $id => $item) {
            $gia = $item['gia']; $sl = $item['sl'];
            $conn->query("INSERT INTO ChiTietDonHang (MaDH, MaMon, SoLuongMua, GiaMua) VALUES ($ma_dh, $id, $sl, $gia)");
        }
        unset($_SESSION['cart']);
        echo "<script>alert('Đặt hàng thành công! Đơn của bạn đang chờ xác nhận.'); window.location.href='index.php';</script>";
    }
}
?>