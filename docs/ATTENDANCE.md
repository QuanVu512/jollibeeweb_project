# Phân ca và chấm công Kiosk

Kết quả kiểm thử và đối chiếu kế hoạch: [Biên bản kiểm chứng](ATTENDANCE_VERIFICATION.md).

## Sử dụng

Đăng nhập quyền `admin`. Menu quản trị có ba mục mới:

| Trang | Đường dẫn | Chức năng |
|---|---|---|
| Phân ca | `/admin/shifts.html` | Tạo/chỉnh/ngừng ca mẫu; phân, sửa và hủy lịch chưa có công |
| Bảng công | `/admin/attendance.html` | Lọc ngày, nhân viên, trạng thái; sửa/hủy công và xem lịch sử |
| Kiosk | `/admin/kiosk.html` | Nhập mã bằng bàn phím hoặc thiết bị quét gửi Enter |

Ca mẫu chỉ hỗ trợ giờ bắt đầu/kết thúc trong cùng ngày. Khi phân ca, giờ và tên được sao chép vào lịch; sửa ca mẫu không thay đổi lịch đã phân. Một nhân viên được phân nhiều ca nhưng không trùng/chồng giờ. Hai ca sát nhau được phép. Lịch từng có công không được sửa/hủy, kể cả công sau đó bị hủy.

Nhân viên đang làm việc có thể chấm công dù chưa có tài khoản đăng nhập. Mã được trim và uppercase, nhưng không đổi `NV001` thành `NV0001`: nhập đúng mã trong hồ sơ. Không thêm ảnh đại diện, upload ảnh, tính lương hoặc quét camera.

## Quy tắc

- Ngày công theo `Asia/Ho_Chi_Minh`, timestamp lưu UTC; dùng thời gian máy chủ.
- Chưa có phiên mở: tìm ca chưa chấm công từ 30 phút trước giờ bắt đầu đến trước giờ kết thúc; nếu nhiều ca phù hợp, chọn ca bắt đầu sớm nhất.
- Có phiên mở hôm nay: quét tiếp theo là OUT. Ca đã hoàn tất không tự mở lại; công bị hủy có thể được ghi lại sau cooldown.
- Có phiên mở ngày trước: chặn quét cho đến khi admin bổ sung giờ ra hoặc hủy phiên cũ. Kiosk có liên kết mở đúng phiên cần xử lý.
- Cooldown 60 giây từ lượt quét/duyệt thành công gần nhất, dùng chung cho mọi quản lý/thiết bị. Lỗi và sửa thủ công không đổi mốc cooldown.
- Ân hạn 15 phút: đến hết ngưỡng vẫn đúng giờ; vượt ngưỡng tính muộn từ giờ bắt đầu, làm tròn lên phút. Ca 08:00, vào 08:20: muộn 20 phút.
- Ra trước giờ kết thúc: tính về sớm, làm tròn lên phút. Đánh giá vào/ra độc lập.
- Ngoài khung ca: admin chọn ca chưa chấm công hôm nay và nhập lý do, hoặc duyệt OT với lý do và giờ kết thúc sau hiện tại trong cùng ngày. OT không tính muộn; về sớm so với giờ kết thúc đã duyệt.
- Sửa công cần lý do, `revision` hiện tại, giờ thuộc ngày công, không nằm trong tương lai và không chồng phiên khác. Không mở lại phiên CLOSED bằng cách xóa giờ ra. Hủy mềm giữ dữ liệu; phiên đã hủy không được sửa/hủy lại.

## Kiosk và phục hồi

Enter đưa mã vào hàng đợi và xóa input ngay. Mã xử lý tuần tự; mã đang chờ không thêm lần nữa. Chỉ khi backend xác nhận thành công mới hiện xanh và phát Ting. Lỗi/cooldown phát Beep. Trình duyệt cần cho phép âm thanh sau thao tác bàn phím. Nút Toàn màn hình sử dụng Fullscreen API khi được phép.

Duyệt ngoại lệ tạm dừng hàng đợi. Nhập lý do rồi Enter duyệt; Shift+Enter xuống dòng; Escape hủy. Timeout/mất mạng/lỗi máy chủ chưa rõ kết quả: giữ nguyên payload và UUID, hiển thị **Gửi lại an toàn**, chờ kết quả xác định trước khi tiếp tục. Không gửi UUID mới để thử lại một lượt có thể đã thành công. Hết phiên hoặc quyền: dừng hàng đợi và yêu cầu đăng nhập lại.

## Bill Word sau mỗi lượt chấm công

