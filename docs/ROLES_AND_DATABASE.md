# Vai trò và cấu trúc dữ liệu

## Vai trò có trong dự án PHP cũ

| Key mới | Quyền cũ | Vai trò | Nghiệp vụ chính |
|---|---|---|---|
| `admin` | `Admin` | Quản trị viên | Nhân viên, tài khoản, sản phẩm, báo cáo |
| `cashier` | `ThuNgan` | Thu ngân | Đơn tại quầy, duyệt/hủy đơn online |
| `kitchen` | `Bep` | Nhân viên bếp | Chế biến, thực đơn, tồn kho |
| `shipper` | `Shipper` | Nhân viên giao hàng | Nhận và cập nhật đơn giao |
| `customer` | `Khach` | Khách hàng | Đăng ký, giỏ hàng, đặt và theo dõi đơn |

Như vậy, **không thiếu vai trò bắt buộc so với ý tưởng hiện tại**. Vai trò `banhang` trong tên thư mục thực chất là `cashier`, không phải một vai trò thứ sáu.

## Collection trên MongoDB Atlas

| Collection | Vai trò sử dụng | Nội dung |
|---|---|---|
| `roles` | Tất cả | Tên vai trò và danh sách quyền |
| `users` | Tất cả | Tài khoản, mật khẩu bcrypt, vai trò |
| `employees` | Admin, hệ thống | Hồ sơ nhân viên, liên kết tài khoản, revision chấm công và cooldown |
| `customers` | Khách hàng, thu ngân | Hồ sơ, địa chỉ, điểm tích lũy |
| `categories` | Admin, khách hàng, bếp | 8 danh mục thực đơn chuẩn hóa |
| `products` | Admin, khách hàng, thu ngân, bếp | Món ăn, giá, tồn kho, trạng thái bán |
| `ingredients` | Bếp, admin | Nguyên liệu kho, nhà cung cấp, quy cách đóng gói và đơn vị cơ sở |
| `purchasematerials` | Bếp, admin | Nguyên vật liệu đặt mua, quy đổi về đơn vị kiểm kho |
| `recipes` | Bếp, admin | Công thức định lượng tiêu hao nguyên liệu theo món |
| `kitchensupplyorders` | Bếp, admin | Yêu cầu nhập nguyên vật liệu của bếp |
| `carts` | Khách hàng | Giỏ hàng đang lưu |
| `orders` | Tất cả | Đơn, món, thanh toán, người xử lý, lịch sử trạng thái |
| `inventorytransactions` | Bếp, admin | Lịch sử nhập/xuất/điều chỉnh kho |
| `suppliers` | Bếp, admin | Nhà cung cấp dùng khi nhập kho |
| `paymenttransactions` | Thu ngân, admin | Từng lần thanh toán/hoàn tiền và kết quả giao dịch |
| `notifications` | Admin, khách hàng | Thông báo gửi tới khách hàng |
| `auditlogs` | Admin, hệ thống | Ai đã thêm, sửa hoặc xóa dữ liệu quan trọng, lý do và idempotent request |
| `counters` | Hệ thống | Sinh mã `NV`, `KH`, `MON`, `NCC`, `DH` |
| `shifttemplates` | Admin, hệ thống | Ca làm việc mẫu trong ngày (`name`, `startTime`, `endTime`) |
| `employeeshifts` | Admin, hệ thống | Lịch phân ca theo ngày cho nhân viên, giữ bản sao giờ ca |
| `attendancesessions` | Admin, hệ thống, Kiosk | Phiên chấm công thực tế, đánh giá vào/ra, người ghi nhận, duyệt ngoại lệ/OT |

Chi tiết đơn hàng được nhúng trong `orders.items[]` để giữ đúng tên và giá tại thời điểm mua. Trạng thái cũ được ánh xạ như sau:

| MySQL | MongoDB | Ý nghĩa |
|---:|---|---|
| `-1` | `cancelled` | Thu ngân hủy |
| `0` | `pending` | Chờ thu ngân duyệt |
| `1` | `preparing` | Bếp đang chế biến |
| `2` | `ready_for_delivery` | Chờ shipper nhận |
| `3` | `delivering` | Đang giao |
| `4` | `completed` | Hoàn thành |
| `5` | `failed` | Giao thất bại |

## Điểm không nhất quán đã sửa từ bản cũ

- PHP có trang `Món ngon phải thử`, nhưng danh sách quản lý của bếp chỉ khai báo 7 danh mục. MongoDB seed đủ 8 danh mục.
- Trạng thái `2` và `3` trước đây đều từng bị hiểu là đang giao. Cấu trúc mới tách `ready_for_delivery` và `delivering`.
- Đơn cũ không lưu shipper phụ trách. `orders.assignedShipper` giải quyết việc nhiều shipper cùng nhìn thấy một đơn.
- Giỏ hàng cũ nằm trong session; `carts` giúp khách đăng nhập trên nhiều phiên vẫn giữ giỏ.
- Điều chỉnh tồn kho cũ không có lịch sử; `inventorytransactions` lưu người thao tác và số lượng trước/sau.
- Giá bán và giá vốn được chụp lại trong `orders.items[]`; đổi giá món sau này không làm sai báo cáo cũ.
- Thanh toán tóm tắt nằm trong `orders.payment`, còn từng lần thử thanh toán/hoàn tiền nằm trong `paymenttransactions`.
- Chấm công bổ sung `shifttemplates`, `employeeshifts`, `attendancesessions` phục vụ phân ca theo ngày, Kiosk quét mã, duyệt ngoại lệ và truy vết lịch sử điều chỉnh công.

## Vai trò có thể bổ sung khi mở rộng

Các vai trò dưới đây **chưa cần cho phạm vi hiện tại**, nhưng nên cân nhắc nếu dự án phát triển:

| Vai trò đề xuất | Khi nào cần |
|---|---|
| Quản lý cửa hàng (`manager`) | Muốn tách báo cáo, giá bán và phê duyệt khỏi quyền admin hệ thống |
| Phục vụ bàn (`waiter`) | Có quy trình ăn tại chỗ, giao món ra bàn riêng với bếp |
| Nhân viên kho (`inventory`) | Có nhập hàng, kiểm kê và nhà cung cấp độc lập |
| Chăm sóc khách hàng (`support`) | Có khiếu nại, đổi trả, hoàn tiền |
| Super Admin | Có nhiều chi nhánh hoặc nhiều cửa hàng |

## Trạng thái triển khai

- **Quản trị viên (`admin`)**: Đã hoàn thiện toàn bộ trên Node.js/Express, bao gồm quản lý nhân viên, tài khoản (cho phép role null), sản phẩm công thức, báo cáo đa chiều (Doanh thu, Giao dịch, Khách hàng), xuất Excel, cùng phân hệ **phân ca làm việc, chấm công Kiosk, duyệt ngoại lệ/OT và xuất hóa đơn Word**.
- **Thu ngân (`banhang`)**: Giao diện và API tạo đơn tại quầy, quản lý đơn hàng đã hoạt động trên Express.
- **Bếp (`bep`)**: Giao diện bếp tại `/bep/kitchen.html`, kiểm tra đơn chế biến, quản lý kho nguyên vật liệu và yêu cầu nhập hàng.
- **Giao hàng (`shipper`)**: Giao diện tại `/shipper/`, nhận và cập nhật tiến trình đơn giao.
- **Khách hàng (`khachhang`)**: Trang chủ tại `/khachhang/homepage.html`, xem thực đơn, đăng ký/đăng nhập, giỏ hàng và theo dõi đơn.
