# Jollibee Management System

Hệ thống web mô phỏng quy trình vận hành cửa hàng thức ăn nhanh, bao gồm quản trị, bán hàng, bếp, giao hàng và đặt món dành cho khách hàng.

Dự án sử dụng frontend HTML/CSS/JavaScript thuần và REST API xây dựng bằng Node.js, Express, MongoDB. Mã nguồn backend được phân lớp để mỗi thành phần chỉ đảm nhận một trách nhiệm rõ ràng.

> Đây là dự án phục vụ mục đích học tập, không phải sản phẩm chính thức của Jollibee.

## Chức năng chính

| Phân hệ | Chức năng |
|---|---|
| Quản trị viên | Quản lý nhân viên, tài khoản, sản phẩm và báo cáo doanh thu |
| Chấm công | Phân ca theo ngày, Kiosk IN/OUT, duyệt OT, điều chỉnh công và lịch sử người ghi nhận |
| Thu ngân | Tạo đơn tại quầy, tiếp nhận và xử lý đơn hàng |
| Bếp | Theo dõi món cần chế biến, quản lý nguyên liệu và yêu cầu nhập hàng |
| Giao hàng | Nhận đơn, cập nhật tiến trình và kết quả giao hàng |
| Khách hàng | Đăng ký, xem thực đơn, đặt món và theo dõi đơn hàng |

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js 20+, Express 5 |
| Cơ sở dữ liệu | MongoDB, Mongoose |
| Xác thực | JWT trong cookie `HttpOnly`, bcrypt |
| Bảo mật và logging | Helmet, CORS, express-rate-limit, Morgan |
| Xuất báo cáo | ExcelJS |
| Xuất hóa đơn chấm công | docx |
| Hỗ trợ chuyển đổi dữ liệu cũ | MySQL2 |

## Kiến trúc hệ thống

Luồng xử lý HTTP của backend:

```text
Browser
   │
   ▼
Route → Middleware/Validator → Controller → Service → Repository → Model → MongoDB
                                      │
                                      └──────────────────────────────► JSON response
```

- `Route` khai báo URL, HTTP method và chuỗi middleware.
- `Middleware` xác thực, phân quyền và xử lý các vấn đề dùng chung.
- `Validator` kiểm tra dữ liệu đầu vào.
- `Controller` nhận dữ liệu từ request, gọi service và tạo response.
- `Service` xử lý quy tắc và quy trình nghiệp vụ.
- `Repository` thực hiện các thao tác đọc, ghi dữ liệu.
- `Model` định nghĩa Mongoose schema và hành vi của thực thể.
- `View` là toàn bộ giao diện trình duyệt trong `frontend/`.