Mỗi IN/OUT thành công (kể cả ca được duyệt ngoại lệ hoặc OT) tự tải một `.docx` riêng, khổ 80 × 125 mm, font Arial đen trắng. Tiêu đề `Employee Clock In/Out`, họ tên, Job, giờ vào theo Việt Nam có giây, tổng giờ tuần, dấu `*****************` và Note cỡ 8 pt. Ngày công hiện dưới tiêu đề. Chỉ bill OUT có giờ ra và tổng giờ của chính phiên vừa OUT. Ví dụ ca sáng 08:00–12:00, ca chiều 13:00–16:45: IN chiều không có giờ ra/công phiên, tổng tuần 4.00; OUT chiều có công phiên 3.75, tổng tuần 7.75.

Tuần tính thứ Hai 00:00 đến thứ Hai kế tiếp 00:00 theo `Asia/Ho_Chi_Minh`. Cộng thời lượng thực tế của phiên CLOSED trong tuần đến lúc ghi nhận, gồm OT và OUT vừa lưu; không cộng phiên OPEN/CANCELLED hoặc dữ liệu giờ ra tương lai. Làm tròn **tổng** đến hai chữ số giờ thập phân khi in. Job lấy từ vai trò tài khoản liên kết: Administrator, Cashier, Kitchen Staff, Delivery Staff; nhân viên chưa có tài khoản dùng Employee.

Bill lưu snapshot cùng audit của lượt thành công. Tải lại giữ thông tin gốc ngay cả khi phiên được sửa/hủy sau đó. Đây là chứng từ tại thời điểm ghi nhận; bảng công hiện tại và lịch sử phản ánh điều chỉnh. UUID retry trả cùng snapshot và tên file. Tên file gồm mã, IN/OUT, ngày và UUID để không ghi đè bill phiên khác. Sửa/hủy công không tự tạo bill IN/OUT.

Cho phép **tải nhiều tệp** cho trang Kiosk trong trình duyệt. Tải Word chạy độc lập, không chặn quét tiếp. Kết quả và danh sách năm lượt gần nhất có nút **Tải bill Word**; nếu tải lỗi, dùng nút này, không quét lại. Thông báo gửi tới trình duyệt không xác nhận file đã được người dùng lưu khi trình duyệt chặn tải. API tạo Word ở backend, không cần cài Word trên máy chủ.

Bill mẫu: [IN ca chiều](receipt-samples/Employee_Clock_In.docx), [OUT ca chiều](receipt-samples/Employee_Clock_Out.docx). Dữ liệu mẫu dùng để xem thiết kế.

## API chấm công và phân ca

Tất cả endpoint dưới `/api/v1/admin`, bảo vệ JWT và vai trò `admin`. Response theo `{ success, data }` hoặc `{ success: false, message, details }`.

| Method | Endpoint | Body / Kết quả |
|---|---|---|
| GET | `/shift-templates` | `data.items`, gồm cả ca ngừng sử dụng |
| POST / PATCH | `/shift-templates` / `/shift-templates/:id` | `{ name, startTime: "08:00", endTime: "12:00", isActive?: true }` |
| GET | `/employee-shifts` | Lọc `workDate` hoặc `from/to`, `employeeId`; `includeInactive=true` hiện lịch hủy |
| POST / PATCH | `/employee-shifts` / `/employee-shifts/:id` | `{ employeeId, templateId, workDate: "2026-09-29" }`; không đổi employee của lịch đã tạo |
| POST | `/employee-shifts/:id/cancel` | `{ reason }` |
| POST | `/attendance/scan` | `{ employeeCode: "NV0001", requestId: "UUID" }` |
| POST | `/attendance/exceptions` | `{ employeeCode, requestId, mode: "SHIFT", employeeShiftId, reason }` hoặc `{ employeeCode, requestId, mode: "OT", endTime: "18:00", reason }` |
| GET | `/attendance/receipts/:requestId` | Word binary, `Content-Disposition: attachment`; admin đăng nhập phải là người ghi nhận lượt đó; không có bill trả 404 |
| GET | `/attendance` | `from/to`, `employeeId`, `state=OPEN/CLOSED/CANCELLED`, `status=ON_TIME/LATE/EARLY_LEAVE` |
| GET | `/attendance/:id` | `data.item` với người ghi nhận vào/ra |
| PATCH | `/attendance/:id` | `{ checkInAt, checkOutAt: timestamp hoặc null, revision, reason }`; timestamp có `Z` hoặc offset, ví dụ `2026-09-29T08:00:00+07:00` |
| POST | `/attendance/:id/cancel` | `{ revision, reason }` |
| GET | `/attendance/:id/history` | Audit: actor, action, thời điểm, lý do, trước/sau |

Danh sách công, lịch ca và lịch sử nhận `page`, `limit` (tối đa 100), trả `data.items` và `data.pagination`. POST/PATCH quản lý ca/công trả `data.item`.

Scan/duyệt thành công trả nhân viên (`id`, `employeeCode`, `fullName`), `sessionId`, `workDate`, `action=IN/OUT`, `timestamp`, giờ vào/ra, `kind`, `schedule`, `inStatus`, `outStatus`, phút muộn/về sớm. Trường `bill` gồm `requestId`, `fileName`, tên/mã/job, giờ vào/ra, `shiftMilliseconds` (null ở IN), `weekMilliseconds`, `weekFrom`, `weekToExclusive`. Không trả ảnh hoặc dữ liệu liên hệ.

