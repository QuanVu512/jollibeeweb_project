<?php
session_start();

if (!isset($_SESSION['TenDangNhap']) || strtolower($_SESSION['Quyen']) !== 'admin') {
    header("Location: ../login.php");
    exit();
}

include '../includes/connect.php';


$sql_doanhthu = "SELECT SUM(TongTien) AS TongDoanhThu FROM DonHang WHERE TrangThai = 4";
$res_doanhthu = $conn->query($sql_doanhthu);
$doanh_thu = 0;
if ($res_doanhthu && $res_doanhthu->num_rows > 0) {
    $row = $res_doanhthu->fetch_assoc();
    $doanh_thu = $row['TongDoanhThu'] ?? 0;
}

$sql_sodon = "SELECT COUNT(MaDH) AS SoDonHang FROM DonHang WHERE TrangThai = 4";
$res_sodon = $conn->query($sql_sodon);
$so_don = 0;
if ($res_sodon && $res_sodon->num_rows > 0) {
    $row = $res_sodon->fetch_assoc();
    $so_don = $row['SoDonHang'] ?? 0;
}

$sql_banchay = "
    SELECT m.TenMon, SUM(ct.SoLuongMua) AS TongSoBan
    FROM ChiTietDonHang ct
    JOIN MonAn m ON ct.MaMon = m.MaMon
    JOIN DonHang dh ON ct.MaDH = dh.MaDH
    WHERE dh.TrangThai = 4
    GROUP BY m.MaMon, m.TenMon
    ORDER BY TongSoBan DESC
    LIMIT 1
";
$res_banchay = $conn->query($sql_banchay);
$mon_ban_chay = "Chưa có dữ liệu";
$so_luong_ban = 0;
if ($res_banchay && $res_banchay->num_rows > 0) {
    $row = $res_banchay->fetch_assoc();
    $mon_ban_chay = $row['TenMon'];
    $so_luong_ban = $row['TongSoBan'];
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo thống kê</title>
    <link rel="icon" type="image/x-icon" href="https://jollibee.com.vn/media/favicon/default/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Nunito', sans-serif; background-color: #f4f6f9; margin: 0; padding: 0; }
        
        /* Sidebar Menu (Dùng chung style với các trang admin khác) */
        .sidebar { width: 250px; background: #2c3e50; color: white; height: 100vh; position: fixed; display: flex; flex-direction: column; }
        .sidebar h2 { text-align: center; padding: 20px; margin: 0; background: #e74c3c; font-weight: 800; letter-spacing: 1px; }
        .sidebar a { padding: 15px 25px; color: #ecf0f1; text-decoration: none; display: block; font-weight: 600; transition: 0.3s; border-left: 4px solid transparent; }
        .sidebar a:hover, .sidebar a.active { background: #34495e; border-left: 4px solid #e74c3c; color: #fff; }
        
        /* Main Content */
        .main-content { margin-left: 250px; padding: 30px; }
        .header-top { display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 30px; }
        .user-info { font-weight: bold; color: #333; }
        .logout-btn { color: #e74c3c; text-decoration: none; font-weight: bold; border: 1px solid #e74c3c; padding: 5px 15px; border-radius: 5px; transition: 0.3s; }
        .logout-btn:hover { background: #e74c3c; color: white; }

        /* Dashboard Cards */
        .dashboard-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-bottom: 4px solid #e74c3c; display: flex; align-items: center; justify-content: space-between; }
        .card.blue { border-bottom-color: #3498db; }
        .card.green { border-bottom-color: #2ecc71; }
        .card.orange { border-bottom-color: #f39c12; }
        
        .card-info h3 { margin: 0; font-size: 16px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 0.5px; }
        .card-info p { margin: 10px 0 0 0; font-size: 28px; font-weight: 800; color: #2c3e50; }
        .card-info span { font-size: 14px; color: #95a5a6; font-weight: 600; display: block; margin-top: 5px; }
        
        .card-icon { font-size: 40px; opacity: 0.8; }
    </style>
</head>
<body>

<div class="sidebar">
    <h2>JOLLIBEE ADMIN</h2>
    <a href="index.php">Quản lý Tài khoản</a>
    <a href="staff.php">Hồ sơ Nhân viên</a>
    <a href="report.php" class="active">Báo cáo Thống kê</a>
</div>

<div class="main-content">
    <div class="header-top">
        <div class="user-info">
            Xin chào, <?php echo htmlspecialchars($_SESSION['TenHienThi']); ?> (Quản trị viên)
        </div>
        <a href="../logout.php" class="logout-btn">Đăng xuất</a>
    </div>
<div class="main-content">
    <div class="report-options" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <p style="font-weight: bold; margin-bottom: 15px;">Chọn loại dữ liệu muốn xuất Excel:</p>
        <form action="export_excel.php" method="GET" style="display: flex; gap: 15px;">
            <input type="hidden" name="status" value="4">
            
            <select name="report_type" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; flex-grow: 1;">
                <option value="orders">Báo cáo số lượng đơn hàng</option>
                <option value="revenue">Báo cáo doanh thu</option>
                <option value="items">Báo cáo số lượng món tiêu thụ</option>
            </select>

            <button type="submit" style="background: #e74c3c; color: white; border: none; padding: 10px 25px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                📥 Xuất file Excel
            </button>
        </form>
    </div>
    <div class="dashboard-cards">
        <div class="card green">
            <div class="card-info">
                <h3>Tổng Doanh Thu</h3>
                <p><?php echo number_format($doanh_thu, 0, ',', '.'); ?> đ</p>
                <span>Đã giao thành công</span>
            </div>
            <div class="card-icon">💰</div>
        </div>

        <div class="card blue">
            <div class="card-info">
                <h3>Số Đơn Hoàn Thành</h3>
                <p><?php echo number_format($so_don, 0, ',', '.'); ?></p>
                <span>Đơn hàng</span>
            </div>
            <div class="card-icon">📦</div>
        </div>

        <div class="card orange">
            <div class="card-info">
                <h3>Món Bán Chạy Nhất</h3>
                <p style="font-size: 20px; line-height: 1.3; color: #e31837;"><?php echo htmlspecialchars($mon_ban_chay); ?></p>
                <span>Đã bán: <b><?php echo $so_luong_ban; ?></b> phần</span>
            </div>
            <div class="card-icon">🍗</div>
        </div>
    </div>
</div>

</body>
</html>