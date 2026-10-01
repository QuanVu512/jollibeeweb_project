# BẢNG TEST CASE KIỂM THỬ ĐƠN VỊ (UNIT TEST) - ATTENDANCE SERVICE (CHẤM CÔNG & KIOSK)

**Đối tượng kiểm thử:** Lớp dịch vụ chấm công thực tế, Kiosk quét mã, duyệt ngoại lệ/OT và hiệu chỉnh công (`attendanceService.js`)  
**Công nghệ sử dụng:** Node.js Native Test Runner (`node:test`, `node:assert/strict`)  
**Tập tin thực thi kiểm thử:** [testAttendanceService.js](file:///c:/Users/Admin/Documents/jollibee_project/test/services/admin/testAttendanceService.js)  

---

| Mã TC | Lớp / Phương thức | Trường hợp kiểm thử (Mục tiêu) | Dữ liệu đầu vào (Input / Mock) | Kết quả kỳ vọng (Expected Output) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UT_ATT_01** | `scan` | Check-in (IN) thành công khi quét đúng khung giờ ca được phân | - Mã NV: "NV0001", requestId: UUID hợp lệ<br>- Mock: Thời điểm quét 07:50 (trước giờ ca 08:00 10 phút), chưa có phiên mở hôm nay | Trả về kết quả ghi nhận `action: "IN"`, tạo phiên mới trạng thái `OPEN`, sinh snapshot hóa đơn Word. | Pass |
| **UT_ATT_02** | `scan` | Check-out (OUT) thành công cho phiên công đang mở trong ngày | - Mã NV: "NV0001", requestId: UUID hợp lệ<br>- Mock: Thời điểm quét 16:05, đang có phiên `OPEN` từ 07:55 | Trả về kết quả `action: "OUT"`, chuyển phiên sang `CLOSED`, ghi nhận giờ ra và cập nhật hóa đơn Word. | Pass |
| **UT_ATT_03** | `scan` | Chặn quẹt thẻ liên tục vi phạm thời gian Cooldown | - Mã NV: "NV0001"<br>- Mock: Nhân viên vừa quét cách đây 20 giây (dưới ngưỡng tối thiểu 60 giây) | Ném ngoại lệ lỗi (Mã 429: "... vừa ghi nhận lúc ...; vui lòng đợi ... giây."). | Pass |
| **UT_ATT_04** | `scan` | Chặn Check-in ca mới khi phiên công ngày hôm trước chưa đóng | - Mã NV: "NV0001"<br>- Mock: Hôm nay là 02/10, nhưng nhân viên vẫn còn 1 phiên `OPEN` từ ngày 01/10 chưa Check-out | Ném ngoại lệ lỗi (Mã 409 `UNCLOSED_SESSION`: "... còn thiếu giờ ra ngày ... Hãy xử lý phiên cũ rồi quét lại."). | Pass |
| **UT_ATT_05** | `scan` | Chặn Check-in tự động và yêu cầu duyệt ngoại lệ khi ngoài khung giờ ca | - Mã NV: "NV0001"<br>- Mock: Quét lúc 06:00 (trước giờ ca 08:00 hơn 30 phút) | Ném ngoại lệ lỗi (Mã 409 `APPROVAL_REQUIRED`), trả về danh sách ca khả dụng để Kiosk hiển thị nút duyệt ngoại lệ. | Pass |
| **UT_ATT_06** | `approveException` | Duyệt ngoại lệ chọn ca ngoài khung giờ (`mode = "SHIFT"`) thành công | - Mã NV: "NV0001", mode: "SHIFT", ID ca: "507f1f77bcf86cd799439040"<br>- Lý do: "Được quản lý gọi vào sớm chuẩn bị hàng"<br>- Mock: Ca được phân tồn tại và chưa chấm công | Tạo phiên công `OPEN` loại `REGULAR`, lưu lý do và tài khoản quản lý duyệt vào trường `approval`. | Pass |
| **UT_ATT_07** | `approveException` | Phê duyệt làm thêm giờ ngoài lịch (`mode = "OT"`) thành công | - Mã NV: "NV0001", mode: "OT", Giờ kết thúc: "22:00"<br>- Lý do: "Hỗ trợ ca tối đông khách"<br>- Mock: Không có ca phân trước, quét lúc 18:00 | Tạo phiên công loại `OT`, lịch ca tự động lấy từ hiện tại đến 22:00, lưu thông tin người duyệt và lý do. | Pass |
| **UT_ATT_08** | `correct` | Điều chỉnh giờ công thất bại khi số revision bị cũ | - ID phiên: "507f1f77bcf86cd799439030"<br>- Dữ liệu: revision = 1, checkInAt: "08:00", checkOutAt: null<br>- Mock: Phiên trong DB đã có revision = 2 (do người khác vừa sửa trước) | Ném ngoại lệ lỗi (Mã 409 `STALE_REVISION`: "Bản ghi đã thay đổi. Hãy tải lại bảng công."). | Pass |
| **UT_ATT_09** | `cancel` | Hủy mềm phiên chấm công thành công kèm lý do | - ID phiên: "507f1f77bcf86cd799439030", revision = 1<br>- Lý do: "Quẹt nhầm thẻ của đồng nghiệp"<br>- Mock: Phiên đang ở trạng thái `OPEN` | Chuyển trạng thái phiên sang `CANCELLED`, tăng số revision, ghi lý do hủy và lưu nhật ký audit log. | Pass |
| **UT_ATT_10** | `list` | Lấy danh sách bảng công có phân trang và bộ lọc | - Phân trang: Trang 1<br>- Mock: Hệ thống có 1 phiên chấm công hợp lệ | Trả về danh sách phiên công và thông tin tổng số lượng phân trang. | Pass |
| **UT_ATT_11** | `detail` | Xem chi tiết phiên chấm công với ID hợp lệ | - ID phiên: "507f1f77bcf86cd799439030"<br>- Mock: Phiên tồn tại trong cơ sở dữ liệu | Trả về đầy đủ chi tiết phiên công (giờ vào, giờ ra, người ghi nhận từng đầu giờ, đánh giá đúng giờ/trễ). | Pass |
| **UT_ATT_12** | `detail` | Xem chi tiết thất bại khi phiên chấm công không tồn tại | - ID phiên: "507f1f77bcf86cd799439099"<br>- Mock: Không tìm thấy phiên trong DB | Ném ngoại lệ lỗi (Mã 404: "Không tìm thấy phiên chấm công."). | Pass |
