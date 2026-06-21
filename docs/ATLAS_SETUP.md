# Thiết lập MongoDB Atlas cho nhóm

Backend đã hỗ trợ Atlas qua biến `MONGODB_URI`; không cần thay đổi controller, model hay route.

## 1. Trưởng nhóm tạo database dùng chung

1. Đăng nhập MongoDB Atlas và tạo một Project cho nhóm.
2. Tạo Free cluster.
3. Đặt tên cluster dễ nhận biết, ví dụ `jollibee-cluster`.
4. Có thể mời các thành viên vào Atlas Project nếu họ cần xem cluster trên giao diện Atlas.

## 2. Tạo quyền truy cập cho từng thành viên

Trong **Database Access**, tạo một database user riêng cho mỗi người. Cấp quyền `readWrite` đối với database `jollibee`. Không dùng chung một mật khẩu cho cả nhóm.

Trong **Network Access / IP Access List**, thêm public IP hiện tại của từng thành viên. Nếu mạng thay đổi, thành viên cập nhật IP của mình.

`0.0.0.0/0` cho phép truy cập từ mọi nơi và tiện hơn, nhưng không được khuyến nghị. Nếu buộc phải dùng cho bài tập ngắn hạn, phải dùng mật khẩu mạnh và xóa rule này khi không còn cần.

## 3. Lấy connection string

Trong cluster chọn **Connect → Drivers → Node.js**, sao chép URI và thêm tên database `jollibee`:

```env
MONGODB_URI=mongodb+srv://<database-user>:<database-password>@<cluster-host>/jollibee?retryWrites=true&w=majority&appName=Jollibee
```

Thay ba phần trong dấu `<...>` bằng thông tin Atlas của thành viên. Nếu tự nhập mật khẩu có ký tự đặc biệt trong URI, cần URL-encode mật khẩu; cách an toàn nhất là dùng connection string Atlas cung cấp.

## 4. Cấu hình trên mỗi máy

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

Mỗi thành viên mở `.env` và điền `MONGODB_URI`, `JWT_SECRET`. File `.env` đã được bỏ qua bởi Git và không được gửi lên kho mã nguồn.

Người phụ trách admin chạy một lần:

```powershell
npm run seed:admin
```

Các thành viên chạy ứng dụng:

```powershell
npm run dev
```

Truy cập `http://localhost:3000/admin/login.html`.

## 5. Đặt lại mật khẩu admin

Seed mặc định không sửa tài khoản đã tồn tại. Khi thực sự cần đặt lại, người phụ trách admin sửa `.env`:

```env
ADMIN_FORCE_RESET=true
```

Chạy `npm run seed:admin`, sau đó đổi lại thành `false`.