| HTTP | `details.code` | Ý nghĩa |
|---|---|---|
| 429 | `COOLDOWN` | Có `lastRecordedAt`, `retryAfterSeconds`, tên/mã nhân viên |
| 409 | `APPROVAL_REQUIRED` | Có nhân viên, ngày, giờ máy chủ, ca khả dụng; chưa ghi công |
| 409 | `UNCLOSED_SESSION` | Có `sessionId` và ngày; xử lý phiên cũ rồi quét lại |
| 409 | `STATE_CHANGED` | Duyệt lỗi thời; hủy hộp duyệt và kiểm tra lại |
| 409 | `STALE_REVISION` | Tải lại bảng công trước khi sửa/hủy |
| 409 | `REQUEST_ID_REUSED` | UUID đã dùng cho nội dung khác |
| 409 | `SESSION_OVERLAP` | Thời gian chồng phiên khác |
| 404 | `EMPLOYEE_UNAVAILABLE` | Mã không tồn tại hoặc nhân viên đã nghỉ |

## Transaction, index và audit

Writer phân ca/chấm công/điều chỉnh tăng `Employee.attendanceRevision` trong transaction trước khi đọc trạng thái liên quan. Xung đột ghi khiến MongoDB retry transaction trên snapshot mới. `lastAttendanceAt` chỉ đổi khi quét/duyệt thành công. Hai trường nội bộ không được trả trong JSON nhân viên.

Phiên, cooldown và audit ghi cùng transaction: lỗi audit rollback toàn bộ. Audit lưu UUID, fingerprint và response thành công; unique `(actor, requestId)` để retry cùng quản lý trả kết quả gốc, không đảo IN/OUT. Payload khác với UUID cũ bị từ chối. Actor/timestamp do client gửi không được dùng.

Unique partial index bảo đảm một phiên OPEN cho mỗi nhân viên và một phiên OPEN/CLOSED cho mỗi lịch ca. Chạy `npm run init:database` khi triển khai để tạo collection/index trước khi dùng. Database phải hỗ trợ transaction (Atlas hoặc replica set); không cần tạo lại nhân viên cũ.

Giờ vào/ra lưu người ghi riêng. Sửa giữ người ghi gốc; bổ sung giờ ra thiếu ghi người bổ sung. Audit giữ người sửa, lý do và trước/sau. Đây là cơ chế truy trách nhiệm khi đối chiếu camera, không tự chứng minh nhân viên hiện diện.

## Kiểm thử và demo riêng

Trong thư mục `backend`:

```powershell
npm run test:attendance
npm test
npm run demo:attendance
```

Integration/demo tự mở replica set MongoDB cục bộ trong thư mục tạm, chỉ bind `127.0.0.1`; không dùng database trong `.env`. Cần `mongod`; Windows tìm bản 8.3/8.2/8.0/7.0 hoặc chỉ định:

```powershell
$env:TEST_MONGOD = 'C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe'
```

Không có mongod thì integration được đánh dấu skip, không được coi là đã xác minh transaction. Test kết thúc dừng MongoDB và xóa đúng thư mục tạm của nó. Demo tạo database tạm `jollibee_kiosk_demo`, JWT key riêng; Ctrl+C dừng và dọn dữ liệu. `KIOSK_DEMO_PORT` tùy chọn cổng cố định; mặc định in ra URL với cổng tự cấp.

Tài khoản demo: `demoadmina` / `demoadminb`, mật khẩu **DemoKiosk123**. `democashier` cùng mật khẩu để kiểm tra từ chối quyền admin.

1. Đăng nhập theo URL script in ra, mở Kiosk. `NV0001`, `NV0002` có ca hôm nay, bắt đầu khoảng hai phút trước lúc dựng demo.
2. `NV0001` + Enter: xanh, tên và giờ vào. Quét lại ngay: cooldown, không tạo checkout. Muốn demo OUT, đợi đủ 60 giây thực.
3. Mở bảng công/Lịch sử để xem người ghi. Dùng `demoadminb` ghi giờ ra để thấy hai quản lý khác nhau.
4. `NV0003`: duyệt OT với lý do và giờ kết thúc sau hiện tại, hoặc Escape hủy.
5. `NV0004`: thiếu checkout hôm trước; mở liên kết xử lý, bổ sung giờ ra ngày cũ với lý do rồi quét lại.

Không đổi đồng hồ máy chủ hoặc giảm cooldown. Mục tiêu phản hồi khoảng một giây cần đo thực tế từ Enter đến kết quả, không phải SLA mọi cấu hình. Thiết bị barcode/QR cần gửi đúng mã văn bản kèm Enter; không cần camera.
