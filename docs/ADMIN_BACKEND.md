# Backend phần Admin

Phần này chuyển đúng ba chức năng trong thư mục `admin` PHP cũ sang Express.js:

1. Quản lý hồ sơ nhân viên.
2. Quản lý tài khoản và phân vai trò nhân viên.
3. Báo cáo thống kê và xuất Excel.
4. Gửi thông báo cho khách hàng.

Không triển khai nghiệp vụ đặt hàng, thu ngân, bếp, kho hoặc shipper trong router admin.

## Luồng xử lý chung

```text
Frontend HTML/JS
    ↓ gọi REST API
Route
    ↓ kiểm tra đăng nhập và quyền admin
Validator
    ↓ kiểm tra dữ liệu
Controller
    ↓ xử lý nghiệp vụ
Mongoose Model
    ↓
MongoDB Atlas
```

## Vị trí các file

| Thành phần | File |
|---|---|
| Gom toàn bộ route admin | `backend/src/routes/admin.routes.js` |
| Xác thực và chỉ cho admin truy cập | `backend/src/middleware/auth.js` |
| Route nhân viên | `backend/src/routes/employee.routes.js` |
| Logic CRUD nhân viên | `backend/src/controllers/employee.controller.js` |
| Model nhân viên | `backend/src/models/Employee.js` |
| Route tài khoản | `backend/src/routes/account.routes.js` |
| Logic CRUD tài khoản | `backend/src/controllers/account.controller.js` |
| Model tài khoản | `backend/src/models/User.js` |
| Route báo cáo | `backend/src/routes/report.routes.js` |
| Logic thống kê và Excel | `backend/src/controllers/report.controller.js` |
| Model đơn dùng cho báo cáo | `backend/src/models/Order.js` |
| Route thông báo khách hàng | `backend/src/routes/notification.routes.js` |
| Logic gửi thông báo khách hàng | `backend/src/controllers/notification.controller.js` |
| Model thông báo khách hàng | `backend/src/models/Notification.js` |
| Kiểm tra dữ liệu đầu vào | `backend/src/validators/adminValidators.js` |
| Ghi lịch sử thao tác admin | `backend/src/services/auditService.js` |
| Xử lý lỗi chung | `backend/src/middleware/errorHandler.js` |

## API chuẩn

Tiền tố: `/api/v1/admin`

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/employees` | Danh sách và tìm kiếm nhân viên |
| `POST` | `/employees` | Thêm nhân viên |
| `GET` | `/employees/:id` | Xem một nhân viên |
| `PATCH` | `/employees/:id` | Sửa hồ sơ nhân viên |
| `DELETE` | `/employees/:id` | Cho nhân viên nghỉ việc và khóa tài khoản |
| `GET` | `/accounts` | Danh sách tài khoản nhân viên |
| `POST` | `/accounts` | Cấp tài khoản cho nhân viên |
| `GET` | `/accounts/:id` | Xem một tài khoản nhân viên |
| `PATCH` | `/accounts/:id` | Đổi vai trò hoặc tên hiển thị |
| `PATCH` | `/accounts/:id/status` | Khóa/mở tài khoản |
| `PATCH` | `/accounts/:id/password` | Đặt lại mật khẩu |
| `DELETE` | `/accounts/:id` | Thu hồi tài khoản |
| `GET` | `/reports/summary` | Doanh thu, số đơn, giá vốn, lợi nhuận và món bán chạy |
| `GET` | `/reports/export` | Xuất Excel `orders`, `revenue` hoặc `items` |
| `GET` | `/notifications` | Danh sách thông báo đã gửi cho khách hàng |
| `POST` | `/notifications` | Lưu thông báo admin gửi cho khách hàng |

Frontend hiện tại vẫn có thể dùng các đường dẫn cũ `/api/v1/employees`, `/api/v1/accounts`, `/api/v1/reports` và `/api/v1/notifications`.

## Logic nhân viên

- Thêm hồ sơ trước, sau đó mới cấp tài khoản.
- Mã nhân viên tự sinh dạng `NV0001`.
- Khi sửa, backend kiểm tra họ tên, ngày sinh, số điện thoại và email.
- `DELETE` là xóa mềm: đặt `isActive = false`, ghi `terminationDate` và khóa tài khoản. Không xóa document để đơn hàng cũ vẫn truy ra đúng nhân viên.
- Không cho admin tự cho nghỉ việc chính mình.

## Logic tài khoản

- Một nhân viên chỉ có một tài khoản đang liên kết.
- Mật khẩu được băm bằng bcrypt, không lưu mật khẩu thường.
- Chỉ cấp các vai trò nhân viên: `admin`, `cashier`, `kitchen`, `shipper`.
- Không cho admin tự khóa, tự thu hồi hoặc tự bỏ quyền admin.
- Thu hồi tài khoản là xóa mềm: khóa tài khoản, ghi `revokedAt` và bỏ liên kết nhân viên nhưng vẫn giữ bản ghi phục vụ lịch sử.
- Cấp/thu hồi tài khoản dùng MongoDB transaction để tránh một collection cập nhật thành công còn collection kia thất bại.

## Phiên đăng nhập JWT

- Khi đăng nhập, backend tạo JWT chứa ID tài khoản, vai trò, thời hạn và `tokenVersion`.
- JWT được gửi trong cookie `HttpOnly`, vì vậy JavaScript phía trình duyệt không đọc được token.
- Middleware xác minh chữ ký, thời hạn, người phát hành, đối tượng sử dụng, tài khoản còn hoạt động và `tokenVersion`.
- JWT không được lưu trực tiếp trong MongoDB. `users.tokenVersion` chỉ dùng để thu hồi token cũ.
- Đăng xuất, khóa/thu hồi tài khoản hoặc đặt lại mật khẩu sẽ tăng `tokenVersion`; token đã phát trước đó lập tức không còn hợp lệ.
- Khởi động lại backend không tự hủy JWT còn hạn vì `JWT_SECRET` không thay đổi. Đây là hành vi bình thường của JWT.

## Logic báo cáo

Báo cáo chỉ tính đơn `completed` và chưa hoàn tiền:

- Tổng doanh thu: tổng `orders.total`.
- Số đơn hoàn thành: đếm đơn.
- Giá trị đơn trung bình: doanh thu chia số đơn.
- Giá vốn: tổng `items.quantity × items.costPrice`.
- Lợi nhuận gộp: doanh thu trừ giá vốn.
- Món bán chạy: cộng `items.quantity` theo món.
- Có thể lọc theo `from=YYYY-MM-DD` và `to=YYYY-MM-DD`.

## Logic thông báo khách hàng

- Admin nhập tiêu đề, nội dung, nhóm khách nhận và mức độ thông báo.
- Backend lưu vào collection `notifications`, kèm người tạo, thời điểm gửi và số khách thuộc nhóm nhận tại thời điểm tạo.
- Hiện chưa cần giao diện khách hàng; sau này frontend khách hàng chỉ cần truy vấn collection/API tương ứng để hiển thị.

## File frontend gọi API

| Trang | JavaScript |
|---|---|
| Quản lý tài khoản | `admin/assets/js/accounts.js` |
| Hồ sơ nhân viên | `admin/assets/js/staff.js` |
| Báo cáo | `admin/assets/js/report.js` |
| Thông báo khách hàng | `admin/assets/js/notifications.js` |
| Hàm gọi API chung | `admin/assets/js/api.js` |

Các thành viên khác có thể sao chép cấu trúc route → validator → controller → model của phần admin, rồi thay model và quyền tương ứng với module của họ.
