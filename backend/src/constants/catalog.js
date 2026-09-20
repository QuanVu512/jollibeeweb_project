const CATEGORIES = Object.freeze([
  { code: 'MonNgon', name: 'Món ngon phải thử', slug: 'mon-ngon-phai-thu', sortOrder: 1 },
  { code: 'GaGion', name: 'Gà giòn vui vẻ', slug: 'ga-gion-vui-ve', sortOrder: 2 },
  { code: 'GaSotCay', name: 'Gà sốt cay', slug: 'ga-sot-cay', sortOrder: 3 },
  { code: 'BurgerCom', name: 'Burger & Cơm', slug: 'burger-com', sortOrder: 4 },
  { code: 'MiY', name: 'Mỳ Ý Jolly', slug: 'my-y-jolly', sortOrder: 5 },
  { code: 'PhanAnPhu', name: 'Phần ăn phụ', slug: 'phan-an-phu', sortOrder: 6 },
  { code: 'TrangMieng', name: 'Món tráng miệng', slug: 'mon-trang-mieng', sortOrder: 7 },
  { code: 'ThucUong', name: 'Thức uống', slug: 'thuc-uong', sortOrder: 8 }
]);

const LEGACY_CATEGORY_CODES = Object.freeze({
  1: 'GaGion',
  2: 'GaSotCay',
  3: 'BurgerCom',
  4: 'MiY',
  5: 'PhanAnPhu',
  6: 'TrangMieng',
  7: 'ThucUong'
});

module.exports = { CATEGORIES, LEGACY_CATEGORY_CODES };
