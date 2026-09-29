# Backend phần Admin

Phần này mô tả các chức năng quản trị đã chuyển sang Express.js:

1. Quản lý hồ sơ nhân viên.
2. Quản lý tài khoản và phân vai trò nhân viên.
3. Báo cáo thống kê và xuất Excel.
4. Quản lý sản phẩm và công thức tiêu hao nguyên liệu.
5. Quản lý ca mẫu và phân ca làm việc theo ngày.
6. Chấm công Kiosk, duyệt ngoại lệ/OT, xuất hóa đơn Word (IN/OUT), điều chỉnh công và truy vết lịch sử ghi nhận.

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
| Điều phối báo cáo | `backend/src/controllers/report.controller.js` |
| Nghiệp vụ thống kê và xuất Excel | `backend/src/services/reportService.js` |
| Tiện ích thời gian và chuỗi báo cáo | `backend/src/utils/reportTime.js` |
| Model đơn dùng cho báo cáo | `backend/src/models/Order.js` |
| Route thông báo khách hàng | `backend/src/routes/notification.routes.js` |
| Logic gửi thông báo khách hàng | `backend/src/controllers/notification.controller.js` |
| Model thông báo khách hàng | `backend/src/models/Notification.js` |
| Route quản lý sản phẩm | `backend/src/routes/adminProduct.routes.js` |
| Điều phối quản lý sản phẩm | `backend/src/controllers/adminProduct.controller.js` |
| Nghiệp vụ quản lý sản phẩm | `backend/src/services/adminProductService.js` |
| Model sản phẩm/công thức | `backend/src/models/Product.js`, `backend/src/models/Recipe.js` |
| Route chấm công & phân ca | `backend/src/routes/attendance.routes.js` |
| Điều phối chấm công & phân ca | `backend/src/controllers/attendance.controller.js` |
| Nghiệp vụ ca làm việc | `backend/src/services/shiftService.js` |
| Nghiệp vụ chấm công & phiên làm | `backend/src/services/attendanceService.js` |
| Nghiệp vụ hóa đơn Word (.docx) | `backend/src/services/attendanceBillService.js` |
| Repository ca làm việc | `backend/src/repositories/shift.repository.js` |
| Repository chấm công | `backend/src/repositories/attendance.repository.js` |
| Model ca mẫu | `backend/src/models/ShiftTemplate.js` |
| Model lịch ca nhân viên | `backend/src/models/EmployeeShift.js` |
| Model phiên chấm công | `backend/src/models/AttendanceSession.js` |
| Kiểm tra dữ liệu đầu vào | `backend/src/validators/adminValidators.js`, `backend/src/validators/productValidators.js`, `backend/src/validators/attendanceValidators.js` |
| Tiện ích thời gian ca & công | `backend/src/utils/attendanceTime.js` |
| Tiện ích định dạng hóa đơn Word | `backend/src/utils/attendanceBill.js` |
| Hằng số nghiệp vụ chấm công | `backend/src/constants/attendance.js` |
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
| `GET` | `/reports/summary` | Doanh thu, số đơn hoàn thành, đơn trung bình, chuỗi thời gian, top 5 món và so sánh kỳ trước |
| `GET` | `/reports/transactions` | Đơn hoàn thành, trạng thái thanh toán, tìm kiếm và phân trang |
| `GET` | `/reports/customers` | Hành vi mua hàng, xếp hạng khách hàng và tổng hợp khách lẻ |
| `GET` | `/reports/export` | Xuất Excel `orders`, `revenue`, `customers` hoặc `items` |
| `GET` | `/notifications` | Danh sách thông báo đã gửi cho khách hàng |
| `POST` | `/notifications` | Lưu thông báo admin gửi cho khách hàng |
| `GET` | `/products` | Danh sách sản phẩm, lọc theo danh mục và trạng thái |
| `GET` | `/products/options` | Danh mục và nguyên liệu dùng trong form sản phẩm |
| `GET` | `/products/:id` | Chi tiết sản phẩm và công thức |
| `POST` | `/products` | Tạo sản phẩm và công thức nguyên liệu |
| `PATCH` | `/products/:id` | Cập nhật sản phẩm, công thức và trạng thái |
| `DELETE` | `/products/:id` | Ngừng hoạt động sản phẩm, không xóa lịch sử |
| `GET` | `/shift-templates` | Danh sách ca mẫu (gồm cả ca đã ngừng) |
| `POST` | `/shift-templates` | Tạo ca mẫu mới (`name`, `startTime`, `endTime`) |
| `PATCH` | `/shift-templates/:id` | Sửa tên, giờ ca hoặc trạng thái hoạt động |
| `GET` | `/employee-shifts` | Danh sách phân ca theo ngày hoặc khoảng ngày |
| `POST` | `/employee-shifts` | Phân ca cho nhân viên theo ngày |
| `PATCH` | `/employee-shifts/:id` | Đổi ngày hoặc ca mẫu của lịch chưa có công |
| `POST` | `/employee-shifts/:id/cancel` | Hủy lịch ca chưa có công kèm lý do |
| `POST` | `/attendance/scan` | Quét mã chấm công IN/OUT tại Kiosk (`employeeCode`, `requestId`) |
| `POST` | `/attendance/exceptions` | Duyệt ngoại lệ chọn ca ngoài giờ hoặc duyệt ca OT |
| `GET` | `/attendance/receipts/:requestId` | Tải file hóa đơn/bill Word `.docx` của lượt chấm công |
| `GET` | `/attendance` | Danh sách bảng công, lọc ngày, nhân viên, trạng thái |
| `GET` | `/attendance/:id` | Chi tiết phiên công và người ghi nhận từng đầu giờ |
| `PATCH` | `/attendance/:id` | Sửa giờ công thủ công kèm lý do và revision |
| `POST` | `/attendance/:id/cancel` | Hủy mềm phiên công kèm lý do và revision |
| `GET` | `/attendance/:id/history` | Xem lịch sử thao tác kiểm toán của phiên công |

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
- Vai trò nhân viên được cấp gồm `admin`, `cashier`, `kitchen`, `shipper`. Cho phép tạo/cập nhật tài khoản với `role: null`; chuỗi rỗng được chuẩn hóa thành `null`, tạo mới không gửi role cũng lưu `null`.
- Tài khoản chưa cấp quyền vẫn liên kết hồ sơ nhân viên và giữ mã chấm công, nhưng đăng nhập trả 403. Cấp/sửa/xóa quyền dùng `PATCH /accounts/:id` với `{ role }`; xóa quyền là đặt role thành null, không thu hồi tài khoản hoặc bỏ liên kết nhân viên.
- Không cho admin tự khóa, tự thu hồi hoặc tự bỏ quyền admin.
- Thu hồi tài khoản là xóa mềm: khóa tài khoản, ghi `revokedAt` và bỏ liên kết nhân viên nhưng vẫn giữ bản ghi phục vụ lịch sử.
- Cấp/thu hồi tài khoản dùng MongoDB transaction để tránh một collection cập nhật thành công còn collection kia thất bại.

