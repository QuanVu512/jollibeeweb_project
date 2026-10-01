# THIẾT KẾ KIỂM THỬ TÍCH HỢP (INTEGRATION TEST) - CHỨC NĂNG ĐĂNG NHẬP

**Chức năng:** Đăng nhập hệ thống quản trị Jollibee  
**Endpoint:** `POST /api/v1/auth/login`  
**Các thành phần tích hợp tham gia:** `Router (auth.routes.js)` $\rightarrow$ `RateLimiter Middleware` $\rightarrow$ `Controller (auth.controller.js)` $\rightarrow$ `Service (authService.js)` $\rightarrow$ `Repository (user.repository.js)` $\rightarrow$ `Database (MongoDB - Collection users, auditlogs)` $\rightarrow$ `JWT & Cookie Parser`.

---

### Bước 1: Xác định Điều kiện (Conditions) và Hành động (Actions)

Chức năng **"Đăng nhập"** có 5 điều kiện logic chính:

1. **C1 (Payload Valid):** Dữ liệu gửi lên có đầy đủ tên đăng nhập và mật khẩu (chuỗi không rỗng) không? *(True / False)*
2. **C2 (User Exists):** Tên đăng nhập gửi lên có tồn tại trong cơ sở dữ liệu không? *(True / False)*
3. **C3 (Password Match):** Mật khẩu gửi lên có trùng khớp với mật khẩu đã mã hóa (Bcrypt Hash) trong DB không? *(True / False)*
4. **C4 (Account Active):** Tài khoản có đang ở trạng thái hoạt động (`isActive = true`) không? *(True / False)*
5. **C5 (Role Assigned):** Tài khoản đã được cấp vai trò đăng nhập hợp lệ (`role` khác null) không? *(True / False)*

Hệ thống sẽ phản hồi bằng một trong các hành động (Actions):

- **A1:** Trả về `400 Bad Request` (Dữ liệu không hợp lệ / thiếu thông tin đăng nhập).
- **A2:** Trả về `401 Unauthorized` (Tài khoản không tồn tại trong hệ thống).
- **A3:** Trả về `401 Unauthorized` (Mật khẩu không chính xác).
- **A4:** Trả về `403 Forbidden` (Tài khoản đã bị khóa).
- **A5:** Trả về `403 Forbidden` (Tài khoản chưa được phân quyền đăng nhập).
- **A6:** Trả về `200 OK` + Ký JWT Token + Thiết lập HttpOnly Cookie + Cập nhật `lastLoginAt` vào DB + Ghi Audit Log (Đăng nhập thành công).

---

### Bước 2: Bảng quyết định đầy đủ (Full Decision Table)

Với 5 điều kiện nhị phân (Đúng/Sai), về lý thuyết có $2^5 = 32$ tổ hợp quy tắc.

