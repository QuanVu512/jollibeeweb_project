# Kết quả kiểm chứng chấm công Kiosk

Kiểm chứng ngày 29/09/2026 trên Windows, Node.js 24.17.0, MongoDB Server 8.3 (replica set riêng) và Chrome 146. Database kiểm thử/demo tách khỏi database cấu hình trong `.env`.

## Kiểm thử tự động

| Kiểm tra | Kết quả |
|---|---|
| `npm run test:attendance` | **47/47 đạt**, gồm 30 integration, 13 quy tắc/validator/hàng đợi và 4 kiểm tra bill/tuần; không skip |
| `npm test` | **83/86 đạt**; 3 lỗi có sẵn trong bộ kiểm thử quản trị |
| `node --check` | Đạt cho các tệp triển khai mới, gồm bill Word và tải bill trên Kiosk |
| Bootstrap | Tạo collection/index; nhân viên cũ thiếu trường chấm công vẫn quét được, giữ nguyên ID/mã/hồ sơ |

Integration sử dụng MongoDB thật, không mô phỏng transaction: quét đồng thời, hai nhân viên tranh UUID, retry sau cooldown, rollback khi audit lỗi ở IN/OUT, sửa cùng revision đồng thời, phân ca chồng đồng thời, index bảo vệ phiên OPEN và lịch ca. Có kiểm tra đầy đủ biên 30 phút trước ca, ân hạn 15 phút, cooldown 59/60 giây và chuyển ngày.

Ba lỗi toàn dự án được tái hiện bằng cách xuất nguyên backend từ Git **`1e9bb90`** vào thư mục tạm và chạy bộ test quản trị trên bản gốc:

- `adminBackend.test.js`: dữ liệu test dùng email `example.com` không khớp danh sách miền email hiện tại.
- `adminBackend.test.js`: thông báo lỗi vai trò hiện tại khác chuỗi mà test chờ.
- `adminBackend.test.js`: danh sách đơn vị trong test chưa bao gồm các đơn vị nghiệp vụ nguyên liệu hiện có.

Các test, validator và dữ liệu nguyên liệu gây ba lỗi này không bị chỉnh sửa trong tính năng Kiosk.

## Kiểm chứng trên trình duyệt

| Yêu cầu | Bằng chứng quan sát |
|---|---|
| IN nhanh, xóa input, tự focus | `NV0002` + Enter hiện tên và Check-in đúng giờ; input rỗng, focus `employee-code`; đo từ submit đến cập nhật kết quả **21 ms** trên demo cục bộ |
| Cooldown và âm báo | Quét lại trong một giây nhận cảnh báo, giữ input rỗng và focus; quan sát Web Audio phát oscillator sine cho thành công, square cho lỗi |
| Duyệt OT bằng bàn phím | Escape đóng hộp duyệt và trả focus; nhập lý do/giờ kết thúc rồi Enter ghi IN với loại OT |
| Mất phản hồi sau commit | Giả lập mất response sau HTTP thành công; hàng đợi giữ hai mã. Retry dùng đúng UUID cũ, trả OUT của phiên đã lưu; người tiếp theo mới xử lý sau đó. Nhân viên đầu chỉ có một phiên |
| Thiếu checkout | `NV0004` bị chặn; liên kết mở đúng nhân viên/ngày hôm trước và hộp sửa. Bổ sung giờ ra cập nhật phiên CLOSED |
| Lịch sử | Hiện quản lý thực hiện, lý do bổ sung giờ ra và dữ liệu trước/sau; cột quản lý giờ vào/ra hiển thị riêng |
| Quản lý lịch | Tạo ca mẫu, phân ca, đổi lịch chưa có công sang ngày tiếp theo, hủy kèm lý do; lọc hiện lịch đã hủy hoạt động |
| Chuỗi nhập của máy quét | Gửi chuỗi phím `NV0003` và Enter qua điều khiển bàn phím: tự OUT, input rỗng, focus trả lại |
| Màn hình thấp / fullscreen | Kết quả nằm trọn trong viewport cao 569 px; nút Toàn màn hình bật Fullscreen API thành công |
| Response cuối cùng | Frontend nhận và kiểm tra cấu trúc thành công; gửi lại UUID lấy từ log trả cùng phiên và hành động gốc |