## Phiên đăng nhập JWT

- Khi đăng nhập, backend tạo JWT chứa ID tài khoản, vai trò, thời hạn và `tokenVersion`.
- JWT được gửi trong cookie `HttpOnly`, vì vậy JavaScript phía trình duyệt không đọc được token.
- Middleware xác minh chữ ký, thời hạn, người phát hành, đối tượng sử dụng, tài khoản còn hoạt động, đã được cấp quyền và `tokenVersion`.
- JWT không được lưu trực tiếp trong MongoDB. `users.tokenVersion` chỉ dùng để thu hồi token cũ.
- Đăng xuất, khóa/thu hồi tài khoản, đặt lại mật khẩu hoặc thay đổi vai trò sẽ tăng `tokenVersion`; token đã phát trước đó lập tức không còn hợp lệ. Cấp quyền lại không phục hồi phiên cũ; nhân viên cần đăng nhập mới. Lưu vai trò không đổi không tăng tokenVersion.
- Khởi động lại backend không tự hủy JWT còn hạn vì `JWT_SECRET` không thay đổi. Đây là hành vi bình thường của JWT.

## Logic báo cáo

Báo cáo doanh thu và chi tiêu khách hàng tính tất cả đơn `completed` có ngày hoàn thành, không lọc trạng thái thanh toán:

