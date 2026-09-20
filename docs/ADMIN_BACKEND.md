# Backend phần Admin

Phần này mô tả các chức năng quản trị đã chuyển sang Express.js:

1. Quản lý hồ sơ nhân viên.
2. Quản lý tài khoản và phân vai trò nhân viên.
3. Báo cáo thống kê và xuất Excel.
4. Quản lý sản phẩm và công thức tiêu hao nguyên liệu.

API thông báo vẫn được giữ lại cho nhu cầu tương lai nhưng hiện không còn menu, trang hoặc route giao diện quản trị sử dụng chức năng này.

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
| Route quản lý sản phẩm | `backend/src/routes/adminProduct.routes.js` |
| Điều phối quản lý sản phẩm | `backend/src/controllers/adminProduct.controller.js` |
| Nghiệp vụ quản lý sản phẩm | `backend/src/services/adminProductService.js` |
| Model sản phẩm/công thức | `backend/src/models/Product.js`, `backend/src/models/Recipe.js` |
| Kiểm tra dữ liệu đầu vào | `backend/src/validators/adminValidators.js`, `backend/src/validators/productValidators.js` |
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
| `GET` | `/products` | Danh sách sản phẩm, lọc theo danh mục và trạng thái |
| `GET` | `/products/options` | Danh mục và nguyên liệu dùng trong form sản phẩm |
| `GET` | `/products/:id` | Chi tiết sản phẩm và công thức |
| `POST` | `/products` | Tạo sản phẩm và công thức nguyên liệu |
| `PATCH` | `/products/:id` | Cập nhật sản phẩm, công thức và trạng thái |
| `DELETE` | `/products/:id` | Ngừng hoạt động sản phẩm, không xóa lịch sử |

## Logic sản phẩm

- Mã sản phẩm được sinh tự động theo bộ đếm `MON`; người dùng không nhập hoặc sửa mã.
- Tên, giá nguyên VND lớn hơn 0, danh mục và ít nhất một nguyên liệu là bắt buộc.
- Mỗi nguyên liệu có số lượng thập phân dương và đơn vị lấy từ `baseUnit`/`packaging` của nguyên liệu.
- Các dòng trùng nguyên liệu được quy đổi về đơn vị cơ sở, cộng lại và lưu vào `recipes.ingredients[].quantityBase`.
- Danh sách hiển thị 10 sản phẩm mỗi trang, lọc theo một danh mục và trạng thái.
- Thao tác xóa chỉ đặt sản phẩm và công thức liên quan thành ngừng hoạt động; có thể kích hoạt lại trong form sửa.

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
- Báo cáo `orders` xuất một sheet duy nhất, mỗi dòng tương ứng một món trong đơn và lặp lại dữ liệu đơn/khách để hỗ trợ lọc.
- Sheet đơn hàng chỉ gồm thông tin thiết yếu: mã và trạng thái đơn, loại đơn, thông tin liên hệ khách hàng, địa chỉ giao, chi tiết món, phí giao hàng và tổng thanh toán.
- Đơn tại bàn có thêm giá trị lọc dạng `dinein(<số bàn>)`; đơn thiếu số bàn dùng `dinein(chưa xác định)`.

## Logic thông báo khách hàng

- Admin nhập tiêu đề, nội dung, nhóm khách nhận và mức độ thông báo.
- Backend lưu vào collection `notifications`, kèm người tạo, thời điểm gửi và số khách thuộc nhóm nhận tại thời điểm tạo.
- Hiện chưa cần giao diện khách hàng; sau này frontend khách hàng chỉ cần truy vấn collection/API tương ứng để hiển thị.

## File frontend gọi API

| Trang | JavaScript |
|---|---|
| Quản lý tài khoản | `frontend/admin/assets/js/accounts.js` |
| Hồ sơ nhân viên | `frontend/admin/assets/js/staff.js` |
| Báo cáo | `frontend/admin/assets/js/report.js` |
| Quản lý sản phẩm | `frontend/admin/assets/js/products.js` |
| Hàm gọi API chung | `frontend/admin/assets/js/api.js` |

Các thành viên khác có thể sao chép cấu trúc route → middleware/validator → controller → service → repository → model của phần admin, rồi thay model và quyền tương ứng với module của họ.
