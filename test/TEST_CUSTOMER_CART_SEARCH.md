# THIẾT KẾ KIỂM THỬ PHẦN KHÁCH HÀNG - GIỎ HÀNG VÀ TÌM KIẾM MÓN ĂN

**Chức năng:** Thêm sản phẩm vào giỏ hàng và tìm kiếm sản phẩm theo tên trên trang chủ khách hàng.  
**Mã nguồn:** `frontend/khachhang/homepage.js`, `frontend/khachhang/homepage.html`.  
**API liên quan:** `GET /api/v1/products` để tải thực đơn. Thêm vào giỏ và tìm kiếm là thao tác ở frontend, không có endpoint HTTP riêng.  
**Kiểm thử tự động hiện có:** `backend/test/services/customer/homepage.unit.test.js`.

---

## 1. KIỂM THỬ ĐƠN VỊ (UNIT TEST)

**Đối tượng:** `addToCart(productId)` và `searchProducts()`.  
**Công nghệ:** `node:test`, `node:assert/strict`, `node:vm`.  
**Cách cô lập:** Chạy mã nguồn `homepage.js` trong ngữ cảnh giả lập; mock danh sách sản phẩm, ô tìm kiếm, `renderProducts`, `updateCartUI`, `toggleCart` và `showToast`. Không gọi API, MongoDB hoặc kiểm tra lưu `localStorage`.  
**Lệnh chạy từ thư mục `backend`:** `node --test test/services/customer/homepage.unit.test.js`.  
**Kết quả đã chạy:** 16/16 ca PASS, 0 ca FAIL.

### 1.1. Ma trận unit test chức năng thêm vào giỏ hàng

| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào / Thao tác | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UT_CART_01** | Thêm món vào giỏ rỗng | Gà rán (`ga`), giá 35.000, ảnh `ga.png`, `canOrder=true`, `availableQuantity=3`; gọi `addToCart("ga")` | Một dòng giỏ: đúng mã, tên, ảnh, số lượng 1, đơn giá và thành tiền 35.000, giới hạn 3, `selected=true`; cập nhật giao diện và mở giỏ | Đúng các trường; `updateCartUI` và `toggleCart(true)` được gọi | **PASS** |
| **UT_CART_02** | Thêm lại cùng món | Gọi `addToCart("ga")` hai lần | Một dòng Gà rán, số lượng 2, thành tiền 70.000 | Đúng một dòng, số lượng 2, thành tiền 70.000 | **PASS** |
| **UT_CART_03** | Chặn vượt số lượng khả dụng | Gà rán chỉ còn 1 phần; gọi thêm hai lần | Số lượng giữ ở 1; chỉ cập nhật giỏ một lần; thông báo giới hạn 1 phần | Đúng số lượng, số lần cập nhật và thông báo | **PASS** |
| **UT_CART_04** | Chặn món không thể đặt | Gà rán có `canOrder=false`; gọi thêm | Giỏ rỗng, không cập nhật giao diện; thông báo “Món ăn hết” | Giỏ rỗng và có thông báo phù hợp | **PASS** |
| **UT_CART_05** | Mã món không tồn tại | Danh sách chỉ có `ga`; gọi `addToCart("missing")` | Giỏ không đổi; không cập nhật hay mở giỏ | Giỏ rỗng, không có thao tác giao diện | **PASS** |
| **UT_CART_06** | Dùng ảnh dự phòng | Gà rán có `image=""`; gọi thêm | Dòng giỏ dùng `https://jollibee.com.vn/media/logo-footer.png` | Ảnh dự phòng đúng URL | **PASS** |
| **UT_CART_07** | Thêm món khác | Thêm Gà rán giá 35.000 rồi Mì Ý giá 40.000 | Hai dòng riêng, mỗi món số lượng 1 và thành tiền đúng | Có hai dòng đúng thứ tự, mã món và thành tiền | **PASS** |
| **UT_CART_08** | Thêm sản phẩm Combo | Combo Gà rán (`combo`), giá 85.000; gọi thêm | Dòng giỏ giữ mã `combo` và đơn giá 85.000 | Đúng mã và đơn giá | **PASS** |

### 1.2. Ma trận unit test chức năng tìm kiếm món ăn

**Lưu ý:** `searchProducts()` chỉ lọc theo **tên sản phẩm**, có chuyển sang chữ thường và bỏ khoảng trắng đầu/cuối. Hàm không lọc loại Món lẻ/Combo; bộ lọc danh mục là hàm `filterCategory()` riêng.

| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UT_SEARCH_01** | Tìm đúng tên món | Danh sách Gà rán, Mì Ý, Combo Gà rán; nhập `Mì Ý` | Chỉ chuyển Mì Ý cho `renderProducts` | Chỉ có Mì Ý | **PASS** |
| **UT_SEARCH_02** | Tìm theo một phần tên | Nhập `Gà rán` | Gà rán và Combo Gà rán, đúng thứ tự ban đầu | Đúng hai sản phẩm và thứ tự | **PASS** |
| **UT_SEARCH_03** | Không phân biệt hoa/thường | Nhập `MÌ Ý` | Tìm được Mì Ý | Tìm được Mì Ý | **PASS** |
| **UT_SEARCH_04** | Bỏ khoảng trắng đầu/cuối | Nhập `  Mì Ý  ` | Tìm được Mì Ý | Tìm được Mì Ý | **PASS** |
| **UT_SEARCH_05** | Từ khóa rỗng | Nhập chuỗi rỗng | Chuyển toàn bộ danh sách, giữ dữ liệu và thứ tự | Đúng toàn bộ danh sách | **PASS** |
| **UT_SEARCH_06** | Không có kết quả | Nhập `Pizza` khi thực đơn không có Pizza | Gọi `renderProducts` một lần với danh sách rỗng | Đúng một lần và danh sách rỗng | **PASS** |
| **UT_SEARCH_07** | Món thiếu tên | Một sản phẩm có `name=undefined`; tìm `gà` | Không ném lỗi; danh sách kết quả rỗng | Không lỗi, kết quả rỗng | **PASS** |
| **UT_SEARCH_08** | Thiếu ô tìm kiếm | `getElementById("search-input")` trả `null` | Không gọi `renderProducts` | Không gọi `renderProducts` | **PASS** |

---

## 2. THIẾT KẾ KIỂM THỬ TÍCH HỢP (INTEGRATION TEST)

**Trạng thái:** Chưa chạy các ca tích hợp dưới đây. Cột “Kết quả thực tế” chỉ được điền sau khi chạy bằng môi trường kiểm thử. Không suy ra PASS từ kết quả unit test.

### 2.1. Chức năng thêm vào giỏ hàng

**Các thành phần tham gia:** `GET /api/v1/products` → `fetchProducts()` → `allProducts` → `renderProducts()` → `addToCart()` → `updateCartUI()` → `saveCart()` → `localStorage`. Không có API `POST /cart` hoặc bản ghi giỏ hàng trong MongoDB ở luồng này.

#### Bước 1: Xác định điều kiện (Conditions) và hành động (Actions)

1. **C1 (Menu Loaded):** API thực đơn tải thành công?
2. **C2 (Product Exists):** Mã món có trong `allProducts`?
3. **C3 (Product Available):** Sản phẩm có thể đặt (`canOrder !== false`)?
4. **C4 (Within Limit):** Lần thêm này không vượt `availableQuantity` của món đã có trong giỏ?

- **A1:** Hiển thị lỗi không thể tải thực đơn; không có sản phẩm để chọn.
- **A2:** Không thay đổi giỏ vì không tìm thấy mã món.
- **A3:** Giữ nguyên giỏ; hiển thị thông báo “Món ăn hết”.
- **A4:** Giữ nguyên số lượng; thông báo số phần tối đa.
- **A5:** Thêm mới hoặc tăng số lượng, cập nhật giao diện giỏ và thử lưu vào `localStorage`.

#### Bước 2: Bảng quyết định (Decision Table)

Ký hiệu **T**: đúng; **F**: sai; **—**: không cần xét; **X**: hành động xảy ra.

| Thành phần | Điều kiện / Hành động | R1 | R2 | R3 | R4 | R5 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Conditions** | **C1:** Tải thực đơn thành công? | **F** | **T** | **T** | **T** | **T** |
| | **C2:** Mã món tồn tại? | — | **F** | **T** | **T** | **T** |
| | **C3:** Món có thể đặt? | — | — | **F** | **T** | **T** |
| | **C4:** Chưa vượt giới hạn? | — | — | — | **F** | **T** |
| **Actions** | **A1:** Báo lỗi tải thực đơn | **X** | | | | |
| | **A2:** Không đổi giỏ vì thiếu món | | **X** | | | |
| | **A3:** Báo món ăn hết | | | **X** | | |
| | **A4:** Báo giới hạn số lượng | | | | **X** | |
| | **A5:** Cập nhật giỏ và thử lưu | | | | | **X** |
| **Mapping** | **Ca kiểm thử** | **IT_CART_05** | **IT_CART_04** | **IT_CART_02** | **IT_CART_03** | **IT_CART_01 / 06** |