- Tổng doanh thu: tổng `orders.total`.
- Số đơn hoàn thành: đếm đơn trong khoảng ngày hoàn thành đã chọn.
- Giá trị đơn trung bình: doanh thu chia số đơn.
- Tổng tiền đã gồm phí giao hàng và trừ giảm giá; giao diện/Excel không hiển thị giá vốn hoặc lợi nhuận. Các trường giá vốn cũ trong API tổng quan được giữ để tương thích.
- Món bán chạy: cộng `items.quantity` theo món.
- Lọc `from=YYYY-MM-DD`, `to=YYYY-MM-DD` theo ngày hoàn thành, gồm trọn ngày theo giờ Việt Nam; không thay bằng ngày đặt nếu thiếu ngày hoàn thành.
- Tab Giao dịch hiển thị trạng thái thanh toán để tham khảo; đơn hoàn thành chưa thanh toán/hoàn tiền vẫn được cộng vào doanh thu. Bỏ qua tham số `paymentStatus` từ request cũ.
- Nhóm thời gian `groupBy=day|week|month` có kỳ bằng 0; tuần bắt đầu thứ Hai. Kỳ so sánh liền trước có cùng số ngày; không tính phần trăm nếu doanh thu kỳ trước bằng 0.
- Khách hàng được gom theo ID, không theo tên/số điện thoại. Khách lẻ được tổng hợp riêng theo khoảng ngày và không bị lọc bởi tìm kiếm hồ sơ.
- Báo cáo `orders` xuất một sheet duy nhất, mỗi dòng tương ứng một món; phí giao hàng, giảm giá và tổng tiền chỉ điền ở dòng món đầu tiên của mỗi đơn để tránh cộng trùng. Dòng tổng doanh thu cộng tất cả đơn hoàn thành khớp bộ lọc.
- Excel lấy đúng bộ lọc đang áp dụng, xuất toàn bộ dữ liệu ngoài trang hiện tại. Chi tiết API, cách kiểm thử và demo tại [REPORTS.md](REPORTS.md).
- Đơn tại bàn có thêm giá trị lọc dạng `dinein(<số bàn>)`; đơn thiếu số bàn dùng `dinein(chưa xác định)`.

## Logic thông báo khách hàng

- Admin nhập tiêu đề, nội dung, nhóm khách nhận và mức độ thông báo.
- Backend lưu vào collection `notifications`, kèm người tạo, thời điểm gửi và số khách thuộc nhóm nhận tại thời điểm tạo.
- Hiện chưa cần giao diện khách hàng; sau này frontend khách hàng chỉ cần truy vấn collection/API tương ứng để hiển thị.

## Logic phân ca làm việc

- Ca mẫu (`ShiftTemplate`) chỉ hỗ trợ ca trong cùng ngày (`startTime < endTime`), không hỗ trợ ca qua đêm.
- Khi tạo lịch ca (`EmployeeShift`), tên và giờ của ca mẫu được sao chép snapshot vào lịch. Thay đổi ca mẫu sau đó không làm sai lịch đã phân.
- Một nhân viên có thể được phân nhiều ca trong ngày nhưng không được trùng hoặc chồng chéo khung giờ. Hai ca sát giờ nhau được cho phép.
- Lịch phân ca đã có chấm công (kể cả phiên công sau đó bị hủy mềm) không được sửa hoặc hủy, nhằm đảm bảo tính toàn vẹn của lịch sử chấm công.

## Logic chấm công Kiosk và duyệt ngoại lệ

- Toàn bộ thời gian xử lý dựa trên giờ máy chủ và múi giờ `Asia/Ho_Chi_Minh`, lưu trữ timestamp chuẩn UTC.
- Nhân viên đang làm việc có thể chấm công ngay cả khi chưa được cấp tài khoản hệ thống (dùng mã `employeeCode` trong hồ sơ `Employee`).
- Tự động nhận diện vào/ra:
  - Nếu hôm nay nhân viên đang có phiên `OPEN`: lượt quét tiếp theo tự động tính là giờ ra (`OUT`).
  - Nếu chưa có phiên: tự động tìm ca chưa chấm công trong cửa sổ hợp lệ (từ 30 phút trước giờ bắt đầu đến trước giờ kết thúc ca). Nếu có nhiều ca phù hợp, ưu tiên ca bắt đầu sớm nhất.
- Ân hạn vào ca: 15 phút tính từ giờ bắt đầu ca. Đến hết 15 phút vẫn tính đúng giờ (`ON_TIME`). Quá 15 phút tính muộn (`LATE`) từ thời điểm bắt đầu ca, làm tròn lên phút.
- Đánh giá giờ ra: Ra trước giờ kết thúc ca tính về sớm (`EARLY_LEAVE`). Giờ vào và giờ ra đánh giá độc lập.
- Cooldown an toàn: 60 giây kể từ lượt quét hoặc phê duyệt thành công gần nhất, áp dụng toàn hệ thống (mọi thiết bị, mọi quản trị viên). Quét lỗi không gia hạn cooldown.
- Chặn phiên mở ngày trước: Nếu nhân viên có phiên `OPEN` từ ngày hôm trước chưa đóng, Kiosk lập tức chặn quét và cung cấp liên kết để admin bổ sung giờ ra hoặc hủy phiên cũ trước khi cho quét tiếp.
- Phê duyệt ngoại lệ & OT:
  - Quét ngoài khung giờ ca: Quản lý chọn ca chưa chấm công trong ngày và nhập lý do, hoặc duyệt ca làm thêm ngoài giờ (OT).
  - Ca OT: Yêu cầu lý do và giờ kết thúc dự kiến trong ngày (sau thời điểm duyệt). Giờ vào tính từ lúc duyệt, không tính muộn; đánh giá về sớm so với giờ kết thúc OT.
