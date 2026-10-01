# THIẾT KẾ KIỂM THỬ TÍCH HỢP (INTEGRATION TEST) - CHỨC NĂNG TẠO NHÂN VIÊN MỚI

**Chức năng:** Thêm hồ sơ nhân viên mới vào hệ thống Jollibee  
**Endpoint:** `POST /api/v1/employees`  
**Các thành phần tích hợp tham gia:** `Router (employee.routes.js)` $\rightarrow$ `Security Middleware (authenticate, authorize(ADMIN))` $\rightarrow$ `Controller (employee.controller.js)` $\rightarrow$ `Validator (adminValidators.js)` $\rightarrow$ `Service (employeeService.js)` $\rightarrow$ `Repository (employee.repository.js, database.repository.js)` $\rightarrow$ `Database (MongoDB - Transaction Session, Collection employees, counters, auditlogs)`.

---

### Bước 1: Xác định Điều kiện (Conditions) và Hành động (Actions)

Chức năng **"Thêm nhân viên"** có 4 điều kiện logic chính:

1. **C1 (Auth & Role):** Người dùng có token hợp lệ và có quyền Quản trị viên (`role = "admin"`) không? *(True / False)*
2. **C2 (Payload Valid):** Dữ liệu gửi lên đúng định dạng (Họ tên tiếng Việt chuẩn, SĐT 10 số đầu 03/05/07/08/09, Email đúng định dạng domain cho phép, đủ 16 tuổi, quê quán) không? *(True / False)*
3. **C3 (Phone Unique):** Số điện thoại gửi lên chưa từng tồn tại trong cơ sở dữ liệu? *(True / False)*
4. **C4 (Email Unique):** Email gửi lên chưa từng tồn tại trong cơ sở dữ liệu? *(True / False)*

Hệ thống sẽ phản hồi bằng một trong các hành động (Actions):

- **A1:** Trả về `401 Unauthorized / 403 Forbidden` (Chặn quyền truy cập).
- **A2:** Trả về `400 Bad Request` (Dữ liệu đầu vào không hợp lệ).
- **A3:** Trả về `409 Conflict` (Trùng số điện thoại).
- **A4:** Trả về `409 Conflict` (Trùng Email).
- **A5:** Trả về `201 Created` + Sinh mã `employeeCode` tự động qua `Counter` + Lưu DB qua Transaction + Ghi Audit Log (Thành công).

---

### Bước 2: Bảng quyết định đầy đủ (Full Decision Table)

Với 4 điều kiện nhị phân (Đúng/Sai), về lý thuyết có $2^4 = 16$ tổ hợp quy tắc.

Tuy nhiên, hệ thống xử lý theo luồng từ ngoài vào trong: **nếu bước trước sai thì các bước sau không được duyệt đến**. Ký hiệu `—` (Don't Care) biểu thị điều kiện không cần quan tâm vì đã bị chặn từ trước:

| Thành phần | Điều kiện / Hành động | R1 | R2 | R3 | R4 | R5 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Conditions** | **C1:** Quyền thực thi hợp lệ (`role = "admin"`)? | **F** | **T** | **T** | **T** | **T** |
| | **C2:** Dữ liệu hợp lệ (Tên, SĐT, Email, Tuổi $\ge$ 16, Quê quán)? | — | **F** | **T** | **T** | **T** |
| | **C3:** Số điện thoại chưa tồn tại trong DB (Duy nhất)? | — | — | **F** | **T** | **T** |
| | **C4:** Email chưa tồn tại trong DB (Duy nhất)? | — | — | — | **F** | **T** |
| **Actions** | **A1:** HTTP 401 / 403 Forbidden (Chặn quyền) | **X** | | | | |
| | **A2:** HTTP 400 Bad Request (Dữ liệu sai) | | **X** | | | |
| | **A3:** HTTP 409 Conflict (Trùng số điện thoại) | | | **X** | | |
| | **A4:** HTTP 409 Conflict (Trùng Email) | | | | **X** | |
| | **A5:** HTTP 201 Created (Tạo mã NV + Lưu DB + Audit) | | | | | **X** |
| **Mapping** | **Tương ứng ca kiểm thử** | **IT_EMP_05** | **IT_EMP_04** | **IT_EMP_03** | **IT_EMP_02** | **IT_EMP_01** |

---

### Bước 3: Ma trận kịch bản kiểm thử tích hợp (Integration Test Matrix)

| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào (Input) | Kết quả kỳ vọng (Expected) | Kết quả thực tế (Actual) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IT_EMP_01** | Thêm nhân viên thành công | Dữ liệu chuẩn (Họ tên, SĐT, Email mới, Tuổi $\ge$ 16, Quê quán), Token Admin hợp lệ | HTTP 201; Tự sinh mã NV (NVxxxx); Dữ liệu lưu đúng vào bảng `employees` trong DB; Ghi nhận audit log | HTTP 201; Bản ghi mới tạo có mã NV0001 trong DB; Sinh 1 bản ghi log `"employee.create"` | **PASS** |
| **IT_EMP_02** | Bị chặn do trùng Email trong DB | Email `admin@example.com` đã có sẵn trong bảng `employees` | HTTP 409 Conflict; Báo lỗi trùng Email; DB không tăng thêm bản ghi nào; Rollback giao dịch | HTTP 409 Conflict; Báo "Email này đã được sử dụng."; Số lượng record trong DB giữ nguyên | **PASS** |
| **IT_EMP_03** | Bị chặn do trùng Số điện thoại trong DB | SĐT `0912345678` đã có sẵn trong bảng `employees` | HTTP 409 Conflict; Báo lỗi trùng SĐT; DB không lưu rác | HTTP 409 Conflict; Báo "Số điện thoại này đã được sử dụng."; DB rollback an toàn | **PASS** |
| **IT_EMP_04** | Lỗi Validation từ Controller / Validator | Họ tên chứa ký tự đặc biệt, SĐT không đúng 10 số, Ngày sinh chưa đủ 16 tuổi | HTTP 400 Bad Request; Chặn ngay ở tầng ngoài, không truy vấn DB | HTTP 400 Bad Request; Trả về danh sách chi tiết các trường lỗi validate | **PASS** |
| **IT_EMP_05** | Chặn truy cập không đủ quyền | Gửi request không kèm Cookie Token Admin hoặc User chỉ có role Staff (Cashier/Kitchen/Shipper) | HTTP 401/403; Chặn tại Filter/Middleware bảo mật (`authenticate` / `authorize`) | HTTP 403 Forbidden; Không chạm vào tầng Service | **PASS** |
