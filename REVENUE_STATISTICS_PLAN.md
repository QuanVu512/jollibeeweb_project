# Nâng cấp báo cáo Doanh thu, Giao dịch và Khách hàng

## 1. Mục tiêu và quy tắc dữ liệu

Triển khai cả frontend và backend để quản trị viên xem tổng quan, biểu đồ, bảng chi tiết và truy đến từng đơn hàng.

- **Doanh thu:** tính tất cả đơn `completed`, không lọc trạng thái thanh toán; cộng `order.total`, vốn đã gồm phí giao hàng và trừ giảm giá.
- **Thời gian:** lọc theo `completedAt`, tính ngày theo múi giờ Việt Nam. Ngày kết thúc được tính trọn ngày.
- **Giao dịch:** hiển thị tất cả đơn hoàn thành trong kỳ; trạng thái đã thanh toán, chưa thanh toán và hoàn tiền chỉ để tham khảo, tất cả đều đóng góp doanh thu.
- **Khách hàng:** thống kê hành vi mua từ các đơn đủ điều kiện doanh thu; gom theo ID khách hàng. Đơn không liên kết hồ sơ nằm trong nhóm **Khách lẻ**, không cộng vào số khách hàng định danh.
- Không hiển thị giá vốn hoặc lợi nhuận. Không tự thay đổi trạng thái thanh toán của dữ liệu cũ.

## 2. Giao diện và trải nghiệm

Thay combobox loại báo cáo bằng ba tab **Doanh thu / Giao dịch / Khách hàng**, dùng chung bộ lọc ngày. Mặc định chọn **Doanh thu**, từ đầu tháng đến hôm nay.

**Bộ lọc chung**

- Chọn nhanh: Hôm nay, 7 ngày gần nhất, Tháng này; hoặc nhập khoảng ngày.
- Nút **Xem thống kê** áp dụng bộ lọc. Chuyển tab giữ khoảng ngày đã áp dụng.
- Hiển thị rõ khoảng ngày và quy tắc tính của báo cáo.
- **Xuất Excel** xuất tab và bộ lọc đã áp dụng, không lấy những thay đổi chưa bấm xem.

**Tab Doanh thu**

- Bốn thẻ: doanh thu, số đơn hoàn thành, giá trị đơn trung bình, món bán chạy nhất.
- Biểu đồ doanh thu và bảng tổng hợp theo ngày/tuần/tháng; mặc định theo ngày, tuần bắt đầu thứ Hai.
- Bảng gồm kỳ, số đơn đủ điều kiện doanh thu, doanh thu và giá trị đơn trung bình. Những kỳ không phát sinh hiển thị 0.
- So sánh doanh thu với khoảng liền trước có cùng số ngày; khi kỳ trước bằng 0, hiển thị “Chưa có cơ sở so sánh”.
- Biểu đồ top 5 món theo số lượng bán, lấy từ các đơn đủ điều kiện doanh thu.
- Bấm một kỳ trong bảng mở popup danh sách đơn đóng góp doanh thu của kỳ đó.

**Tab Giao dịch**

- Thẻ số đơn hoàn thành, đã thanh toán, chưa thanh toán và hoàn tiền; biểu đồ số đơn theo trạng thái thanh toán.
- Bảng: mã đơn, ngày hoàn thành, khách hàng, loại đơn, phương thức/trạng thái thanh toán và tổng tiền.
- Tìm theo mã đơn, tên hoặc số điện thoại; không lọc trạng thái thanh toán.
- Bấm mã đơn mở popup chỉ đọc: thông tin khách, món/số lượng/đơn giá, tiền hàng, phí giao hàng, giảm giá, tổng tiền và thời gian đặt/hoàn thành.

**Tab Khách hàng**

- Tổng khách hàng định danh có mua trong kỳ, chi tiêu của nhóm này và số đơn/doanh thu khách lẻ.
- Biểu đồ top 5 khách hàng theo tổng chi tiêu.
- Bảng: mã khách, họ tên, số điện thoại, số đơn, tổng chi tiêu, giá trị đơn trung bình và lần hoàn thành gần nhất trong kỳ.
- Tìm theo mã, tên hoặc số điện thoại; bấm khách để mở popup các đơn đủ điều kiện doanh thu của khách trong kỳ.
- Giữ nhóm Khách lẻ riêng, có thể mở danh sách đơn nhưng không coi nhóm này là một cá nhân.