- Sửa & Hủy công: Sửa công cần lý do bắt buộc, số `revision` khớp database (optimistic locking), giờ ra sau giờ vào, không thuộc tương lai và không chồng phiên khác. Hủy là xóa mềm (`state = CANCELLED`), giữ dữ liệu gốc, người hủy và lý do.
- Đảm bảo tính nguyên tử (Transaction): Phiên công, cooldown nhân viên (`lastAttendanceAt`, `attendanceRevision`) và bản ghi audit log được ghi nhận đồng thời trong MongoDB transaction. Request kèm `requestId` (UUID) đảm bảo tính idempotent: gửi lại sau sự cố mạng sẽ trả kết quả ban đầu, không đảo IN/OUT.

## Hóa đơn chấm công Word (.docx)

- Mỗi lượt IN hoặc OUT thành công (bao gồm cả ngoại lệ và OT) tự động tạo một hóa đơn Word `.docx` riêng, khổ chuẩn 80 × 125 mm, font Arial đơn sắc.
- Nội dung hóa đơn: Tiêu đề `Employee Clock In/Out`, họ tên, vị trí (`Job`), giờ vào có giây (`Time in`), tổng giờ tuần (`Hours this week`), đường kẻ nét hoa sao `*****************` và dòng ghi chú `Note` kích thước 8 pt.
- Chỉ hóa đơn OUT mới in thêm giờ ra (`Time out`) và thời lượng của riêng ca vừa đóng (`Hours this shift`).
- Tuần làm việc tính từ thứ Hai 00:00 đến thứ Hai kế tiếp theo giờ Việt Nam. Tổng giờ tuần chỉ cộng dồn các phiên `CLOSED` và làm tròn 2 chữ số thập phân khi in.
- Hóa đơn được lưu snapshot cùng audit log, tải bất kỳ lúc nào qua endpoint `/attendance/receipts/:requestId` mà không làm thay đổi nội dung khi hồ sơ/ca sau này bị điều chỉnh. Tải file chạy nền độc lập, không chặn hàng đợi quét Kiosk. Chi tiết xem tại [Tài liệu chấm công](ATTENDANCE.md).

## File frontend gọi API

| Trang | JavaScript / CSS |
|---|---|
| Quản lý tài khoản | `frontend/admin/assets/js/accounts.js`, `frontend/admin/assets/css/accounts.css` (`frontend/admin/accounts.html`) |
| Hồ sơ nhân viên | `frontend/admin/assets/js/staff.js` (`frontend/admin/staff.html`) |
| Báo cáo thống kê | `frontend/admin/assets/js/report.js`, `frontend/admin/assets/js/report-charts.js`, `frontend/admin/assets/css/report.css` (`frontend/admin/report.html`) |
| Quản lý sản phẩm | `frontend/admin/assets/js/products.js` (`frontend/admin/products.html`) |
| Phân ca làm việc | `frontend/admin/assets/js/shifts.js` (`frontend/admin/shifts.html`) |
| Chấm công & lịch sử | `frontend/admin/assets/js/attendance.js` (`frontend/admin/attendance.html`) |
| Kiosk chấm công | `frontend/admin/assets/js/kiosk.js`, `frontend/admin/assets/js/scan-queue.js` (`frontend/admin/kiosk.html`) |
| Tiện ích chấm công & tải bill | `frontend/admin/assets/js/attendance-common.js`, `frontend/admin/assets/js/attendance-bills.js` |
| Giao diện CSS chấm công | `frontend/admin/assets/css/attendance.css` |
| Hàm gọi API chung | `frontend/admin/assets/js/api.js` |

Các thành viên khác có thể sao chép cấu trúc route → middleware/validator → controller → service → repository → model của phần admin, rồi thay model và quyền tương ứng với module của họ.
