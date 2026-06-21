<?php 
session_start();
include '../includes/connect.php'; 

// 1. KIỂM TRA QUYỀN TRUY CẬP (Chỉ dành cho Bếp)
$quyen = isset($_SESSION['Quyen']) ? strtolower($_SESSION['Quyen']) : '';
if (!isset($_SESSION['TenDangNhap']) || $quyen !== 'bep') {
    echo "<script>
            alert('Bạn không có quyền truy cập vào khu vực quản lý kho của Bếp!');
            window.location.href = '../login.php';
          </script>";
    exit();
}

// Mảng danh mục khớp với các file menu của hệ thống
$danh_muc = [
    1 => "Gà giòn vui vẻ",
    2 => "Gà sốt cay",
    3 => "Burger & Cơm",
    4 => "Mỳ ý Jolly",
    5 => "Phần ăn phụ",
    6 => "Món tráng miệng",
    7 => "Thức uống"
];

// 2. XỬ LÝ LOGIC CRUD
$msg = "";
$error = "";

// A. THÊM MÓN MỚI
if (isset($_POST['btn_add'])) {
    $ten = mysqli_real_escape_string($conn, $_POST['ten_mon']);
    $gia = floatval($_POST['gia']);
    $sl = intval($_POST['so_luong']);
    $hinh = mysqli_real_escape_string($conn, $_POST['hinh_anh']);
    $ma_loai = intval($_POST['ma_loai']); // Nhận mã loại mới

    $sql_add = "INSERT INTO MonAn (TenMon, Gia, SoLuong, HinhAnh, TrangThai, MaLoai) 
                VALUES ('$ten', $gia, $sl, '$hinh', 1, $ma_loai)";
    if ($conn->query($sql_add)) $msg = "Thêm món [$ten] vào danh mục thành công!";
    else $error = "Lỗi thêm món: " . $conn->error;
}

// B. CẬP NHẬT MÓN (Sửa trực tiếp trên bảng)
if (isset($_POST['btn_edit'])) {
    $ma = intval($_POST['ma_mon']);
    $ten = mysqli_real_escape_string($conn, $_POST['ten_mon']);
    $gia = floatval($_POST['gia']);
    $sl = intval($_POST['so_luong']);
    $tt = intval($_POST['trang_thai']);
    $ma_loai = intval($_POST['ma_loai']); // Cập nhật mã loại

    $sql_edit = "UPDATE MonAn SET 
                 TenMon='$ten', Gia=$gia, SoLuong=$sl, TrangThai=$tt, MaLoai=$ma_loai 
                 WHERE MaMon=$ma";
    if ($conn->query($sql_edit)) $msg = "Cập nhật mã món #$ma thành công!";
    else $error = "Lỗi cập nhật: " . $conn->error;
}

// C. XÓA MÓN
if (isset($_GET['delete'])) {
    $ma_xoa = intval($_GET['delete']);
    $sql_del = "DELETE FROM MonAn WHERE MaMon=$ma_xoa";
    if ($conn->query($sql_del)) {
        header("Location: index.php");
        exit();
    }
}