#### Bước 3: Ma trận kịch bản kiểm thử tích hợp

| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào / Môi trường | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **IT_CART_01** | Tải món và thêm thành công | API trả Gà rán còn 3 phần; giỏ rỗng; nhấn Thêm | Giao diện giỏ có Gà rán × 1; icon giỏ cập nhật; giỏ được lưu trong `localStorage` của phiên/người dùng | Chưa ghi nhận | **CHƯA CHẠY** |
| **IT_CART_02** | Món đã hết | API trả Gà rán với `canOrder=false` | Nút Thêm bị vô hiệu hóa, hiển thị “Món ăn hết”; giỏ không đổi | Chưa ghi nhận | **CHƯA CHẠY** |
| **IT_CART_03** | Đạt giới hạn số lượng | API trả `availableQuantity=1`; giỏ đã có 1 phần; thử thêm lần nữa | Số lượng vẫn là 1, hiển thị thông báo giới hạn | Chưa ghi nhận | **CHƯA CHẠY** |
| **IT_CART_04** | Mã món không tồn tại trong dữ liệu đã tải | Gọi `addToCart("missing")` khi `allProducts` không có mã này | Không phát sinh dòng giỏ, không lưu thay đổi | Chưa ghi nhận | **CHƯA CHẠY** |
| **IT_CART_05** | API thực đơn lỗi | `GET /api/v1/products` trả lỗi | Giao diện hiển thị thông báo không thể tải thực đơn, không hiển thị sản phẩm như khi tải thành công | Chưa ghi nhận | **CHƯA CHẠY** |
| **IT_CART_06** | Khôi phục giỏ sau tải lại trang | Thêm món, tải lại trang trong cùng trình duyệt và cùng tài khoản | Đọc lại giỏ từ `localStorage`; số lượng được giới hạn theo số phần khả dụng mới nhất | Chưa ghi nhận | **CHƯA CHẠY** |

**Giới hạn của luồng lưu giỏ:** `saveCart()` bắt lỗi ghi `localStorage` và ghi cảnh báo vào console. Nếu trình duyệt chặn lưu, giỏ vẫn có thể hiện trên giao diện phiên hiện tại nhưng không được bảo đảm tồn tại sau khi tải lại trang.

### 2.2. Chức năng tìm kiếm món ăn

**Các thành phần tham gia:** `GET /api/v1/products` → `fetchProducts()` → `allProducts` → ô `search-input` → `searchProducts()` → `renderProducts()` → `product-grid`. Từ khóa được lọc trong trình duyệt; không gửi request tìm kiếm riêng lên server.

#### Bước 1: Xác định điều kiện (Conditions) và hành động (Actions)

1. **C1 (Menu Loaded):** API thực đơn tải thành công?
2. **C2 (Search Input Exists):** Có ô nhập `search-input`?
3. **C3 (Keyword Empty):** Từ khóa sau khi bỏ khoảng trắng có rỗng?
4. **C4 (Match Exists):** Có sản phẩm có tên chứa từ khóa?

- **A1:** Báo lỗi tải thực đơn; không có danh sách để tìm.
- **A2:** Không thực hiện render kết quả.
- **A3:** Render toàn bộ danh sách đã tải.
- **A4:** Render danh sách rỗng.
- **A5:** Render các sản phẩm có tên phù hợp theo thứ tự dữ liệu nguồn.

#### Bước 2: Bảng quyết định (Decision Table)

| Thành phần | Điều kiện / Hành động | R1 | R2 | R3 | R4 | R5 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Conditions** | **C1:** Tải thực đơn thành công? | **F** | **T** | **T** | **T** | **T** |
| | **C2:** Có ô tìm kiếm? | — | **F** | **T** | **T** | **T** |
| | **C3:** Từ khóa rỗng? | — | — | **T** | **F** | **F** |
| | **C4:** Có tên món phù hợp? | — | — | — | **F** | **T** |
| **Actions** | **A1:** Báo lỗi tải thực đơn | **X** | | | | |
| | **A2:** Không render kết quả | | **X** | | | |
| | **A3:** Render toàn bộ danh sách | | | **X** | | |
| | **A4:** Render danh sách rỗng | | | | **X** | |
| | **A5:** Render món phù hợp | | | | | **X** |
| **Mapping** | **Ca kiểm thử** | **IT_SEARCH_05** | **IT_SEARCH_06** | **IT_SEARCH_03** | **IT_SEARCH_04** | **IT_SEARCH_01 / 02** |

