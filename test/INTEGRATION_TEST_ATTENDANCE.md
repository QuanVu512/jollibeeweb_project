# THIẾT KẾ KIỂM THỬ TÍCH HỢP (INTEGRATION TEST) - CHỨC NĂNG CHẤM CÔNG (ATTENDANCE & KIOSK)

**Chức năng:** Ghi nhận chấm công vào/ra (IN/OUT) tại Kiosk, duyệt ngoại lệ, kiểm soát ca và xuất hóa đơn Word  
**Endpoint:** `POST /api/v1/admin/attendance/scan` & `POST /api/v1/admin/attendance/exceptions`  
**Các thành phần tích hợp tham gia:** `Router (attendance.routes.js)` $\rightarrow$ `Security Middleware (authenticate, authorize(ADMIN))` $\rightarrow$ `Controller (attendance.controller.js)` $\rightarrow$ `Validator (attendanceValidators.js)` $\rightarrow$ `Service (attendanceService.js, shiftService.js, attendanceBillService.js, auditService.js)` $\rightarrow$ `Repository (attendance.repository.js, shift.repository.js, database.repository.js)` $\rightarrow$ `Database (MongoDB - Transaction Session, Collection attendancesessions, employees, employeeshifts, auditlogs)`.

---

### Bước 1: Xác định Điều kiện (Conditions) và Hành động (Actions)

Chức năng **"Chấm công Kiosk"** có 5 điều kiện logic chính:

1. **C1 (Auth & Role):** Người dùng có token hợp lệ và có quyền Quản trị viên / Thiết bị Kiosk (`role = "admin"`)? *(True / False)*
2. **C2 (Payload & Employee Valid):** Dữ liệu gửi lên đúng định dạng (Mã NV dạng `NV0001`, `requestId` chuẩn UUID v4), nhân viên tồn tại và đang làm việc (`isActive = true`)? *(True / False)*
3. **C3 (Cooldown Passed):** Đã qua thời gian chờ tối thiểu giữa 2 lần quét liên tiếp của cùng một nhân viên ($\ge$ 60 giây)? *(True / False)*
4. **C4 (No Unclosed Past Session):** Nhân viên không có phiên công ngày hôm trước còn đang mở (chưa Check-out)? *(True / False)*
5. **C5 (In Shift Window / Exception Approved):** Thời gian quét nằm trong khung giờ ca hợp lệ ($\pm$ 30 phút trước ca đến hết giờ ca) hoặc đã được quản lý phê duyệt ngoại lệ / ca OT? *(True / False)*

Hệ thống sẽ phản hồi bằng một trong các hành động (Actions):

- **A1:** Trả về `401 Unauthorized / 403 Forbidden` (Chặn quyền truy cập).
- **A2:** Trả về `400 Bad Request / 404 Not Found` (Mã không đúng định dạng hoặc nhân viên không tồn tại / đã nghỉ việc).
- **A3:** Trả về `429 Too Many Requests` (Chặn do quét quá nhanh, báo số giây cần chờ cooldown).
- **A4:** Trả về `409 Conflict` kèm mã lỗi `UNCLOSED_SESSION` (Yêu cầu xử lý phiên cũ ngày trước trước khi quét mới).
- **A5:** Trả về `409 Conflict` kèm mã lỗi `APPROVAL_REQUIRED` (Ngoài khung giờ ca, yêu cầu chọn ca duyệt ngoại lệ hoặc duyệt OT).
- **A6:** Trả về `200/201 OK` + Tạo mới/Đóng phiên công trong `attendancesessions` + Cập nhật thời điểm `lastAttendanceAt` của nhân viên + Khởi tạo snapshot bill Word (.docx) + Ghi Audit Log (Thành công).

---

### Bước 2: Bảng quyết định đầy đủ (Full Decision Table)

Với 5 điều kiện nhị phân (Đúng/Sai), về lý thuyết có $2^5 = 32$ tổ hợp quy tắc.

