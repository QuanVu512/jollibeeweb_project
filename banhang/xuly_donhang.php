<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
$host = "localhost"; $user = "root"; $pass = ""; $db = "jollibee_db";
$conn = new mysqli($host, $user, $pass, $db);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) { die("Kết nối thất bại: " . $conn->connect_error); }

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $ma_dh = intval($_POST['ma_dh'] ?? 0);
    $action = $_POST['action'];

    // 1. Tạo đơn tại quầy: Mặc định là Ăn tại chỗ (LoaiDon = 0)
    if ($action === 'create_order') {
        if (empty($_SESSION['cart'])) { header("Location: tao_don_hang.php"); exit(); }
        $loai_don = intval($_POST['loai_don']); // 0: Tại chỗ, 1: Ship
        $dia_chi = $conn->real_escape_string($_POST['dia_chi']);
        $tong_tien = 0;
        foreach($_SESSION['cart'] as $p) { $tong_tien += $p['gia'] * $p['sl']; }

        // Đẩy thẳng sang bếp (TrangThai = 1)
        $sql_dh = "INSERT INTO DonHang (MaKH, TongTien, DiaChiGiao, TrangThai, LoaiDon) 
                   VALUES (100, $tong_tien, '$dia_chi', 1, $loai_don)";
        if ($conn->query($sql_dh)) {
            $new_id = $conn->insert_id;
            foreach($_SESSION['cart'] as $id => $p) {
                $conn->query("INSERT INTO ChiTietDonHang (MaDH, MaMon, SoLuongMua, GiaMua) VALUES ($new_id, $id, {$p['sl']}, {$p['gia']})");
            }
            unset($_SESSION['cart']);
            header("Location: bep_che_bien.php"); exit();
        }
    } 
    // 2. Chấp nhận đơn Online
    elseif ($action === 'accept') {
        $conn->query("UPDATE DonHang SET TrangThai = 1 WHERE MaDH = $ma_dh");
        header("Location: quan_ly_don_hang.php"); exit();
    } 
    // 3. Hủy đơn
    elseif ($action === 'cancel') {
        $conn->query("UPDATE DonHang SET TrangThai = -1 WHERE MaDH = $ma_dh");
        header("Location: quan_ly_don_hang.php"); exit();
    } 
    // 4. Bếp làm xong đơn Ship (Trạng thái 2)
    elseif ($action === 'done') {
        $conn->query("UPDATE DonHang SET TrangThai = 2 WHERE MaDH = $ma_dh");
        header("Location: bep_che_bien.php"); exit();
    }
    // 5. Bếp phục vụ xong tại bàn (Trạng thái 5)
    elseif ($action === 'serve') {
        $conn->query("UPDATE DonHang SET TrangThai = 4 WHERE MaDH = $ma_dh");
        header("Location: bep_che_bien.php"); exit();
    }
}
?>