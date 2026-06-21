<?php
$servername = "localhost";
$username = "root"; 
$password = "";    
$dbname = "jollibee_db"; 

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8mb4");
if ($conn->connect_error) {
    die("Kết nối database thất bại: " . $conn->connect_error);
}

mysqli_set_charset($conn, "utf8mb4");
//echo "Kết nối thành công!"; 
?>