Hệ thống xử lý theo luồng từ ngoài vào trong: **nếu bước trước sai thì các bước sau không được duyệt đến**. Ký hiệu `—` (Don't Care) biểu thị điều kiện không cần quan tâm vì đã bị chặn từ các tầng kiểm tra trước đó:

| Thành phần | Điều kiện / Hành động | R1 | R2 | R3 | R4 | R5 | R6 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Conditions** | **C1:** Quyền thực thi hợp lệ (`role = "admin"`)? | **F** | **T** | **T** | **T** | **T** | **T** |
| | **C2:** Mã NV và requestId hợp lệ, nhân viên đang làm việc? | — | **F** | **T** | **T** | **T** | **T** |
| | **C3:** Đã qua thời gian Cooldown giữa 2 lần quét ($\ge$ 60s)? | — | — | **F** | **T** | **T** | **T** |
| | **C4:** Không còn phiên mở thiếu giờ ra từ ngày hôm trước? | — | — | — | **F** | **T** | **T** |
| | **C5:** Quét trong khung ca hợp lệ hoặc đã duyệt ngoại lệ / OT? | — | — | — | — | **F** | **T** |
| **Actions** | **A1:** HTTP 401 / 403 Forbidden (Chặn quyền) | **X** | | | | | |
| | **A2:** HTTP 400 Bad Request / 404 Not Found (Sai định dạng/Không tồn tại) | | **X** | | | | |
| | **A3:** HTTP 429 Too Many Requests (Vi phạm Cooldown) | | | **X** | | | |
| | **A4:** HTTP 409 Conflict (`UNCLOSED_SESSION` - Thiếu giờ ra cũ) | | | | **X** | | |
| | **A5:** HTTP 409 Conflict (`APPROVAL_REQUIRED` - Ngoài khung ca) | | | | | **X** | |
| | **A6:** HTTP 200/201 OK (Ghi nhận IN/OUT + Tạo Bill Word + Audit Log) | | | | | | **X** |
| **Mapping** | **Tương ứng ca kiểm thử** | **IT_ATT_07** | **IT_ATT_06** | **IT_ATT_03** | **IT_ATT_04** | **IT_ATT_05** | **IT_ATT_01, IT_ATT_02** |

---

### Bước 3: Ma trận kịch bản kiểm thử tích hợp (Integration Test Matrix)

| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào (Input) | Kết quả kỳ vọng (Expected) | Kết quả thực tế (Actual) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IT_ATT_01** | Quét Check-in (IN) thành công đúng ca làm việc | Mã NV `NV0001`, `requestId` UUID mới, thời gian quét trước ca 10 phút, có ca được phân hôm nay | HTTP 200/201; Tạo phiên mới với trạng thái `OPEN`, hành động `IN`; Trả về snapshot hóa đơn Word; Cập nhật `lastAttendanceAt` của nhân viên; Ghi nhận 1 bản ghi audit log `"attendance.checkIn"` | HTTP 200; Phiên mới được tạo trong `attendancesessions` với `action: "IN"`; Sinh snapshot bill Word và audit log thành công | **PASS** |
| **IT_ATT_02** | Quét Check-out (OUT) thành công kết thúc ca | Mã NV `NV0001`, đang có phiên `OPEN` trong ngày, thời gian quét sau giờ Check-in | HTTP 200; Chuyển trạng thái phiên từ `OPEN` sang `CLOSED`, hành động `OUT`; Tự động đánh giá số giờ làm, đi trễ, về sớm; Cập nhật tổng số giờ làm trong tuần vào bill Word; Ghi nhận audit log `"attendance.checkOut"` | HTTP 200; Phiên chuyển sang `CLOSED`; Tính đúng số giờ ca và tổng giờ tuần; Cập nhật bản ghi audit log an toàn | **PASS** |
| **IT_ATT_03** | Bị chặn do vi phạm thời gian Cooldown giữa 2 lần quét | Mã NV `NV0001` vừa quét xong cách đây 20 giây (dưới ngưỡng 60 giây) | HTTP 429 Too Many Requests; Trả về thông báo kèm số giây còn lại cần chờ (`retryAfterSeconds`); Không làm thay đổi trạng thái phiên công trong DB | HTTP 429; Báo lỗi "vui lòng đợi ... giây"; DB không phát sinh bản ghi rác | **PASS** |
| **IT_ATT_04** | Bị chặn do còn phiên công ngày hôm trước chưa đóng | Mã NV `NV0001` có 1 phiên `OPEN` từ ngày hôm qua chưa ghi nhận giờ ra | HTTP 409 Conflict; Trả về mã lỗi `UNCLOSED_SESSION` kèm ngày công còn thiếu; Chặn không cho mở phiên mới cho đến khi phiên cũ được xử lý | HTTP 409; Báo lỗi thiếu giờ ra ngày cũ; Hệ thống bảo vệ tính toàn vẹn dữ liệu ca làm | **PASS** |
| **IT_ATT_05** | Yêu cầu phê duyệt ngoại lệ khi quét ngoài khung giờ ca | Mã NV `NV0001` quét trước ca hơn 30 phút hoặc không có lịch ca phân trước trong ngày | HTTP 409 Conflict; Trả về mã lỗi `APPROVAL_REQUIRED` kèm danh sách ca làm việc khả dụng để quản trị viên lựa chọn duyệt | HTTP 409; Báo "Ngoài khung giờ ca. Chọn ca cần ghi nhận hoặc duyệt OT."; Trả về danh sách assignments để Kiosk hiển thị nút duyệt | **PASS** |
| **IT_ATT_06** | Duyệt ngoại lệ chọn ca hoặc duyệt làm thêm giờ (OT) thành công | Gửi request đến `/exceptions` với `mode = "SHIFT"` (chọn ca ngoài giờ) hoặc `mode = "OT"` (duyệt làm thêm giờ đến 22:00) kèm lý do phê duyệt | HTTP 200/201; Tạo phiên công với loại tương ứng (`REGULAR` hoặc `OT`); Ghi nhận thông tin người duyệt và lý do duyệt vào `approval`; Sinh bill Word; Ghi audit log `"attendance.approveException"` hoặc `"attendance.approveOT"` | HTTP 200; Phiên công được tạo đúng loại; Lưu đầy đủ lý do phê duyệt và người duyệt vào cơ sở dữ liệu | **PASS** |
| **IT_ATT_07** | Chặn truy cập không đủ quyền Admin/Kiosk | Gửi request không có token hoặc token thuộc vai trò không được phép (Khách hàng, Thu ngân, Bếp, Shipper) | HTTP 401 / 403 Forbidden; Bị chặn ngay tại middleware xác thực và phân quyền, không chạm vào nghiệp vụ chấm công | HTTP 401/403; Trả về thông báo từ chối truy cập; Bảo vệ an toàn dữ liệu chấm công Kiosk | **PASS** |
| **IT_ATT_08** | Chống gửi lặp yêu cầu qua cơ chế Replay Idempotent (`requestId`) | Gửi lại cùng một `requestId` với nội dung không đổi sau khi quét thành công | HTTP 200; Trả về trực tiếp kết quả đã lưu trong audit log trước đó mà không thực hiện trừ/cộng thêm phiên mới trong DB | HTTP 200; Kết quả trả về giống hệt lần đầu; Số lượng phiên chấm công trong DB không đổi | **PASS** |