Các bảng mặc định 20 dòng/trang. Giao dịch sắp xếp mới nhất; khách hàng theo chi tiêu giảm dần. Popup có nút đóng, hỗ trợ Esc; không dùng thông báo trình duyệt.

## 3. Backend, API và Excel

Mở rộng module hiện có trong `backend/src/services/reportService.js`; giao diện được cập nhật tại `frontend/admin/report.html` và `frontend/admin/assets/js/report.js`.

- Giữ `GET /api/v1/reports/summary`, sửa điều kiện doanh thu và bổ sung chuỗi thời gian, top 5 món, kết quả so sánh kỳ trước. Thêm `groupBy=day|week|month`; giữ các trường tổng quan hiện có để tương thích.
- Thêm `GET /api/v1/reports/transactions`: khoảng ngày, tìm kiếm, phân trang; hỗ trợ lọc theo khách hàng hoặc nhóm khách lẻ để dùng trong popup. Bỏ qua tham số `paymentStatus` từ request cũ.
- Thêm `GET /api/v1/reports/customers`: tổng quan khách hàng, top 5 và bảng phân trang.
- Tái sử dụng API chi tiết đơn dành cho Admin để mở popup.
- Giữ cấu trúc response `{ success, data }` và phân trang theo quy ước hiện có. Tất cả API báo cáo chỉ dành cho Admin.
- Kiểm tra ngày thực, khoảng ngày đảo ngược và giá trị bộ lọc; trả lỗi 400 rõ ràng. Không dùng ngày đặt làm phương án thay thế nếu thiếu ngày hoàn thành.
- Dùng chung quy tắc lọc cho tổng quan, biểu đồ, bảng, popup và Excel. Giữ index hiện có; không thay đổi model hoặc luồng bán hàng, giao hàng và thanh toán trong lần cập nhật này.

**Excel**

- `type=revenue`: bảng tổng hợp theo kỳ và dòng tổng.
- `type=orders`: chi tiết giao dịch hoàn thành, gồm trạng thái thanh toán và ngày hoàn thành.
- Thêm `type=customers`: bảng khách hàng và phần tổng hợp khách lẻ.
- Giữ `type=items` tương thích, bỏ cột giá vốn/lợi nhuận.
- Xuất toàn bộ dữ liệu khớp bộ lọc, không chỉ trang đang xem.

## 4. Trạng thái và kiểm thử

- Hiển thị trạng thái tải; chặn bấm lặp khi tải hoặc xuất Excel. Bỏ qua response cũ nếu người dùng đã chuyển tab/bộ lọc.
- Không có dữ liệu: thẻ bằng 0, thông báo trong vùng báo cáo, giữ bộ lọc để chọn lại.
- Lỗi API: hiển thị lỗi và cho thử lại; không trình bày dữ liệu kỳ cũ như kết quả của bộ lọc mới.
- Biểu đồ dùng SVG trong dự án, không phụ thuộc CDN; có bảng số liệu tương ứng.

Kiểm thử các tình huống:

- Đơn hoàn thành được cộng dù đã thanh toán, chưa thanh toán hoặc hoàn tiền; đơn chưa hoàn thành hoặc thiếu ngày hoàn thành bị loại. Tham số thanh toán cũ không được làm thay đổi kết quả.
- Phí giao hàng và giảm giá được tính đúng, không cộng hai lần.
- Biên ngày Việt Nam, ngày hoàn thành khác ngày đặt, tuần/tháng và ngày không phát sinh.
- Cùng khách nhiều đơn được gom đúng; khách trùng tên vẫn tách theo ID; khách lẻ không làm tăng số khách định danh.
- Tổng bảng, biểu đồ, popup và Excel khớp nhau; phân trang không ảnh hưởng tổng.
- Kỳ trước bằng 0, không có dữ liệu, lỗi tải, chuyển tab nhanh và quyền truy cập Admin.
- Kiểm tra giao diện máy tính/điện thoại, bàn phím và popup lồng nhau.

## 5. Giới hạn bản đầu

Không thêm thống kê đăng ký tài khoản, lợi nhuận, đơn chưa hoàn thành hoặc thay đổi luồng thanh toán. Báo cáo chỉ đọc dữ liệu; các đơn `completed` còn `unpaid` vẫn đóng góp doanh thu theo yêu cầu cập nhật ngày 29/09/2026.
