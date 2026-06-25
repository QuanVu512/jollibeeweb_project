# TODO - Chuyển kitchen-login.html và kitchen.html sang mục bep

- [x] Bước 1: Tạo/điều chỉnh thư mục `bep/` để chứa các trang bếp.
- [x] Bước 2: Di chuyển nội dung/copy `backend/public/kitchen.html` -> `bep/kitchen.html`.
- [x] Bước 3: Di chuyển/copy `backend/public/kitchen-login.html` -> `bep/kitchen-login.html`.
- [x] Bước 4: Cập nhật `backend/src/app.js` để serve `/bep/kitchen.html` và `/bep/kitchen-login.html`.
- [x] Bước 5: Giữ tương thích bằng redirect từ `/kitchen.html` và `/kitchen-login.html` sang `/bep/...`.
- [x] Bước 6: Cập nhật lại link script trong `bep/kitchen.html` để trỏ đúng `bep.js`.
- [x] Bước 7: Chạy test/kiểm tra bằng cách mở các URL trong trình duyệt (hoặc curl) để đảm bảo không gãy route.

