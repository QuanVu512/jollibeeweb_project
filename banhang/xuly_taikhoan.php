<?php
// Bật hiển thị lỗi để dễ dàng kiểm tra nếu có vấn đề phát sinh
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Kết nối database và khởi tạo session (đã có trong xuly_donhang.php)
require_once 'xuly_donhang.php'; 

// Kiểm tra xem người dùng đã đăng nhập chưa
if (!isset($_SESSION['TenDangNhap'])) {
    header("Location: ../login.php");
    exit();
}

$user = $_SESSION['TenDangNhap'];

// --- CHỨC NĂNG 1: CẬP NHẬT HỒ SƠ ---
if (isset($_POST['btn_save_profile'])) {
    // Nhận và làm sạch dữ liệu đầu vào để tránh lỗi SQL Injection
    $ten = $conn->real_escape_string($_POST['ho_ten']);
    $sdt = $conn->real_escape_string($_POST['sdt']);
    $dc = $conn->real_escape_string($_POST['dia_chi']);
    $email = $conn->real_escape_string($_POST['email']);
    $ngay_sinh = $_POST['ngay_sinh'];
    $gioi_tinh = $_POST['gioi_tinh'];
    $quyen = $_POST['quyen_user'];

    // Dựa vào quyền để cập nhật vào đúng bảng (KhachHang hoặc NhanVien)
    if ($quyen == 'Khach') {
        // Bảng KhachHang chỉ có các cột: TenKH, SDT, DiaChi
        $sql = "UPDATE KhachHang SET 
                TenKH = '$ten', 
                SDT = '$sdt', 
                DiaChi = '$dc' 
                WHERE TenDangNhap = '$user'";
    } else {
        // Bảng NhanVien có đầy đủ: TenNV, SDT, QueQuan, Email, NgaySinh, GioiTinh
        $sql = "UPDATE NhanVien SET 
                TenNV = '$ten', 
                SDT = '$sdt', 
                QueQuan = '$dc', 
                Email = '$email', 
                NgaySinh = '$ngay_sinh', 
                GioiTinh = '$gioi_tinh' 
                WHERE TenDangNhap = '$user'";
    }

    if ($conn->query($sql)) {
        echo "<script>
                alert('Cập nhật hồ sơ thành công!'); 
                window.location='ho_so.php';
              </script>";
    } else {
        echo "Lỗi cập nhật hồ sơ: " . $conn->error;
    }
    exit();
}

// --- CHỨC NĂNG 2: ĐỔI MẬT KHẨU ---
if (isset($_POST['btn_change_pass'])) {
    // Lấy dữ liệu và mã hóa MD5 (khớp với kiểu lưu trữ trong db của bạn)
    $old_pass = md5($_POST['old_pass']);
    $new_pass = $_POST['new_pass'];
    $confirm_pass = $_POST['confirm_pass'];

    // 1. Kiểm tra xem mật khẩu mới và xác nhận có khớp nhau không
    if ($new_pass !== $confirm_pass) {
        echo "<script>
                alert('Xác nhận mật khẩu mới không khớp!'); 
                window.history.back();
              </script>";
        exit();
    }

    // 2. Kiểm tra mật khẩu cũ có đúng không
    $check_sql = "SELECT * FROM TaiKhoan WHERE TenDangNhap = '$user' AND MatKhau = '$old_pass'";
    $result = $conn->query($check_sql);

    if ($result->num_rows > 0) {
        // 3. Nếu đúng, tiến hành cập nhật mật khẩu mới (đã mã hóa MD5)
        $new_pass_md5 = md5($new_pass);
        $update_sql = "UPDATE TaiKhoan SET MatKhau = '$new_pass_md5' WHERE TenDangNhap = '$user'";
        
        if ($conn->query($update_sql)) {
            // 4. Hủy Session để bắt người dùng đăng nhập lại (theo sơ đồ logic)
            session_unset();
            session_destroy();
            
            echo "<script>
                    alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.'); 
                    window.location='../login.php';
                  </script>";
        } else {
            echo "Lỗi cập nhật mật khẩu: " . $conn->error;
        }
    } else {
        echo "<script>
                alert('Mật khẩu cũ không chính xác!'); 
                window.history.back();
              </script>";
    }
    exit();
}

// Nếu truy cập file trực tiếp mà không qua Form thì quay lại trang hồ sơ
header("Location: ho_so.php");
exit();
?>