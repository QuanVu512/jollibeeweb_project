# Thiết kế dữ liệu MongoDB Atlas

MongoDB gọi “bảng” là **collection**. Các collection và index cần thiết được khởi tạo bằng `npm run init:database`; toàn hệ thống có **21 collection** sau khi bổ sung ba collection ca mẫu, lịch ca và phiên công.

## Danh sách collection và thuộc tính quan trọng

| Collection | Thuộc tính chính | Mục đích thống kê |
|---|---|---|
| `roles` | `key`, `label`, `description`, `permissions`, `isSystem` | Phân quyền theo vai trò |
| `users` | `username`, `passwordHash`, `role`, `displayName`, `employee`, `customer`, `isActive`, `lastLoginAt`, `createdAt` | Số tài khoản theo vai trò/trạng thái, lần đăng nhập cuối |
| `employees` | `employeeCode`, `fullName`, `phone`, `birthDate`, `gender`, `email`, `hometown`, `hireDate`, `terminationDate`, `isActive`, `account` | Nhân sự đang làm/nghỉ, ngày vào làm và hiệu suất theo tài khoản xử lý đơn |
| `customers` | `customerCode`, `fullName`, `phone`, `email`, `birthDate`, `gender`, `addresses`, `loyaltyPoints`, `isActive`, `account`, `createdAt` | Khách mới, khách quay lại, phân nhóm khách hàng và điểm tích lũy |
| `categories` | `code`, `name`, `slug`, `sortOrder`, `isActive` | Doanh số theo danh mục món |
| `products` | `productCode`, `name`, `category`, `categoryCode`, `price`, `costPrice`, `stock`, `unit`, `reorderLevel`, `image`, `isActive` | Doanh số món, lợi nhuận, tồn kho thấp và giá trị tồn |
| `ingredients` | `code`, `name`, `supplierName`, `baseUnit`, `stockQuantity`, `packaging[]`, `isActive` | Tồn nguyên liệu theo đơn vị cơ sở, nhà cung cấp và quy đổi nhập kho/bán lẻ |
| `purchasematerials` | `code`, `name`, `ingredient`, `ingredientCode`, `orderUnit`, `orderUnitLabel`, `stockUnit`, `stockQuantityPerOrderUnit`, `supplierName`, `isActive` | Danh mục nguyên vật liệu đặt hàng theo đơn vị mua, quy đổi về nguyên liệu kiểm kho |
| `recipes` | `recipeCode`, `productCode`, `name`, `ingredients[].quantity`, `ingredients[].unit`, `ingredients[].quantityBase`, `yieldQuantity`, `orderTypes`, `isActive` | Công thức trừ kho nguyên liệu theo từng món bán; định lượng nhập được chuẩn hóa về đơn vị tồn kho cơ sở |
| `kitchensupplyorders` | `items[]`, `status`, `note`, `createdBy`, `confirmedBy`, `cancelledBy`, `createdAt` | Lưu lịch sử đặt hàng nguyên vật liệu của bếp nếu dùng luồng đặt hàng |
| `carts` | `customer`, `items[]`, `updatedAt` | Giỏ hàng đang lưu và sản phẩm được quan tâm |
| `orders` | mã đơn, khách hàng, thời gian, loại/nguồn đơn, tổng tiền, thanh toán, nhân viên xử lý, trạng thái và `items[]` | Collection chính cho doanh thu và hiệu suất vận hành |
| `suppliers` | `supplierCode`, `name`, `contactName`, `phone`, `email`, `address`, `taxCode`, `isActive` | Chi phí và số lần nhập theo nhà cung cấp |
| `inventorytransactions` | `product`, `type`, `quantityChange`, `stockBefore`, `stockAfter`, `unitCost`, `totalCost`, `supplier`, `supplierName`, `referenceCode`, `order`, `createdBy`, `createdAt` | Nhập/xuất/điều chỉnh kho, chi phí nhập và đối chiếu tồn |
| `paymenttransactions` | `order`, `type`, `method`, `amount`, `status`, `transactionReference`, `processedBy`, `processedAt` | Tiền thu/hoàn, tỷ lệ giao dịch thành công và phương thức thanh toán |
| `notifications` | `title`, `message`, `audience`, `priority`, `status`, `recipientCount`, `createdBy`, `sentAt` | Lưu thông báo admin gửi cho khách hàng để giao diện khách hàng hiển thị sau này |
| `auditlogs` | `actor`, `action`, `entityType`, `entityId`, `before`, `after`, `reason`, `requestId`, `fingerprint`, `response`, `ipAddress`, `createdAt` | Truy vết ai thay đổi dữ liệu, thời điểm, lý do, fingerprint và kết quả idempotent retry |
| `counters` | `_id`, `sequence` | Sinh mã liên tục `NV`, `KH`, `MON`, `NCC`, `DH` |
| `shifttemplates` | `name`, `startTime`, `endTime`, `isActive` | Ca mẫu trong cùng ngày |
| `employeeshifts` | `employee`, `template`, `workDate`, `name`, `startAt`, `endAt`, `graceMinutes`, `isActive`, `assignedBy` | Lịch phân theo ngày, giữ bản sao giờ ca |
| `attendancesessions` | `employee`, `employeeCode`, `employeeName`, `employeeShift`, `workDate`, `kind`, `state`, `schedule`, `checkInAt`, `checkOutAt`, `checkInRecordedBy`, `checkOutRecordedBy`, đánh giá vào/ra, `approval`, `revision`, thông tin hủy | Công thực tế và người ghi nhận từng đầu giờ |

