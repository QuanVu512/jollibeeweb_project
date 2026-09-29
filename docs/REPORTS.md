# Báo cáo doanh thu, giao dịch và khách hàng

Giao diện: `/admin/report.html`. Chỉ Admin truy cập các API dưới `/api/v1/reports` (đường dẫn `/api/v1/admin/reports` cũng được giữ).

## Quy tắc thống kê

- Doanh thu và chi tiêu khách hàng: tất cả đơn `completed` có `completedAt`, không phụ thuộc trạng thái thanh toán. Cộng `total` gồm phí giao hàng và đã trừ giảm giá; đơn `unpaid`/`refunded` cũng được tính theo đặc tả hiện tại.
- Giao dịch: tất cả đơn `completed` có ngày hoàn thành trong kỳ, bao gồm chưa thanh toán/hoàn tiền để đối soát.
- `from`/`to` là ngày Việt Nam, định dạng `YYYY-MM-DD`, gồm trọn ngày kết thúc. Từ 00:00 Việt Nam tương ứng 17:00 UTC ngày trước. Không dùng `orderedAt` thay thế.
- Giao diện mặc định từ đầu tháng đến hôm nay. Nhập ngày/chọn nhanh chỉ thay bộ lọc nháp; bấm Xem thống kê mới áp dụng. Excel lấy bộ lọc đã áp dụng.
- Khách có hồ sơ được gom theo ID, kể cả trùng tên. Khách lẻ không có liên kết hồ sơ được gom thành nhóm riêng, không cộng vào số khách định danh. Tìm kiếm chỉ lọc nhóm có hồ sơ; nhóm khách lẻ giữ tổng của khoảng ngày.
- Giá trị đơn trung bình = tổng tiền đủ điều kiện / số đơn đủ điều kiện, không lấy trung bình của các trung bình ngày. Phần trăm so sánh kỳ trước chỉ tính khi kỳ trước lớn hơn 0.
- Trạng thái thanh toán chỉ hiển thị để tham khảo. Tham số `paymentStatus` từ các request cũ được bỏ qua ở mọi API báo cáo. Quy tắc này chỉ áp dụng cho module thống kê, không thay đổi dữ liệu hoặc luồng bán hàng, giao hàng và thanh toán.

## API

Mọi response JSON dùng `{ success: true, data }`; bảng phân trang dùng `{ page, limit, total, totalPages }`, mặc định 20, tối đa 100 dòng. Các API trả 400 cho ngày sai, khoảng đảo ngược và bộ lọc không hợp lệ; 401/403 cho phiên/quyền không hợp lệ.

| API | Tham số và dữ liệu |
|---|---|
| `GET /reports/summary` | `from`, `to`, `groupBy=day|week|month`. Trả các trường tổng quan hiện có, `topItems` (5 món), `range`, `series`, `comparison`. Mỗi kỳ có `period`, `from`, `to`, doanh thu, số đơn và trung bình. Không truyền ngày vẫn xem dữ liệu mọi thời điểm. |
| `GET /reports/transactions` | `from`, `to`, `search`, `customerId=<ObjectId>|guest`, `page`, `limit`, `sortBy=completedAt|total|orderCode|customerName`, `sortDir=asc|desc`. Trả `items`, `overview`, `pagination`; số lượng theo trạng thái thanh toán chỉ là thông tin tham khảo. |
| `GET /reports/customers` | `from`, `to`, `search`, `page`, `limit`, `sortBy=totalSpent|orders|lastCompletedAt|fullName`, `sortDir=asc|desc`. Trả `overview`, `guest`, `topCustomers`, `items`, `pagination`. |
| `GET /reports/export` | `type=revenue|orders|customers|items` và cùng bộ lọc của tab tương ứng; bỏ giới hạn trang khi xuất. Trả `.xlsx`. |

Popup đơn dùng lại `GET /api/v1/banhang/orders/:id`, có thông tin hồ sơ khách hàng nếu được liên kết. Toàn bộ popup chỉ đọc, hỗ trợ Esc/Đóng; đóng popup đơn lồng bên trong vẫn giữ popup danh sách đơn.

Tuần bắt đầu thứ Hai; kỳ đầu/cuối được cắt theo khoảng đã chọn. Các ngày/tuần/tháng không phát sinh vẫn có giá trị 0. Top món xếp theo số lượng; tiền món trong Excel `items` là trước giảm giá, chưa gồm phí giao hàng nên không thay thế tổng doanh thu đơn.

API summary giữ trường giá vốn/lợi nhuận cũ để tương thích, nhưng giao diện và Excel không trình bày các trường này. Excel giao dịch giữ thông tin liên hệ và giá trị `dinein(<số bàn>)`; tổng tiền/phí giao hàng/giảm giá chỉ điền một lần cho mỗi đơn nhiều món.

## Kiểm thử và demo

Từ thư mục `backend`:

```powershell
npm run test:reports
npm run demo:reports
```

Cần MongoDB Server cục bộ (`mongod`) hoặc đặt `TEST_MONGOD` tới executable. Các công cụ tạo replica set ở thư mục tạm, dùng database/signing key riêng và dọn khi kết thúc; không kết nối database trong `.env`.

Demo in URL cổng ngẫu nhiên. Đăng nhập `reportadmin / ReportDemo123`, chọn 01/09/2026–03/09/2026: doanh thu 2.810.000 đ, 27 đơn hoàn thành, 22 khách có hồ sơ (25 đơn, 2.625.000 đ) và 2 đơn khách lẻ (185.000 đ). Ctrl+C để dừng và dọn dữ liệu tạm.

Kiểm thử giao diện bằng Playwright đã cài trên máy (không thêm dependency sản xuất):

```powershell
$env:PLAYWRIGHT_MODULE='<đường dẫn module playwright đã cài>'
$env:REPORT_BROWSER_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'
npm run test:reports:ui
```

Nếu Playwright có sẵn qua `require('playwright')`, không cần đặt `PLAYWRIGHT_MODULE`. Công cụ tạo fixture riêng, chạy trên Chrome headless và lưu ảnh ở `docs/report-verification`.

Khi triển khai: khởi động lại backend và tải lại trang. Index `{ status: 1, 'payment.status': 1, completedAt: -1 }` được khai báo trên Order và tạo qua bước khởi tạo model/database hiện có. Không cần chuyển đổi dữ liệu.