// 3. LẤY DANH SÁCH MÓN ĂN
$sql_list = "SELECT * FROM MonAn ORDER BY MaMon DESC";
$result = $conn->query($sql_list);
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Quản Lý Thực Đơn Jollibee - Bếp</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: auto; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        h2 { color: #e74c3c; text-align: center; text-transform: uppercase; border-bottom: 2px solid #ffc107; padding-bottom: 10px; }
        
        /* Form thêm món style Jollibee */
        .form-add { background: #fff5f5; padding: 20px; border: 1px dashed #e74c3c; border-radius: 8px; margin-bottom: 30px; }
        .form-add input, .form-add select { padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 5px; }
        
        /* Bảng danh sách giống file index bạn gửi */
        table { width: 100%; border-collapse: collapse; margin-top: 10px; background: #fff; }
        th { background-color: #e74c3c; color: white; padding: 12px; text-align: left; font-size: 14px; }
        td { border-bottom: 1px solid #eee; padding: 10px; vertical-align: middle; }
        tr:hover { background-color: #fff9f9; }

        .btn-save { background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .btn-save:hover { background: #218838; }
        .btn-add { background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .btn-delete { color: #e74c3c; text-decoration: none; font-weight: bold; margin-left: 10px; font-size: 13px; }
        
        .alert { padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .alert-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>

<div class="container">
    <h2><img src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/images/logo.png" width="50" style="vertical-align: middle;"> QUẢN LÝ KHO & THỰC ĐƠN</h2>

    <?php if($msg) echo "<div class='alert alert-success'>$msg</div>"; ?>
    <?php if($error) echo "<div class='alert alert-error'>$error</div>"; ?>

    <div class="form-add">
        <b style="color: #e74c3c;">+ THÊM MÓN MỚI</b><br><br>
        <form method="POST">
            <input type="text" name="ten_mon" placeholder="Tên món" required style="width: 200px;">
            <input type="number" name="gia" placeholder="Giá" required style="width: 100px;">
            <input type="number" name="so_luong" placeholder="SL kho" required style="width: 80px;">
            <input type="text" name="hinh_anh" placeholder="Link ảnh (ga.png)" style="width: 150px;">
            
            <select name="ma_loai" required>
                <option value="">-- Chọn Loại Món --</option>
                <?php foreach($danh_muc as $id => $name): ?>
                    <option value="<?= $id ?>"><?= $name ?></option>
                <?php endforeach; ?>
            </select>
            
            <button type="submit" name="btn_add" class="btn-add">XÁC NHẬN THÊM</button>
        </form>
    </div>

    <table>
        <thead>
            <tr>
                <th>Mã</th>
                <th>Tên Món Ăn</th>
                <th>Phân Loại Menu</th>
                <th>Giá Bán</th>
                <th>Số Lượng Kho</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
            </tr>
        </thead>
        <tbody>
            <?php while($mon = $result->fetch_assoc()): ?>
            <tr>
                <form method="POST">
                    <input type="hidden" name="ma_mon" value="<?= $mon['MaMon'] ?>">
                    <td style="font-weight: bold; color: #888;">#<?= $mon['MaMon'] ?></td>
                    <td>
                        <input type="text" name="ten_mon" value="<?= $mon['TenMon'] ?>" 
                               style="width:180px; font-weight:bold; border:none; border-bottom:1px solid #eee;">
                    </td>
                    <td>
                        <select name="ma_loai" style="padding: 5px; border-radius: 4px;">
                            <?php foreach($danh_muc as $id => $name): ?>
                                <option value="<?= $id ?>" <?= $mon['MaLoai'] == $id ? 'selected' : '' ?>><?= $name ?></option>
                            <?php endforeach; ?>
                        </select>
                    </td>
                    <td><input type="number" name="gia" value="<?= $mon['Gia'] ?>" style="width:90px;"></td>
                    <td>
                        <input type="number" name="so_luong" value="<?= $mon['SoLuong'] ?>" min="0" 
                               style="width:60px; font-weight:bold; color: <?= $mon['SoLuong'] < 10 ? 'red' : '#28a745' ?>;">
                    </td>
                    <td>
                        <select name="trang_thai">
                            <option value="1" <?= $mon['TrangThai'] == 1 ? 'selected' : '' ?>>Đang bán</option>
                            <option value="0" <?= $mon['TrangThai'] == 0 ? 'selected' : '' ?>>Tạm ngưng</option>
                        </select>
                    </td>
                    <td>
                        <button type="submit" name="btn_edit" class="btn-save">LƯU</button>
                        <a href="?delete=<?= $mon['MaMon'] ?>" class="btn-delete" 
                           onclick="return confirm('Bạn có chắc muốn xóa món này?')">XÓA</a>
                    </td>
                </form>
            </tr>
            <?php endwhile; ?>
        </tbody>
    </table>
</div>

</body>
</html>