Số đo 21 ms là một mẫu ở môi trường cục bộ, không phải SLA hoặc kiểm thử tải kéo dài. Chuỗi phím xác minh giao thức thiết bị nhập mã kèm Enter; chưa kiểm tra một mẫu súng barcode/QR vật lý cụ thể. Âm báo được kiểm chứng qua Web Audio trong trình duyệt; khả năng nghe phụ thuộc thiết bị âm thanh và thiết lập trình duyệt.

## Kiểm chứng bill Word

- Đã tải file `.docx` thật trên Chrome cho IN thường, OUT và IN OT; file khoảng 9 KB, tên gồm mã nhân viên, hành động, ngày và UUID.
- IN ca chiều mẫu 13:00 chỉ hiện tổng tuần 4.00, không có giờ ra/công phiên. OUT ca chiều 16:45 hiện công phiên 3.75 và tổng tuần 7.75.
- Hai bill mẫu được tạo bằng thư viện `docx` của runtime workspace. `render_docx.py` báo máy thiếu LibreOffice; dùng Microsoft Word ẩn thay bước chuyển PDF, giữ pipeline PNG của renderer. Đã mở và kiểm tra cả hai ảnh: mỗi bill một trang, tiếng Việt đầy đủ, nhãn và giá trị thẳng hàng, Note nhỏ hơn. Ảnh/PDF chỉ dùng QA.
- HTTP kiểm tra quyền 401/403, UUID sai 400, bill không tồn tại hoặc thuộc quản lý khác 404, MIME Word, attachment và `private, no-store`.
- Retry cùng UUID và tải lại sau sửa/hủy phiên hoặc đổi vai trò vẫn giữ bill gốc. Tổng tuần ở MongoDB kiểm tra đúng ranh giới thứ Hai, loại phiên tuần trước/tuần sau, công đã hủy, nhân viên khác và giờ ra tương lai; gồm OT và OUT vừa ghi.
- Giả lập lỗi tải bill: công vẫn ghi thành công, input rỗng/focus; tải lại qua nút không phát sinh scan mới. Cooldown không tải thêm bill.
- Giữ phản hồi tải bill OT ở trạng thái chờ: Kiosk vẫn xử lý mã NV0004 tiếp theo, trả lỗi thiếu checkout và focus; khi nhả phản hồi Word, bill OT tải được. Download không giữ hàng đợi.
- Trình duyệt cần cho phép tải nhiều tệp. Thông báo chỉ xác nhận đã gửi tệp tới trình duyệt; người dùng có nút tải lại trong kết quả và năm lượt gần nhất.

## Đối chiếu kế hoạch sau bổ sung bill

- Đủ ba màn hình phân ca, bảng công/lịch sử và Kiosk; chỉ quyền admin, không ảnh đại diện.
- Có ca mẫu/gán theo ngày, nhiều ca trong ngày, snapshot lịch, chặn chồng giờ và ca qua đêm.
- Có toggle, cooldown toàn hệ thống, duyệt ngoại lệ/OT và chặn phiên hôm trước chưa đóng.
- Lưu quản lý từng đầu giờ, sửa/hủy có lý do, giữ lịch sử gốc, kiểm tra revision và thời gian chồng nhau.
- Dữ liệu và audit ghi nguyên tử, retry theo UUID an toàn; bootstrap đăng ký collection/index.
- Có tài liệu API và lệnh demo riêng với cooldown/thời gian máy chủ giữ nguyên. Xem [hướng dẫn sử dụng và demo](ATTENDANCE.md).
- Mỗi IN/OUT thành công có bill Word từ snapshot audit, tổng giờ phiên và tuần đúng phạm vi, tải riêng khỏi hàng đợi.