Chi tiết nguyên tắc phân lớp được trình bày tại [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Cấu trúc thư mục

```text
jollibee_project/
├── frontend/
│   ├── admin/                     # Giao diện quản trị, phân ca, chấm công & Kiosk
│   ├── banhang/                   # Giao diện thu ngân
│   ├── bep/                       # Giao diện bếp
│   ├── khachhang/                 # Giao diện khách hàng
│   ├── shipper/                   # Giao diện giao hàng
│   └── assets/                    # Hình ảnh, JavaScript dùng chung và vendor
├── backend/
│   ├── src/
│   │   ├── config/                # Môi trường và kết nối database
│   │   ├── constants/             # Hằng số nghiệp vụ (vai trò, trạng thái, chấm công)
│   │   ├── controllers/           # Điều phối request/response
│   │   ├── middleware/            # Xác thực, phân quyền và xử lý lỗi
│   │   ├── models/                # Mongoose schema
│   │   ├── repositories/          # Truy cập dữ liệu
│   │   ├── routes/                # Khai báo REST API
│   │   ├── services/              # Xử lý nghiệp vụ (sản phẩm, ca làm, chấm công, bill Word...)
│   │   ├── validators/            # Kiểm tra dữ liệu đầu vào
│   │   ├── scripts/               # Seed và chuyển đổi dữ liệu
│   │   ├── utils/                 # Tiện ích dùng chung (thời gian ca, sinh bill Word...)
│   │   ├── app.js                 # Cấu hình Express
│   │   └── server.js              # Kết nối database và khởi động server
│   ├── test/                      # Kiểm thử backend (quản trị, chấm công, bill Word)
│   ├── tools/                     # Công cụ phát triển & demo chấm công độc lập
│   └── package.json
├── docs/                          # Tài liệu kỹ thuật
└── legacy/php-app/                # Bản PHP/MySQL cũ dùng để đối chiếu
```

## Yêu cầu hệ thống

- Node.js `20` trở lên.
- npm đi kèm Node.js.
- Một MongoDB database, khuyến nghị sử dụng MongoDB Atlas.

Không cần cài MongoDB Server hoặc MySQL nếu chỉ chạy phiên bản hiện tại với Atlas.

## Cài đặt

### 1. Cài dependency

Mở PowerShell tại thư mục dự án:

```powershell
cd backend
npm install
```

### 2. Khai báo biến môi trường

Tạo tệp `backend/.env` và thêm cấu hình sau:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/jollibee
JWT_SECRET=<chuoi-bi-mat-toi-thieu-32-ky-tu>

PORT=3000
NODE_ENV=development
JWT_EXPIRES_IN=8h
COOKIE_NAME=jollibee_admin_token
COOKIE_MAX_AGE_MS=3600000

ADMIN_USERNAME=admin
ADMIN_PASSWORD=<mat-khau-toi-thieu-8-ky-tu>
ADMIN_DISPLAY_NAME=Quản trị viên
ADMIN_FORCE_RESET=false
```

`MONGODB_URI` và `JWT_SECRET` là hai biến bắt buộc để khởi động backend. Các biến `ADMIN_*` cần thiết khi tạo tài khoản quản trị đầu tiên.

Không commit `.env` hoặc đưa thông tin kết nối, mật khẩu thật vào mã nguồn.

### 3. Khởi tạo database và tài khoản quản trị

```powershell
npm run init:database
npm run seed:admin
```

Với database dùng chung, chỉ một thành viên cần seed tài khoản quản trị lần đầu. Script không thay đổi mật khẩu của tài khoản đã tồn tại, trừ khi `ADMIN_FORCE_RESET=true`.

### 4. Khởi động dự án

Chế độ phát triển:

```powershell
npm run dev
```

Chế độ thông thường:

```powershell
npm start
```

Server mặc định chạy tại `http://localhost:3000`.

## Đường dẫn truy cập

| Khu vực | URL |
|---|---|
| Khách hàng | `http://localhost:3000/` |
| Quản trị viên (Đăng nhập) | `http://localhost:3000/login.html` |
| Quản trị viên (Tổng quan) | `http://localhost:3000/admin/` |
| Phân ca làm việc | `http://localhost:3000/admin/shifts.html` |
| Bảng chấm công & lịch sử | `http://localhost:3000/admin/attendance.html` |
| Kiosk chấm công | `http://localhost:3000/admin/kiosk.html` |
| Thu ngân | `http://localhost:3000/banhang/` |
| Bếp | `http://localhost:3000/bep/kitchen-login.html` |
| Giao hàng | `http://localhost:3000/shipper/` |
| Kiểm tra backend | `http://localhost:3000/health` |

## REST API

Tất cả API sử dụng tiền tố `/api/v1`.

| Nhóm endpoint | Phạm vi |
|---|---|
| `/auth` | Đăng ký, đăng nhập, đăng xuất và phiên người dùng |
| `/admin` | Nghiệp vụ tổng hợp dành cho quản trị viên |
| `/admin/shift-templates` | Quản lý ca làm việc mẫu |
| `/admin/employee-shifts` | Phân ca làm việc theo ngày cho nhân viên |
| `/admin/attendance` | Chấm công Kiosk (`/scan`), duyệt ngoại lệ (`/exceptions`), xuất bill Word (`/receipts/:requestId`), điều chỉnh và lịch sử |
| `/employees`, `/accounts` | Nhân viên và tài khoản |
| `/reports` | Báo cáo Doanh thu / Giao dịch / Khách hàng, popup chi tiết và xuất Excel; xem [hướng dẫn](docs/REPORTS.md) |
| `/notifications` | API thông báo dự phòng (chưa có giao diện admin) |
| `/banhang` | Nghiệp vụ thu ngân |
| `/kitchen` | Chế biến, kho và yêu cầu nguyên liệu |
| `/shipper` | Nghiệp vụ giao hàng |
| `/products`, `/orders`, `/customer` | Sản phẩm, đơn hàng và khách hàng |

Module quản lý sản phẩm của quản trị viên sử dụng `/api/v1/admin/products`; mã sản phẩm được sinh tự động và công thức nguyên liệu được quy đổi về đơn vị tồn kho cơ sở.

Các endpoint được bảo vệ sẽ kiểm tra JWT và vai trò trước khi chuyển request tới controller.

## Các lệnh npm

Chạy các lệnh sau trong thư mục `backend/`:

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Chạy server với chế độ theo dõi thay đổi |
| `npm start` | Chạy server thông thường |
| `npm test` | Chạy bộ kiểm thử Node.js |
| `npm run test:attendance` | Chạy bộ kiểm thử phân ca, chấm công Kiosk và bill Word |
| `npm run demo:attendance` | Chạy demo Kiosk chấm công độc lập với replica set tạm thời |
| `npm run test:reports` | Chạy bộ kiểm thử quy tắc và tích hợp báo cáo doanh thu, giao dịch, khách hàng |
| `npm run test:reports:ui` | Kiểm tra giao diện và chụp ảnh xác minh báo cáo qua Chrome/Playwright |
| `npm run demo:reports` | Chạy demo báo cáo độc lập với dữ liệu mẫu và replica set tạm thời |
| `npm run init:database` | Khởi tạo collection, index, vai trò và dữ liệu nền |
| `npm run seed:admin` | Tạo hoặc đặt lại tài khoản quản trị |
| `npm run seed:recipes` | Khởi tạo công thức và dữ liệu kho |
| `npm run sync:recipe-units` | Đồng bộ các đơn vị nghiệp vụ và công thức liên quan, không thay đổi tồn kho |
| `npm run migrate:mysql` | Chuyển dữ liệu cần thiết từ MySQL cũ sang MongoDB |

## Tài liệu kỹ thuật

| Tài liệu | Nội dung |
|---|---|
| [Kiến trúc dự án](docs/ARCHITECTURE.md) | Trách nhiệm từng tầng và quy tắc mở rộng backend |
| [Thiết lập MongoDB Atlas](docs/ATLAS_SETUP.md) | Cấu hình cluster, database user và quyền truy cập |
| [Vai trò và database](docs/ROLES_AND_DATABASE.md) | Ma trận vai trò, collection và trạng thái đơn hàng |
| [Database schema](docs/DATABASE_SCHEMA.md) | Cấu trúc dữ liệu MongoDB |
| [Backend quản trị](docs/ADMIN_BACKEND.md) | Endpoint và nghiệp vụ quản trị |
| [Báo cáo Doanh thu, Giao dịch & Khách hàng](docs/REPORTS.md) | Thống kê doanh thu, chuỗi thời gian, phân tích khách hàng và xuất Excel |
| [Phân ca và chấm công Kiosk](docs/ATTENDANCE.md) | Quy tắc, bill Word IN/OUT, API, transaction, kiểm thử và demo riêng |
| [Biên bản kiểm chứng chấm công](docs/ATTENDANCE_VERIFICATION.md) | Kết quả kiểm chứng tự động, kiểm thử Kiosk, âm báo và bill Word |

## Quy ước phát triển

- Giữ toàn bộ giao diện và tài nguyên chạy trên trình duyệt trong `frontend/`.
- Route chỉ ánh xạ endpoint, middleware và controller; không đặt nghiệp vụ trong route.
- Controller không truy cập model hoặc database trực tiếp.
- Service không phụ thuộc vào đối tượng HTTP `req`/`res`.
- Repository là tầng duy nhất trong request flow thao tác với Mongoose model.
- Không commit `.env`, thông tin đăng nhập hoặc dữ liệu nhạy cảm.
- Khi thêm chức năng, cập nhật tài liệu và bổ sung kiểm thử phù hợp.

## Mã nguồn cũ

Ứng dụng PHP/MySQL trước đây được lưu trong `legacy/php-app/` để tham khảo và đối chiếu dữ liệu. Thư mục này không thuộc luồng chạy hiện tại và không được Express phục vụ.