Chấm công thêm `employees.attendanceRevision` (khóa cập nhật) và `lastAttendanceAt` (cooldown), ẩn khỏi JSON hồ sơ. `auditlogs` thêm lý do, `requestId`, fingerprint và response để truy vết, retry an toàn. Index bảo đảm một phiên OPEN/nhân viên, một phiên sống/lịch ca và UUID duy nhất theo actor. Chi tiết tại [Phân ca và chấm công](ATTENDANCE.md).

`users.role` cho phép `null` và mặc định là `null` với tài khoản mới chưa cấp quyền. Tài khoản này vẫn liên kết `employee` để chấm công, nhưng không được đăng nhập hoặc dùng phiên đã cấp trước đó. Thay đổi vai trò tăng `users.tokenVersion` để thu hồi phiên cũ; đặt role về null không xóa hồ sơ, mã nhân viên hoặc liên kết tài khoản.

## Quy chuẩn đơn vị nguyên liệu

`ingredients.packaging[].unit` lưu cả đơn vị đóng gói và đơn vị nghiệp vụ. Các mã đóng gói gồm `case` = thùng, `bag` = túi lớn, `pack` = túi nilon chứa đồ nhỏ, `pcs` = cái/miếng. Các mã nghiệp vụ bổ sung gồm `spoon` = muỗng, `tbsp` = muỗng lớn, `gram` = gram, `serving` = suất cơm và `cup` = cốc. `baseQuantity` luôn biểu diễn lượng tương ứng theo `baseUnit` của nguyên liệu.

| Nguyên liệu | Đơn vị nghiệp vụ | Quy đổi về đơn vị cơ sở |
|---|---|---|
| Gà miếng | `pcs` | `1 pcs = 1/8 pack = 1/80 case` |
| Muối | `spoon` | `1 spoon = 1/50 bag` |
| Sốt mì | `tbsp` | `1 tbsp = 1/20 pack` |
| Gạo | `gram`, `serving` | `1 gram = 0.001 kg`; `1 serving = 0.1 kg` |
| Xà lách | `pcs` | `1 pcs = 50 gram` |
| Bánh xoài đào | `pcs` | `1 pcs = 1/8 pack` |
| Pepsi | `cup` | `1 cup = 1/50 case` |

`purchasematerials` là bảng dùng cho đặt hàng nhà cung cấp. Mỗi dòng trỏ về một `ingredients` tương ứng và lưu `stockQuantityPerOrderUnit` để biết 1 đơn vị đặt hàng nhập vào kho thành bao nhiêu đơn vị kiểm kho. Ví dụ gạo đặt theo `bag` và vào kho thành `20 kg`; cà chua đặt theo `pcs` và vào kho thành `1 pcs`.

## Đơn hàng và chi tiết đơn hàng

Không tạo collection `orderdetails` riêng. Chi tiết đơn được nhúng trong `orders.items[]`, tương đương bảng `ChiTietDonHang` của MySQL:

| Thuộc tính `orders.items[]` | Ý nghĩa |
|---|---|
| `product`, `productCode` | Liên kết và mã món |
| `categoryCode` | Danh mục tại thời điểm bán |
| `name` | Tên món tại thời điểm bán |
| `quantity` | Số lượng |
| `unitPrice` | Giá bán tại thời điểm đặt |
| `costPrice` | Giá vốn tại thời điểm đặt |
| `lineTotal` | `quantity × unitPrice` |

