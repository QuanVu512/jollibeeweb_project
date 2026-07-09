# Thiết kế dữ liệu MongoDB Atlas

MongoDB gọi “bảng” là **collection**. Hệ thống hiện có 18 collection; khi backend khởi động, các collection và index cần thiết sẽ được tự tạo trên database `jollibee`.

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
| `recipes` | `recipeCode`, `productCode`, `name`, `ingredients[]`, `yieldQuantity`, `orderTypes`, `isActive` | Công thức trừ kho nguyên liệu theo từng món bán |
| `kitchensupplyorders` | `items[]`, `status`, `note`, `createdBy`, `confirmedBy`, `cancelledBy`, `createdAt` | Lưu lịch sử đặt hàng nguyên vật liệu của bếp nếu dùng luồng đặt hàng |
| `carts` | `customer`, `items[]`, `updatedAt` | Giỏ hàng đang lưu và sản phẩm được quan tâm |
| `orders` | mã đơn, khách hàng, thời gian, loại/nguồn đơn, tổng tiền, thanh toán, nhân viên xử lý, trạng thái và `items[]` | Collection chính cho doanh thu và hiệu suất vận hành |
| `suppliers` | `supplierCode`, `name`, `contactName`, `phone`, `email`, `address`, `taxCode`, `isActive` | Chi phí và số lần nhập theo nhà cung cấp |
| `inventorytransactions` | `product`, `type`, `quantityChange`, `stockBefore`, `stockAfter`, `unitCost`, `totalCost`, `supplier`, `supplierName`, `referenceCode`, `order`, `createdBy`, `createdAt` | Nhập/xuất/điều chỉnh kho, chi phí nhập và đối chiếu tồn |
| `paymenttransactions` | `order`, `type`, `method`, `amount`, `status`, `transactionReference`, `processedBy`, `processedAt` | Tiền thu/hoàn, tỷ lệ giao dịch thành công và phương thức thanh toán |
| `notifications` | `title`, `message`, `audience`, `priority`, `status`, `recipientCount`, `createdBy`, `sentAt` | Lưu thông báo admin gửi cho khách hàng để giao diện khách hàng hiển thị sau này |
| `auditlogs` | `actor`, `action`, `entityType`, `entityId`, `before`, `after`, `ipAddress`, `createdAt` | Truy vết ai thay đổi dữ liệu và thời điểm thay đổi |
| `counters` | `_id`, `sequence` | Sinh mã liên tục `NV`, `KH`, `MON`, `NCC`, `DH` |

## Quy chuẩn đơn vị nguyên liệu

`ingredients.packaging[].unit` dùng thống nhất 4 mã: `case` = thùng, `bag` = túi lớn, `pack` = túi nilon chứa đồ nhỏ, `pcs` = cái. `baseUnit` vẫn có thể là đơn vị kiểm kho như `kg` hoặc `gram` khi nguyên liệu cần cân đo trực tiếp.

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

## Những báo cáo có thể thực hiện

- Doanh thu, số đơn, giá trị đơn trung bình theo ngày/tháng.
- Giá vốn và lợi nhuận gộp toàn cửa hàng hoặc theo từng món/danh mục.
- Món bán chạy/chậm; doanh thu và số lượng bán của từng món.
- Doanh thu theo ăn tại chỗ, mang đi, giao hàng; theo web/quầy/điện thoại.
- Tỷ lệ hoàn thành, hủy, giao thất bại và nguyên nhân.
- Thời gian từ đặt đến hoàn thành; hiệu suất thu ngân, bếp và shipper.
- Tồn hiện tại, món dưới ngưỡng nhập lại, lịch sử nhập/xuất và giá trị nhập kho.
- Phương thức thanh toán, số giao dịch thành công/thất bại, số tiền hoàn.
- Khách mới, khách quay lại, giá trị mua của khách và điểm tích lũy.

## Vai trò hiện có

| Vai trò | Key | Phạm vi chính |
|---|---|---|
| Quản trị viên | `admin` | Nhân viên, tài khoản, báo cáo |
| Thu ngân | `cashier` | Nhận/tạo/hủy đơn, khách hàng, thanh toán |
| Nhân viên bếp | `kitchen` | Chế biến, món ăn, kho |
| Nhân viên giao hàng | `shipper` | Nhận và giao đơn |
| Khách hàng | `customer` | Giỏ hàng, đặt và theo dõi đơn |

So với dự án PHP cũ, không thiếu vai trò bắt buộc. Thư mục `banhang` chính là nghiệp vụ `cashier`. Các vai trò `manager`, `waiter`, `inventory`, `support` chỉ cần bổ sung nếu nhóm mở rộng phạm vi dự án.
