const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const homepagePath = path.resolve(__dirname, '../../../../frontend/khachhang/homepage.js');
const homepageSource = fs.readFileSync(homepagePath, 'utf8');
const fallbackImage = 'https://jollibee.com.vn/media/logo-footer.png';

function product(_id, name, price, overrides = {}) {
  return { _id, name, price, image: `${_id}.png`, canOrder: true, availableQuantity: 3, ...overrides };
}

function createHomepage(products = [], searchValue = '') {
  const calls = { updates: 0, toggles: [], toasts: [], rendered: [] };
  let searchInput = { value: searchValue };
  const context = vm.createContext({
    document: {
      addEventListener() {},
      getElementById(id) { return id === 'search-input' ? searchInput : null; }
    },
    window: {
      showToast(...args) { calls.toasts.push(args); }
    },
    console
  });

  // Run the real homepage script, but keep browser startup and UI effects isolated.
  vm.runInContext(homepageSource, context, { filename: homepagePath });
  context.testProducts = products;
  vm.runInContext('allProducts = testProducts', context);
  context.updateCartUI = () => { calls.updates += 1; };
  context.toggleCart = value => { calls.toggles.push(value); };
  context.renderProducts = value => { calls.rendered.push(Array.from(value)); };

  return {
    calls,
    addToCart: id => context.addToCart(id),
    searchProducts: () => context.searchProducts(),
    cart: () => JSON.parse(vm.runInContext('JSON.stringify(cart)', context)),
    setSearchInput: value => { searchInput = value; }
  };
}

const chicken = () => product('ga', 'Gà rán', 35000);
const menu = () => [
  chicken(),
  product('mi', 'Mì Ý', 40000),
  product('combo', 'Combo Gà rán', 85000)
];

test('UT_CART_01: thêm món vào giỏ rỗng', () => {
  const page = createHomepage([chicken()]);
  page.addToCart('ga');
  assert.deepEqual(page.cart(), [{
    _id: 'ga', name: 'Gà rán', image: 'ga.png', quantity: 1,
    unitPrice: 35000, lineTotal: 35000, maxQuantity: 3, selected: true
  }]);
  assert.equal(page.calls.updates, 1);
  assert.deepEqual(page.calls.toggles, [true]);
});

test('UT_CART_02: thêm lại món tăng số lượng trên cùng một dòng', () => {
  const page = createHomepage([chicken()]);
  page.addToCart('ga');
  page.addToCart('ga');
  assert.equal(page.cart().length, 1);
  assert.equal(page.cart()[0].quantity, 2);
  assert.equal(page.cart()[0].lineTotal, 70000);
});

test('UT_CART_03: chặn thêm vượt số lượng khả dụng', () => {
  const page = createHomepage([product('ga', 'Gà rán', 35000, { availableQuantity: 1 })]);
  page.addToCart('ga');
  page.addToCart('ga');
  assert.equal(page.cart()[0].quantity, 1);
  assert.equal(page.calls.updates, 1);
  assert.match(page.calls.toasts[0][0], /tối đa 1 phần/);
});

test('UT_CART_04: chặn món không thể đặt', () => {
  const page = createHomepage([product('ga', 'Gà rán', 35000, { canOrder: false })]);
  page.addToCart('ga');
  assert.deepEqual(page.cart(), []);
  assert.equal(page.calls.updates, 0);
  assert.match(page.calls.toasts[0][0], /Món ăn hết/);
});

test('UT_CART_05: mã món không tồn tại không thay đổi giỏ', () => {
  const page = createHomepage([chicken()]);
  page.addToCart('missing');
  assert.deepEqual(page.cart(), []);
  assert.equal(page.calls.updates, 0);
  assert.deepEqual(page.calls.toggles, []);
});

test('UT_CART_06: dùng ảnh dự phòng khi món không có ảnh', () => {
  const page = createHomepage([product('ga', 'Gà rán', 35000, { image: '' })]);
  page.addToCart('ga');
  assert.equal(page.cart()[0].image, fallbackImage);
});

test('UT_CART_07: thêm món khác giữ nguyên món trước', () => {
  const page = createHomepage(menu());
  page.addToCart('ga');
  page.addToCart('mi');
  assert.deepEqual(page.cart().map(({ _id, quantity, lineTotal }) => ({ _id, quantity, lineTotal })), [
    { _id: 'ga', quantity: 1, lineTotal: 35000 },
    { _id: 'mi', quantity: 1, lineTotal: 40000 }
  ]);
});

test('UT_CART_08: thêm combo đúng mã và đơn giá', () => {
  const page = createHomepage(menu());
  page.addToCart('combo');
  assert.equal(page.cart()[0]._id, 'combo');
  assert.equal(page.cart()[0].unitPrice, 85000);
});

test('UT_SEARCH_01: tìm đúng tên món', () => {
  const page = createHomepage(menu(), 'Mì Ý');
  page.searchProducts();
  assert.deepEqual(page.calls.rendered[0].map(item => item._id), ['mi']);
});

test('UT_SEARCH_02: tìm theo một phần tên, giữ thứ tự nguồn', () => {
  const page = createHomepage(menu(), 'Gà rán');
  page.searchProducts();
  assert.deepEqual(page.calls.rendered[0].map(item => item._id), ['ga', 'combo']);
});

test('UT_SEARCH_03: không phân biệt chữ hoa và chữ thường', () => {
  const page = createHomepage(menu(), 'MÌ Ý');
  page.searchProducts();
  assert.deepEqual(page.calls.rendered[0].map(item => item._id), ['mi']);
});

test('UT_SEARCH_04: bỏ khoảng trắng đầu và cuối từ khóa', () => {
  const page = createHomepage(menu(), '  Mì Ý  ');
  page.searchProducts();
  assert.deepEqual(page.calls.rendered[0].map(item => item._id), ['mi']);
});

test('UT_SEARCH_05: từ khóa rỗng trả toàn bộ thực đơn theo thứ tự', () => {
  const products = menu();
  const page = createHomepage(products, '');
  page.searchProducts();
  assert.deepEqual(page.calls.rendered[0], products);
});

test('UT_SEARCH_06: từ khóa không khớp trả danh sách rỗng', () => {
  const page = createHomepage(menu(), 'Pizza');
  page.searchProducts();
  assert.equal(page.calls.rendered.length, 1);
  assert.deepEqual(page.calls.rendered[0], []);
});

test('UT_SEARCH_07: món thiếu tên không gây lỗi', () => {
  const page = createHomepage([{ _id: 'unknown', name: undefined }], 'gà');
  assert.doesNotThrow(() => page.searchProducts());
  assert.deepEqual(page.calls.rendered[0], []);
});

test('UT_SEARCH_08: không có ô tìm kiếm thì không render', () => {
  const page = createHomepage(menu());
  page.setSearchInput(null);
  page.searchProducts();
  assert.deepEqual(page.calls.rendered, []);
});