Việc chụp lại tên, giá bán và giá vốn giúp báo cáo lịch sử không đổi khi quản trị viên sửa món ăn sau này.

Các thuộc tính quan trọng khác của `orders`:

- `orderedAt`, `completedAt`, `cancelledAt`: đo thời gian xử lý và tỷ lệ hoàn thành/hủy.
- `orderType`: `dine_in`, `pickup`, `delivery`.
- `source`: `web`, `pos`, `phone`, `legacy`.
- `subtotal`, `shippingFee`, `discount`, `total`: phân tích doanh thu và giảm giá.
- `payment.method`, `payment.status`, `payment.paidAt`: trạng thái thanh toán hiện tại.
- `createdBy`, `acceptedBy`, `preparedBy`, `assignedShipper`: hiệu suất thu ngân, bếp và shipper.
- `statusHistory[]`: lịch sử chuyển trạng thái, người chuyển và thời điểm.
- `cancellationReason`, `failureReason`: thống kê nguyên nhân hủy/giao thất bại.

Index phục vụ báo cáo: `orders` thiết lập chỉ mục kép `{ status: 1, 'payment.status': 1, completedAt: -1 }` kết hợp với `{ status: 1, orderedAt: -1 }` để tối ưu hóa truy vấn chuỗi thời gian hoàn thành theo múi giờ Việt Nam.

## Những báo cáo có thể thực hiện

Hệ thống cung cấp ba phân hệ báo cáo quản trị chuyên sâu tại `/admin/report.html`:

1. **Báo cáo Doanh thu**:
   - Thống kê doanh thu thực tế, số đơn hoàn thành và giá trị đơn trung bình (AOV = doanh thu / số đơn).
   - Chuỗi thời gian theo ngày, tuần (bắt đầu thứ Hai) hoặc tháng, tự động bù kỳ không có doanh thu bằng 0.
   - So sánh tăng/giảm phần trăm với kỳ liền trước có cùng độ dài ngày.
   - Biểu đồ và bảng xếp hạng Top 5 món ăn bán chạy nhất theo số lượng.
   - Nhấp vào kỳ trên biểu đồ/bảng để mở popup danh sách đơn đóng góp doanh thu.

2. **Báo cáo Giao dịch**:
   - Đối soát toàn bộ đơn hoàn thành trong kỳ theo phương thức và trạng thái thanh toán (`paid`, `unpaid`, `refunded`).
   - Phân trang, tìm kiếm theo mã đơn, tên hoặc số điện thoại khách hàng.
   - Nhấp mã đơn mở popup chi tiết đơn hàng (chỉ đọc) với thông tin khách, chi tiết món, giảm giá và phí giao hàng.

3. **Báo cáo Khách hàng**:
   - Thống kê số lượng khách hàng định danh có phát sinh đơn và tổng chi tiêu của nhóm này.
   - Tách riêng nhóm **Khách lẻ** (đơn không liên kết hồ sơ) để đối chiếu chính xác, không tính vào số khách định danh.
   - Biểu đồ và bảng xếp hạng Top 5 khách hàng chi tiêu nhiều nhất.
   - Nhấp vào khách hàng để mở popup danh sách các đơn hàng của khách trong kỳ.

4. **Xuất báo cáo Excel đa dạng**:
   - Hỗ trợ xuất các loại file `.xlsx`: `revenue` (tổng hợp kỳ), `orders` (chi tiết giao dịch), `customers` (danh sách khách hàng & khách lẻ) và `items` (chi tiết tiêu thụ món ăn). Chi tiết xem tại [Tài liệu báo cáo](REPORTS.md).

## Vai trò hiện có

| Vai trò | Key | Phạm vi chính |
|---|---|---|
| Quản trị viên | `admin` | Nhân viên, tài khoản, sản phẩm, báo cáo |
| Thu ngân | `cashier` | Nhận/tạo/hủy đơn, khách hàng, thanh toán |
| Nhân viên bếp | `kitchen` | Chế biến, món ăn, kho |
| Nhân viên giao hàng | `shipper` | Nhận và giao đơn |
| Khách hàng | `customer` | Giỏ hàng, đặt và theo dõi đơn |

So với dự án PHP cũ, không thiếu vai trò bắt buộc. Thư mục `banhang` chính là nghiệp vụ `cashier`. Các vai trò `manager`, `waiter`, `inventory`, `support` chỉ cần bổ sung nếu nhóm mở rộng phạm vi dự án.