#### Bước 3: Ma trận kịch bản kiểm thử tích hợp

| Mã TC | Tên ca kiểm thử | Dữ liệu đầu vào / Môi trường | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **IT_SEARCH_01** | Tìm đúng một món | API trả Gà rán, Mì Ý, Combo Gà rán; nhập `Mì Ý` | Chỉ hiển thị Mì Ý | Chưa ghi nhận | **CHƯA CHẠY** |
| **IT_SEARCH_02** | Tìm một phần tên | Cùng thực đơn; nhập `Gà rán` | Hiển thị Gà rán và Combo Gà rán theo thứ tự nguồn | Chưa ghi nhận | **CHƯA CHẠY** |
| **IT_SEARCH_03** | Xóa từ khóa | Tìm Mì Ý rồi xóa nội dung ô tìm kiếm | Hiển thị lại toàn bộ thực đơn đã tải | Chưa ghi nhận | **CHƯA CHẠY** |
| **IT_SEARCH_04** | Không có kết quả | Nhập từ khóa không có trong tên món | `product-grid` rỗng, không giữ sản phẩm cũ | Chưa ghi nhận | **CHƯA CHẠY** |
| **IT_SEARCH_05** | API thực đơn lỗi | `GET /api/v1/products` trả lỗi trước khi tìm | Hiển thị thông báo không thể tải thực đơn | Chưa ghi nhận | **CHƯA CHẠY** |
| **IT_SEARCH_06** | Thiếu ô tìm kiếm | Trang không có phần tử `search-input` | Hàm kết thúc an toàn và không render kết quả | Chưa ghi nhận | **CHƯA CHẠY** |

---

## 3. KIỂM THỬ HỆ THỐNG (SYSTEM TEST) - KỊCH BẢN GIAO DIỆN

**Trạng thái:** Chưa chạy trên ứng dụng hoàn chỉnh. Dữ liệu thực tế và trạng thái chỉ được cập nhật sau khi thao tác trên giao diện.

| Mã TC | Chức năng | Bước thực hiện | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **ST_CART_01** | Thêm món còn bán | Mở trang chủ, nhấn Thêm vào giỏ với một món còn bán, mở giỏ | Đúng món, giá, số lượng 1; icon giỏ cập nhật | Chưa ghi nhận | **CHƯA CHẠY** |
| **ST_CART_02** | Thêm lại cùng món | Nhấn Thêm hai lần với món còn ít nhất 2 phần | Một dòng sản phẩm, số lượng 2, thành tiền tương ứng | Chưa ghi nhận | **CHƯA CHẠY** |
| **ST_CART_03** | Món hết | Quan sát món có trạng thái không thể đặt | Nút màu xám, hiển thị “Món ăn hết”, không thể nhấn | Chưa ghi nhận | **CHƯA CHẠY** |
| **ST_CART_04** | Giữ giỏ sau tải lại | Thêm món, tải lại trang, mở giỏ trong cùng trình duyệt và tài khoản | Giỏ được khôi phục theo dữ liệu đã lưu và số lượng khả dụng mới | Chưa ghi nhận | **CHƯA CHẠY** |
| **ST_SEARCH_01** | Tìm chính xác | Nhập tên món đang có trong ô tìm kiếm | Hiển thị món có tên phù hợp | Chưa ghi nhận | **CHƯA CHẠY** |
| **ST_SEARCH_02** | Tìm một phần tên | Nhập từ khóa có trong tên nhiều sản phẩm | Hiển thị tất cả sản phẩm có tên chứa từ khóa | Chưa ghi nhận | **CHƯA CHẠY** |
| **ST_SEARCH_03** | Không có kết quả | Nhập từ khóa không có trong thực đơn | Vùng sản phẩm không hiển thị món cũ | Chưa ghi nhận | **CHƯA CHẠY** |
| **ST_SEARCH_04** | Xóa từ khóa | Xóa hết nội dung ô tìm kiếm | Hiển thị lại toàn bộ danh sách đã tải | Chưa ghi nhận | **CHƯA CHẠY** |

**Quy tắc ghi kết quả:** Chỉ chuyển một ca sang **PASS** sau khi đã chạy ca đó và ghi nhận kết quả thực tế khớp kỳ vọng. Dữ liệu Gà rán, Mì Ý và Combo trong unit test là dữ liệu mock; khi chạy tích hợp hoặc hệ thống phải dùng dữ liệu thực có trong môi trường kiểm thử.
