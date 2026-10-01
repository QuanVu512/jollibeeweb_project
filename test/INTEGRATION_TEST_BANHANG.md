# THIẾT KẾ KIỂM THỬ TÍCH HỢP (INTEGRATION TEST) - CHỨC NĂNG XÁC NHẬN & ĐIỀU PHỐI ĐƠN HÀNG

**Chức năng:** Xác nhận đơn hàng và in hóa đơn chuyển bếp  
**Endpoint:** `PATCH /api/v1/banhang/orders/:id/accept`  
**Các thành phần tích hợp tham gia:** `Giao diện Quản lý đơn hàng (quan_ly_don_hang.html)` $\rightarrow$ `Router (banhang.routes.js)` $\rightarrow$ `Security Middleware (authenticate, authorize(CASHIER, ADMIN))` $\rightarrow$ `Controller (banhang.controller.js)` $\rightarrow$ `Service (banhangService.js, inventoryRecipeService.js)` $\rightarrow$ `Repository (order.repository.js, database.repository.js)` $\rightarrow$ `Database (MongoDB - Transaction Session, Collection orders, inventories, stockhistories, auditlogs)`.

---

### Bước 1: Xác định Điều kiện (Conditions) và Hành động (Actions)

Chức năng **"Xác nhận đơn hàng và in hóa đơn"** có 4 điều kiện logic chính:

1. **C1 (Authentication & Role):** Người dùng có token hợp lệ và có quyền Thu ngân hoặc Quản trị viên (`role = "cashier"` hoặc `"admin"`) không? *(True / False)*
2. **C2 (Order Status):** Đơn hàng có tồn tại và đang ở trạng thái "Chờ duyệt" (`status = "pending"`) không? *(True / False)*
3. **C3 (Stock Sufficiency):** Kho bếp có đủ nguyên liệu định lượng để chế biến các món trong đơn hàng không? *(True / False)*
4. **C4 (Transaction & Invoice):** Quá trình trừ kho, chuyển trạng thái sang "Đang chuẩn bị", đánh dấu in hóa đơn và thanh toán được thực hiện đồng thời trong Transaction thành công không? *(True / False)*

Hệ thống sẽ phản hồi bằng một trong các hành động (Actions):

- **A1:** Trả về `401 Unauthorized / 403 Forbidden` (Chặn quyền truy cập).
- **A2:** Trả về `400 Bad Request / 404 Not Found` (Đơn hàng không hợp lệ hoặc sai trạng thái).
- **A3:** Trả về thông báo thành công kèm cảnh báo thiếu định lượng kho (chỉ trừ phần có công thức, ghi chú lên đơn).
- **A4:** Trả về lỗi 500 / Ngoại lệ hệ thống, rollback giao dịch để giữ nguyên vẹn dữ liệu kho và đơn hàng.
- **A5:** Trả về `200 OK` + Chuyển trạng thái đơn sang "Đang chuẩn bị" (preparing) + Đánh dấu đã in hóa đơn + Trừ kho nguyên liệu thành công + Lưu lịch sử trạng thái.

---

### Bước 2: Bảng quyết định đầy đủ (Full Decision Table)

| Thành phần | Điều kiện / Hành động | R1 | R2 | R3 | R4 | R5 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Conditions** | **C1:** Quyền thực thi hợp lệ (`role = "cashier"` / `"admin"`)? | **F** | **T** | **T** | **T** | **T** |
| | **C2:** Đơn hàng ở trạng thái Chờ duyệt (`pending`)? | — | **F** | **T** | **T** | **T** |
| | **C3:** Kho đủ nguyên liệu chế biến món ăn? | — | — | **F** | **T** | **T** |
| | **C4:** Transaction trừ kho và in hóa đơn thành công? | — | — | — | **F** | **T** |
| **Actions** | **A1:** HTTP 401 / 403 Forbidden (Chặn quyền) | **X** | | | | |
| | **A2:** HTTP 400 Bad Request (Sai trạng thái đơn) | | **X** | | | |
| | **A3:** HTTP 200 / Warning (Cảnh báo thiếu định lượng kho) | | | **X** | | |
| | **A4:** HTTP 500 / Rollback (Giao dịch thất bại, giữ nguyên DB) | | | | **X** | |
| | **A5:** HTTP 200 Created/OK (Duyệt đơn, trừ kho, chuyển bếp) | | | | | **X** |
| **Mapping** | **Tương ứng ca kiểm thử** | **IT_POS_05** | **IT_POS_04** | **IT_POS_03** | **IT_POS_02** | **IT_POS_01** |

---

### Bước 3: Ma trận kịch bản kiểm thử tích hợp (Integration Test Matrix)

| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào (Input) | Kết quả kỳ vọng (Expected) | Kết quả thực tế (Actual) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **IT_POS_01** | Xác nhận đơn thành công và in hóa đơn chuyển bếp | Đơn hàng tồn tại ở trạng thái "pending"; Kho đủ nguyên liệu; Token vai trò Thu ngân (cashier) hợp lệ. | HTTP 200 OK; Đơn chuyển sang "preparing"; Đánh dấu isInvoicePrinted = true; Trừ nguyên liệu kho tương ứng; Ghi nhận lịch sử trạng thái. | HTTP 200; Đơn hàng cập nhật thành công, hóa đơn được tạo và chuyển xuống màn hình bếp chế biến. | **PASS** |
| **IT_POS_02** | Rollback giao dịch khi quá trình trừ kho gặp lỗi | Đơn hàng "pending" hợp lệ; Token thu ngân hợp lệ; Giả lập lỗi kết nối DB khi đang trừ kho nguyên liệu. | HTTP 500 / Exception; Toàn bộ Transaction bị rollback; Trạng thái đơn giữ nguyên "pending"; Số lượng tồn kho không bị trừ sai lệch. | Hệ thống tự động hủy giao dịch, trạng thái đơn và tồn kho được bảo toàn nguyên vẹn an toàn. | **PASS** |
| **IT_POS_03** | Cảnh báo khi món ăn chưa đủ công thức định lượng kho | Đơn có 1 món chưa cấu hình định lượng kho; Token thu ngân hợp lệ; Đơn ở trạng thái "pending". | HTTP 200; Đơn vẫn được duyệt sang "preparing"; Trả về warning cảnh báo các món chưa trừ kho và ghi chú vào đơn. | HTTP 200; Đơn được chuyển bếp kèm thông báo toast cảnh báo món thiếu công thức định lượng. | **PASS** |
| **IT_POS_04** | Chặn xác nhận khi đơn không ở trạng thái pending | Đơn hàng đã được duyệt trước đó (đang "preparing" hoặc đã "cancelled"); Token thu ngân hợp lệ. | HTTP 400 Bad Request; Báo lỗi đơn không ở trạng thái chờ duyệt; Dữ liệu đơn hàng không thay đổi. | HTTP 400 Bad Request; Báo "Đơn hàng này không ở trạng thái chờ duyệt."; DB giữ nguyên. | **PASS** |
| **IT_POS_05** | Chặn truy cập khi không có quyền thu ngân hoặc admin | Gửi request không kèm Token xác thực hoặc Token mang vai trò Shipper/Kitchen. | HTTP 401/403; Chặn ngay tại Middleware bảo mật (authenticate / authorize); Không gọi vào tầng Service xử lý. | HTTP 403 Forbidden; Chặn thao tác thành công, không chạm vào nghiệp vụ bán hàng. | **PASS** |
