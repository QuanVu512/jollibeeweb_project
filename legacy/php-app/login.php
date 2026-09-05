<?php session_start(); ?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <title>Đăng nhập - Jollibee</title>
    <link rel="icon" type="image/x-icon" href="https://jollibee.com.vn/media/favicon/default/favicon.png">
    <link rel="shortcut icon" type="image/x-icon" href="https://jollibee.com.vn/media/favicon/default/favicon.png">
    <link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1772723312/frontend/Jollibee/default/vi_VN/css/styles-m.css">
    <link rel="stylesheet" type="text/css" media="screen and (min-width: 1200px)" href="https://jollibee.com.vn/static/version1772723312/frontend/Jollibee/default/vi_VN/css/styles-l.css">

    <style>
        body {
            background-color: #f4f4f4; /* Màu nền xám nhạt cho nguyên trang */
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: 'Open Sans', sans-serif;
        }
        .login-standalone-container {
            background: #ffffff;
            padding: 40px 30px;
            border-radius: 12px;
            box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 450px; /* Độ rộng của form */
        }
        .logo-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo-header img {
            max-width: 120px;
            height: auto;
        }
        .block-title {
            text-align: center;
            margin-bottom: 25px;
        }
        .block-title span {
            font-size: 22px;
            font-weight: bold;
            color: #333;
            text-transform: uppercase;
        }
        /* Sửa lại độ rộng nút bấm để tràn viền cho đẹp */
        .actions-toolbar .primary button {
            width: 100%;
            padding: 15px;
            font-size: 16px;
            border-radius: 8px;
        }
        .register-popup {
            text-align: center;
            margin-top: 20px;
            display: block;
            width: 100%;
        }
        .error-message {
            color: #e21b22;
            background: #fdd;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 15px;
            font-weight: bold;
        }
        .back-home {
            text-align: center;
            margin-top: 25px; /* Cách xa form ra một chút cho thoáng */
            display: block;
            color: #888;
            text-decoration: none;
            white-space: nowrap; /* Ép chữ không được xuống dòng */
            width: 100%;
            clear: both;
        }
        .back-home:hover {
            color: #e21b22;
        }
    </style>
</head>
<body class="pl-thm-jollibee">

<div class="login-standalone-container">
    
    <div class="logo-header">
        <a class="logo" href="homepage.php" title="Về trang chủ">
            <img src="https://jollibee.com.vn/static/version1775056506/frontend/Jollibee/default/vi_VN/images/logo.png" alt="Logo Jollibee">
        </a>
    </div>

    <div class="block-title">
        <span role="heading" aria-level="2">Vui Lòng Đăng nhập</span>
    </div>

    <?php
    if(isset($_SESSION['error_login'])) {
        echo '<div class="error-message">' . $_SESSION['error_login'] . '</div>';
        unset($_SESSION['error_login']);
    }
    ?>

    <div class="block-content">
        <form action="xuly_dangnhap.php" method="POST" class="form-customer-login" id="social-form-login">
            <div class="form-outler form-outler-top">
                <fieldset class="fieldset login mp-8">
                    
                    <div class="field email required" style="margin-bottom: 15px;">
                        <div class="control">
                            <input name="username" id="social_login_email" type="text" class="input-text" value="" autocomplete="off" required placeholder="Tên tài khoản">
                        </div>
                    </div>
                    
                    <div class="field password required" style="margin-bottom: 10px;">
                        <div class="control">
                            <input name="password" id="social_login_pass" type="password" class="input-text" autocomplete="off" required placeholder="Mật khẩu">
                        </div>
                    </div>
                    
                    <div class="forgot-pass" style="text-align: right; margin-bottom: 20px;">
                        <a class="remind" href="#"><span>Quên mật khẩu?</span></a>
                    </div>

                </fieldset>
            </div>
            
            <div class="form-outler form-outler-bottom">
                <div class="actions-toolbar mp-8">
                    <div class="primary" style="width: 100%; display: flex; justify-content: center;">
                        <button type="submit" name="btn_dangnhap" class="btn-popup action login primary login-uppercase" id="bnt-social-login-authentication">
                            <span>Đăng nhập</span>
                        </button>
                    </div>
                    
                    <div class="primary register-popup">
                        <span style="color: #666;">Bạn chưa có tài khoản?</span> 
                        <a class="action create" href="register.php" style="color: #e21b22; font-weight: bold;"><span>Đăng ký ngay</span></a>
                    </div>
                </div>
            </div>
        </form>

        <a href="homepage.php" class="back-home">← Quay lại trang chủ</a>
    </div>
</div>

</body>
</html>