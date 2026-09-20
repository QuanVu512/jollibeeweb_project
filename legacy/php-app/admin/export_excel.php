<?php
include '../includes/connect.php';

$report_type = $_GET['report_type'] ?? 'orders';
$status = 4; // Cố định đơn hoàn thành

// 1. Cấu hình tên file
$filename = "Bao_cao_" . $report_type . "_" . date('Ymd_His') . ".xls";
header("Content-Type: application/vnd.ms-excel; charset=utf-8");
header("Content-Disposition: attachment; filename=\"$filename\"");

// 2. Xử lý Truy vấn SQL riêng biệt cho từng loại
if ($report_type == 'items') {
    // Báo cáo món tiêu thụ: Phải dùng GROUP BY để cộng dồn số lượng từng món
    $sql = "SELECT m.TenMon, SUM(ct.SoLuongMua) AS TongSoLuong, SUM(ct.SoLuongMua * ct.GiaMua) AS ThanhTien
            FROM DonHang dh
            JOIN ChiTietDonHang ct ON dh.MaDH = ct.MaDH
            JOIN MonAn m ON ct.MaMon = m.MaMon
            WHERE dh.TrangThai = 4
            GROUP BY m.MaMon, m.TenMon
            ORDER BY TongSoLuong DESC";
} else {
    // Báo cáo Đơn hàng hoặc Doanh thu: Liệt kê danh sách đơn
    $sql = "SELECT dh.MaDH, kh.TenKH, dh.NgayDat, dh.TongTien, dh.DiaChiGiao
            FROM DonHang dh
            LEFT JOIN KhachHang kh ON dh.MaKH = kh.MaKH
            WHERE dh.TrangThai = 4
            ORDER BY dh.MaDH DESC";
}

$result = $conn->query($sql);
?>

<meta http-equiv="content-type" content="plain/html; charset=UTF-8" />
<table border="1">
    <thead>
        <tr style="background-color: #e74c3c; color: white; font-weight: bold;">
            <?php if ($report_type == 'items'): ?>
                <th>Tên Món Ăn</th>
                <th>Tổng Số Lượng Bán</th>
                <th>Tổng Doanh Thu Món (VNĐ)</th>
            <?php elseif ($report_type == 'revenue'): ?>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Ngày Đặt</th>
                <th>Doanh Thu (VNĐ)</th>
            <?php else: // report_type == 'orders' ?>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Ngày Đặt</th>
                <th>Địa Chỉ Giao</th>
            <?php endif; ?>
        </tr>
    </thead>
    <tbody>
    <?php
    $grand_total_money = 0;
    $grand_total_qty = 0;
    $order_count = 0;

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            echo "<tr>";
            if ($report_type == 'items') {
                $grand_total_qty += $row['TongSoLuong'];
                $grand_total_money += $row['ThanhTien'];
                echo "<td>" . $row['TenMon'] . "</td>";
                echo "<td>" . $row['TongSoLuong'] . "</td>";
                // XUẤT SỐ THUẦN (int) ĐỂ EXCEL KHÔNG MẤT SỐ 0
                echo "<td>" . (int)$row['ThanhTien'] . "</td>";
            } elseif ($report_type == 'revenue') {
                $grand_total_money += $row['TongTien'];
                echo "<td>DH" . $row['MaDH'] . "</td>";
                echo "<td>" . $row['TenKH'] . "</td>";
                echo "<td>" . $row['NgayDat'] . "</td>";
                echo "<td>" . (int)$row['TongTien'] . "</td>";
            } else {
                $order_count++;
                echo "<td>DH" . $row['MaDH'] . "</td>";
                echo "<td>" . $row['TenKH'] . "</td>";
                echo "<td>" . $row['NgayDat'] . "</td>";
                echo "<td>" . $row['DiaChiGiao'] . "</td>";
            }
            echo "</tr>";
        }
    }
    ?>
    </tbody>
    <tfoot>
        <tr style="background-color: #f1f1f1; font-weight: bold;">
            <?php if ($report_type == 'items'): ?>
                <td>TỔNG CỘNG</td>
                <td><?php echo $grand_total_qty; ?> phần</td>
                <td><?php echo number_format($grand_total_money, 0, ',', '.'); ?> VNĐ</td>
            <?php elseif ($report_type == 'revenue'): ?>
                <td colspan="3">TỔNG DOANH THU</td>
                <td><?php echo number_format($grand_total_money, 0, ',', '.'); ?> VNĐ</td>
            <?php else: ?>
                <td colspan="3">TỔNG SỐ ĐƠN HÀNG</td>
                <td><?php echo $order_count; ?> đơn</td>
            <?php endif; ?>
        </tr>
    </tfoot>
</table>