Tuy nhiên, hệ thống xử lý theo luồng từ ngoài vào trong: **nếu bước trước sai thì các bước sau không được duyệt đến**. Ký hiệu `—` (Don't Care) biểu thị điều kiện không cần quan tâm vì đã bị chặn từ trước:

| Thành phần | Điều kiện / Hành động | R1 | R2 | R3 | R4 | R5 | R6 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Conditions** | **C1:** Dữ liệu hợp lệ (Username & Password không rỗng)? | **F** | **T** | **T** | **T** | **T** | **T** |
| | **C2:** Tên đăng nhập tồn tại trong hệ thống? | — | **F** | **T** | **T** | **T** | **T** |
| | **C3:** Mật khẩu trùng khớp với dữ liệu đã băm (Bcrypt)? | — | — | **F** | **T** | **T** | **T** |
| | **C4:** Tài khoản đang hoạt động (`isActive = true`)? | — | — | — | **F** | **T** | **T** |
| | **C5:** Tài khoản đã được cấp vai trò (`role` hợp lệ)? | — | — | — | — | **F** | **T** |
| **Actions** | **A1:** HTTP 400 Bad Request | **X** | | | | | |
| | **A2:** HTTP 401 Unauthorized (Sai User) | | **X** | | | | |
| | **A3:** HTTP 401 Unauthorized (Sai Password) | | | **X** | | | |
| | **A4:** HTTP 403 Forbidden (Tài khoản bị khóa) | | | | **X** | | |
| | **A5:** HTTP 403 Forbidden (Chưa cấp quyền) | | | | | **X** | |
| | **A6:** HTTP 200 OK (JWT + Cookie + Cập nhật DB) | | | | | | **X** |
| **Mapping** | **Tương ứng ca kiểm thử** | **IT_AUTH_04** | **IT_AUTH_02** | **IT_AUTH_03** | **IT_AUTH_05** | **IT_AUTH_06** | **IT_AUTH_01** |

---

### Bước 3: Ma trận kịch bản kiểm thử tích hợp (Integration Test Matrix)

| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào (Input) | Kết quả kỳ vọng (Expected) | Kết quả thực tế (Actual) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IT_AUTH_01** | Đăng nhập thành công | Username "admin01", Password "AdminPass@123", tài khoản hoạt động và có vai trò admin | HTTP 200; Thiết lập HttpOnly Cookie `jollibee_admin_token` chứa JWT; Cập nhật `lastLoginAt` trong DB; Ghi audit log | HTTP 200; Header Set-Cookie chứa JWT token hợp lệ; DB cập nhật `lastLoginAt`; Sinh 1 bản ghi audit log `"user.login"` | **PASS** |
| **IT_AUTH_02** | Bị chặn do tên đăng nhập không tồn tại | Username "khong_ton_tai", Password "Pass@123" | HTTP 401 Unauthorized; Báo sai tài khoản hoặc mật khẩu; Không cấp cookie/token; DB giữ nguyên | HTTP 401 Unauthorized; Trả về thông báo "Tên đăng nhập hoặc mật khẩu không chính xác."; Không sinh token | **PASS** |
| **IT_AUTH_03** | Bị chặn do sai mật khẩu | Username "admin01", Password "MatKhauSai@999" | HTTP 401 Unauthorized; So sánh mã băm Bcrypt thất bại; Không tạo session; DB không đổi | HTTP 401 Unauthorized; Trả về thông báo "Tên đăng nhập hoặc mật khẩu không chính xác."; Không cấp quyền | **PASS** |
| **IT_AUTH_04** | Lỗi Validation để trống thông tin | Username hoặc Password để trống ("") | HTTP 400 Bad Request; Chặn ngay tại tầng ngoài, không truy vấn kiểm tra mật khẩu trong DB | HTTP 400 Bad Request; Trả về thông báo "Vui lòng nhập tên đăng nhập và mật khẩu." | **PASS** |
| **IT_AUTH_05** | Chặn đăng nhập tài khoản bị khóa | Username "khoa_user", đúng mật khẩu nhưng tài khoản có `isActive = false` trong DB | HTTP 403 Forbidden; Báo tài khoản đã bị khóa; Không phát hành token | HTTP 403 Forbidden; Trả về thông báo "Tài khoản đã bị khóa."; Không sinh phiên làm việc | **PASS** |
| **IT_AUTH_06** | Chặn đăng nhập tài khoản chưa cấp vai trò | Username "chuacapquyen", đúng mật khẩu nhưng `role = null` trong DB | HTTP 403 Forbidden; Báo tài khoản chưa được phân quyền đăng nhập | HTTP 403 Forbidden; Trả về thông báo "Tài khoản chưa được cấp quyền đăng nhập. Vui lòng liên hệ quản trị viên." | **PASS** |
| **IT_AUTH_07** | Chặn brute-force quá giới hạn Rate Limit | Gửi liên tiếp 11 request đăng nhập sai từ cùng 1 địa chỉ IP trong vòng dưới 15 phút | HTTP 429 Too Many Requests; Chặn ngay từ Middleware loginLimiter, không gọi Controller | HTTP 429 Too Many Requests; Trả về thông báo "Bạn đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút." | **PASS** |
