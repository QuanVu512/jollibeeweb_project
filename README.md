# Jollibee Project

Phiên bản này chuyển **riêng khu vực admin** từ PHP/MySQL sang REST API dùng Express.js và MongoDB. Các màn hình của khách hàng, bán hàng, bếp và giao hàng vẫn được giữ nguyên để các thành viên khác có thể tiếp tục làm và chuyển đổi dần.

## Cấu trúc mới

```text
jollibee_project/
├── admin/                         # Frontend admin: HTML/CSS/JavaScript thuần
│   ├── index.html                 # Quản lý tài khoản
│   ├── staff.html                 # Quản lý hồ sơ nhân viên
│   ├── report.html                # Thống kê và xuất Excel
│   ├── login.html                 # Đăng nhập riêng cho admin
│   └── assets/
│       ├── css/admin.css
│       └── js/                    # Mỗi trang có một file xử lý riêng
├── backend/                       # Web service Express.js
│   ├── src/
│   │   ├── config/                # Biến môi trường, kết nối MongoDB
│   │   ├── constants/             # Vai trò và trạng thái dùng chung
│   │   ├── controllers/           # Nhận request và trả response
│   │   ├── middleware/            # Xác thực, phân quyền, xử lý lỗi
│   │   ├── models/                # MongoDB/Mongoose schemas
│   │   ├── routes/                # REST API endpoints
│   │   ├── scripts/               # Tạo admin, chuyển dữ liệu MySQL cũ
│   │   ├── validators/            # Kiểm tra dữ liệu đầu vào
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── banhang/, bep/, giaohang/, ... # Phần PHP cũ của các thành viên khác
└── admin/*.php                    # Bản admin PHP cũ, giữ để đối chiếu
```

Khi chạy bằng Express, `/admin/` sẽ dùng `index.html`; các file PHP cũ không được Express thực thi.

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

- Frontend chỉ gọi API qua `admin/assets/js/api.js`; không đặt câu lệnh MongoDB trong JavaScript phía trình duyệt.
- Mỗi nghiệp vụ backend đi theo luồng `route → middleware → controller → model`.
- Không commit file `backend/.env` hoặc mật khẩu thật.
- Thành viên làm module khác có thể tạo route/model riêng mà không sửa controller admin.
- Đơn hàng mới nên lưu tên và giá món tại thời điểm mua trong `orders.items[]`; báo cáo nhờ vậy không bị sai khi tên/giá sản phẩm thay đổi sau này.
