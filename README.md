# Jollibee Project

Dự án được tách thành hai phần hoạt động độc lập về trách nhiệm: giao diện tĩnh trong `frontend/` và REST API Express/MongoDB trong `backend/`. Bản PHP/MySQL cũ chỉ được lưu tại `legacy/php-app/` để đối chiếu, không thuộc luồng chạy hiện tại.

## Cấu trúc mới

```text
jollibee_project/
├── frontend/                      # View/UI: HTML, CSS, JavaScript và tài nguyên tĩnh
│   ├── admin/                     # Giao diện quản trị
│   ├── banhang/                   # Giao diện bán hàng
│   ├── bep/                       # Giao diện bếp
│   ├── khachhang/                 # Giao diện khách hàng
│   ├── shipper/                   # Giao diện giao hàng
│   └── assets/
│       ├── images/                # Hình ảnh dùng cục bộ
│       ├── js/                    # JavaScript dùng chung
│       └── vendor/menu-files/     # Tài nguyên bên thứ ba/bản lưu cũ
├── backend/                       # REST API Express.js theo MVC
│   ├── src/
│   │   ├── config/                # Cấu hình môi trường và MongoDB
│   │   ├── constants/             # Hằng số miền nghiệp vụ
│   │   ├── controllers/           # Điều phối request/response
│   │   ├── data/                  # Dữ liệu khởi tạo tĩnh
│   │   ├── middleware/            # Xác thực, phân quyền, xử lý lỗi
│   │   ├── models/                # Model và Mongoose schema
│   │   ├── repositories/          # Truy vấn và ghi dữ liệu qua Mongoose
│   │   ├── routes/                # Khai báo URL và chuỗi middleware
│   │   ├── services/              # Nghiệp vụ ứng dụng, độc lập HTTP/database
│   │   ├── validators/            # Kiểm tra dữ liệu đầu vào
│   │   ├── utils/                 # Tiện ích kỹ thuật dùng chung
│   │   ├── scripts/               # Khởi tạo và chuyển đổi dữ liệu
│   │   ├── app.js
│   │   └── server.js
│   ├── test/                      # Kiểm thử backend
│   └── package.json
├── docs/                          # Tài liệu dự án và kiến trúc
└── legacy/php-app/                # Bản PHP/MySQL cũ, không còn được phục vụ
```

Express giữ nguyên các URL `/admin`, `/banhang`, `/bep`, `/khachhang`, `/shipper`, `/assets` và phục vụ nội dung tương ứng từ `frontend/`. Xem nguyên tắc phân lớp tại [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Chuẩn bị máy

Cài Node.js 20 trở lên trên máy phát triển. Database dùng MongoDB Atlas nên không cần cài MongoDB Server, Compass hay Mongo Shell ở máy cá nhân.

- Trưởng nhóm tạo một MongoDB Atlas project và một Free cluster dùng chung.
- Mỗi thành viên có database user riêng và thêm IP hiện tại vào Atlas IP Access List.
- Mỗi thành viên lưu connection string của mình trong `backend/.env`; không gửi hoặc commit file này.

Xem hướng dẫn chi tiết tại [`docs/ATLAS_SETUP.md`](docs/ATLAS_SETUP.md).

Khởi tạo toàn bộ collection, vai trò và danh mục dùng chung trên Atlas:

```powershell
npm run init:database
```

Xem ma trận vai trò tại [`docs/ROLES_AND_DATABASE.md`](docs/ROLES_AND_DATABASE.md), thuộc tính dữ liệu tại [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) và API quản trị tại [`docs/ADMIN_BACKEND.md`](docs/ADMIN_BACKEND.md).

## Chạy dự án admin

Mở PowerShell tại thư mục dự án:

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

Mở `backend/.env`, thay `JWT_SECRET` bằng một chuỗi bí mật dài ít nhất 32 ký tự và đổi `ADMIN_PASSWORD`. Sau đó tạo tài khoản quản trị đầu tiên:

```powershell
npm run seed:admin
npm run dev
```

Với database Atlas dùng chung, chỉ người phụ trách admin chạy `npm run seed:admin` lần đầu. Script sẽ không ghi đè mật khẩu của admin đã tồn tại, trừ khi đặt `ADMIN_FORCE_RESET=true`.

Truy cập: `http://localhost:3000/admin/login.html`

Kiểm tra nhanh backend: `http://localhost:3000/health`

## Chuyển dữ liệu MySQL cũ sang MongoDB

Nếu MySQL cũ vẫn đang chạy, điền nhóm biến `MYSQL_*` trong `backend/.env`, rồi chạy:

```powershell
npm run migrate:mysql
```

Script chuyển các bảng cần cho admin:

| MySQL cũ | MongoDB mới | Mục đích |
|---|---|---|
| `NhanVien` | `employees` | Hồ sơ nhân viên |
| `KhachHang` | `customers` | Tên khách trong báo cáo |
| `MonAn` | `products` | Thông tin món |
| `DonHang` + `ChiTietDonHang` | `orders` với `items[]` | Báo cáo doanh thu/món bán |

`TaiKhoan.MatKhau` cũ dùng MD5 nên **không được chuyển**. Chạy `npm run seed:admin`, đăng nhập, rồi cấp lại tài khoản để mật khẩu được băm bằng bcrypt.

Script dùng `upsert`, vì vậy có thể chạy lại khi cần; bản ghi có cùng mã sẽ được cập nhật thay vì nhân đôi.

## REST API admin

API quản trị chuẩn có tiền tố `/api/v1/admin`. Trừ đăng nhập, các endpoint bên dưới đều yêu cầu cookie đăng nhập và quyền `admin`.

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/auth/login` | Đăng nhập admin |
| `GET` | `/auth/me` | Lấy người đang đăng nhập |
| `POST` | `/auth/logout` | Đăng xuất |
| `GET/POST` | `/admin/employees` | Danh sách / thêm nhân viên |
| `GET/PATCH/DELETE` | `/admin/employees/:id` | Xem / sửa / cho nghỉ việc |
| `GET/POST` | `/admin/accounts` | Danh sách / cấp tài khoản |
| `PATCH` | `/admin/accounts/:id/status` | Khóa hoặc mở tài khoản |
| `PATCH` | `/admin/accounts/:id/password` | Đặt lại mật khẩu |
| `DELETE` | `/admin/accounts/:id` | Thu hồi mềm tài khoản |
| `GET` | `/admin/reports/summary` | Doanh thu, giá vốn, lợi nhuận, giá trị đơn trung bình, món bán chạy |
| `GET` | `/admin/reports/export?type=orders` | Xuất file `.xlsx` |

Báo cáo nhận thêm `from=YYYY-MM-DD` và `to=YYYY-MM-DD`. `type` nhận `orders`, `revenue` hoặc `items`.

## Quy ước làm việc nhóm

- Frontend chỉ gọi API qua `frontend/admin/assets/js/api.js`; không đặt câu lệnh MongoDB trong JavaScript phía trình duyệt.
- Mỗi nghiệp vụ backend đi theo luồng `route → middleware → controller → service → repository → model`.
- Không commit file `backend/.env` hoặc mật khẩu thật.
- Thành viên làm module khác có thể tạo route/model riêng mà không sửa controller admin.
- Đơn hàng mới nên lưu tên và giá món tại thời điểm mua trong `orders.items[]`; báo cáo nhờ vậy không bị sai khi tên/giá sản phẩm thay đổi sau này.
