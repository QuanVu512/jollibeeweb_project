<?php
session_start();
$host = "localhost"; $user = "root"; $pass = ""; $db = "jollibee_db";
$conn = new mysqli($host, $user, $pass, $db);
$conn->set_charset("utf8mb4");

// Nhận dữ liệu
$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $maKH = intval($data['MaKH'] ?? 3);
    $tongTien = floatval($data['TongTien'] ?? 0);
    $diaChi = $conn->real_escape_string($data['DiaChiGiao'] ?? '');
    $chiTiet = $data['ChiTiet'] ?? [];

    $sql_dh = "INSERT INTO DonHang (MaKH, NgayDat, TongTien, DiaChiGiao, TrangThai, LoaiDon) 
               VALUES ($maKH, NOW(), $tongTien, '$diaChi', 0, 1)";
    
    if ($conn->query($sql_dh)) {
        $maDH = $conn->insert_id;
        foreach ($chiTiet as $item) {
            $maMon = $item['MaMon'];
            $sl = $item['SoLuongMua'];
            $gia = $item['GiaMua'];
            $conn->query("INSERT INTO ChiTietDonHang (MaDH, MaMon, SoLuongMua, GiaMua) VALUES ($maDH, $maMon, $sl, $gia)");
        }
        
        // TRẢ VỀ THÔNG BÁO THÀNH CÔNG KIỂU CŨ (Nếu dùng Fetch/JS ở client thì dùng JSON, nếu dùng FORM POST thì dùng SCRIPT)
        // Vì ảnh bạn gửi hiện JSON nên mình sẽ chuyển thành cấu trúc JS cho trang ga-gion-vui-ve.php xử lý
        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "MaDH" => $maDH]);
    }
} else {
    // Nếu đặt bằng Form POST thông thường
    $ten_kh = $conn->real_escape_string($_POST['hoten'] ?? '');
    $sdt = $conn->real_escape_string($_POST['sdt'] ?? '');
    $dia_chi = $conn->real_escape_string($_POST['diachi'] ?? '');
    
    // Giả sử lấy MaKH từ session hoặc mặc định
    $ma_kh = 3; 
    $tong_tien = 0;
    foreach($_SESSION['cart'] as $item) { $tong_tien += $item['gia'] * $item['sl']; }

    $sql_dh = "INSERT INTO DonHang (MaKH, NgayDat, TongTien, DiaChiGiao, TrangThai, LoaiDon) 
               VALUES ($ma_kh, NOW(), $tong_tien, '$dia_chi', 0, 1)";
    
    if($conn->query($sql_dh)){
        $ma_dh = $conn->insert_id;
        foreach($_SESSION['cart'] as $id => $p){
            $conn->query("INSERT INTO ChiTietDonHang (MaDH, MaMon, SoLuongMua, GiaMua) VALUES ($ma_dh, $id, {$p['sl']}, {$p['gia']})");
        }
        unset($_SESSION['cart']);
        
        // HIỆN THÔNG BÁO GIỐNG BẢN BAN ĐẦU
        echo "<script>
                alert('Đặt hàng thành công! Đơn hàng của bạn là #$ma_dh');
                window.location.href='index.php';
              </script>";
    }
}
?>