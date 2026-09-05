# Kiến trúc dự án

## Nguyên tắc

Dự án áp dụng MVC cho REST API và tách riêng mã chạy trên trình duyệt:

- **View** nằm trong `frontend/`: HTML, CSS, JavaScript phía trình duyệt và tài nguyên tĩnh.
- **Controller** nằm trong `backend/src/controllers/`: lấy dữ liệu HTTP từ request, gọi service và tạo response.
- **Model** nằm trong `backend/src/models/`: schema, trạng thái và thao tác dữ liệu MongoDB.
- **Route** nằm trong `backend/src/routes/`: chỉ ánh xạ URL, HTTP method, middleware và controller.
- **Service** nằm trong `backend/src/services/`: xử lý nghiệp vụ và không phụ thuộc trực tiếp vào HTTP hoặc Mongoose model.
- **Repository** nằm trong `backend/src/repositories/`: nơi duy nhất trong request flow gọi Mongoose model để đọc/ghi database.
- **Middleware** nằm trong `backend/src/middleware/`: xác thực, phân quyền và xử lý lỗi xuyên suốt.

Vì backend là REST API trả JSON, view không được render bằng template engine trong `backend`; Express chỉ phục vụ thư mục `frontend/` qua các URL công khai hiện có.

## Luồng xử lý

```text
Browser (frontend)
       |
       v
Route -> Middleware -> Controller -> Service -> Repository -> Model -> MongoDB
                            |
                            v
                      JSON response
```

`backend/src/app.js` chỉ ghép middleware, API route và static route. `backend/src/server.js` chịu trách nhiệm kiểm tra môi trường, kết nối cơ sở dữ liệu và khởi động/dừng HTTP server.

## Quy tắc thêm chức năng

1. Thêm endpoint vào file phù hợp trong `routes/`; không viết truy vấn database hoặc nghiệp vụ trực tiếp tại đây.
2. Thêm hàm xử lý HTTP vào `controllers/`; controller không chứa quy tắc nghiệp vụ hoặc truy vấn dữ liệu.
3. Đưa quy tắc, điều kiện và quy trình nghiệp vụ vào `services/`.
4. Đưa toàn bộ lệnh đọc/ghi Mongoose vào `repositories/`.
5. Chỉ đặt schema và hành vi của entity trong `models/`.
6. Đặt mọi file giao diện và tài nguyên trình duyệt trong `frontend/`.

Các script seed/migrate trong `backend/src/scripts/` là tác vụ hạ tầng chạy độc lập, không thuộc request flow HTTP nên có thể gọi model trực tiếp.

## Tài liệu tham chiếu

- [MDN – Express Tutorial: Routes and controllers](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes) mô tả route nhận HTTP request và chuyển sang controller làm việc với model.
- [Express – Application generator](https://expressjs.com/en/starter/generator/) xác nhận cách tách `routes`, tài nguyên tĩnh và phần khởi động ứng dụng trong một dự án Express.
- [Microsoft Learn – Overview of ASP.NET Core MVC](https://learn.microsoft.com/en-us/aspnet/core/mvc/overview) mô tả trách nhiệm của Model, View, Controller và nguyên tắc separation of concerns. Nguyên tắc MVC là độc lập framework nên được dùng để xác nhận ranh giới trách nhiệm cho API Express này.
