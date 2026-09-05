<?php
session_start(); 
include 'includes/connect.php'; 

if (isset($_POST['btn_dangnhap'])) {
    
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = mysqli_real_escape_string($conn, $_POST['password']);
    $password = md5($password); 

    $sql = "SELECT * FROM TaiKhoan WHERE TenDangNhap = '$username' AND MatKhau = '$password' AND TrangThai = 1";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc(); 
        

        $_SESSION['TenDangNhap'] = $row['TenDangNhap'];
        $quyen = strtolower($row['Quyen']); 
        $_SESSION['Quyen'] = $quyen;

if ($quyen == 'khach') {
    $sql_kh = "SELECT MaKH, TenKH FROM KhachHang WHERE TenDangNhap = '$username'";
    $res_kh = $conn->query($sql_kh);
    
    if($res_kh->num_rows > 0) {
        $kh = $res_kh->fetch_assoc();
        $_SESSION['MaKH'] = $kh['MaKH'];
        $_SESSION['TenHienThi'] = $kh['TenKH'];
    } else {
        $_SESSION['TenHienThi'] = $username;
    }
    header("Location: homepage.php");
    exit();
}else {
            $sql_nv = "SELECT TenNV FROM NhanVien WHERE TenDangNhap = '$username'";
            $res_nv = $conn->query($sql_nv);
            if($res_nv->num_rows > 0) {
                $nv = $res_nv->fetch_assoc();
                $_SESSION['TenHienThi'] = $nv['TenNV'];
            } else {
                $_SESSION['TenHienThi'] = $username;
            }

            if ($quyen == 'admin') {
                header("Location: admin/index.php"); 
            } elseif ($quyen == 'thungan') {
                header("Location: banhang/quan_ly_don_hang.php");
            } elseif ($quyen == 'bep') {
                header("Location: bep/index.php"); 
            } elseif ($quyen == 'shipper') {
                header("Location: giaohang/shipper.php"); 
            } else {
                header("Location: homepage,php"); 
            }
            exit(); 
        }

    } else {
        $_SESSION['error_login'] = "Tài khoản hoặc mật khẩu không chính xác!";
        header("Location: login.php"); 
        exit();
    }
} else {
    header("Location: login.php");
    exit();
}
?>