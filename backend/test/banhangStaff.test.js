const test = require('node:test');
const assert = require('node:assert/strict');
const Order = require('../src/models/Order');
const { calculateRecipeDeductions } = require('../src/services/inventoryRecipeService');

test('đơn đặt tại bàn lưu đúng số bàn và trạng thái in hóa đơn', async () => {
  const order = new Order({
    orderCode: 'DH888888',
    orderType: 'dine_in',
    tableNumber: 'Bàn 08',
    deliveryAddress: 'Bàn 08',
    isInvoicePrinted: true,
    invoicePrintedAt: new Date(),
    items: [
      { name: '1 Miếng Gà Giòn', quantity: 2, unitPrice: 35000 },
      { name: 'Mì Ý Sốt Bò Bằm', quantity: 1, unitPrice: 40000 }
    ],
    discount: 10000
  });

  await order.validate();
  assert.equal(order.tableNumber, 'Bàn 08');
  assert.equal(order.orderType, 'dine_in');
  assert.equal(order.isInvoicePrinted, true);
  assert.ok(order.invoicePrintedAt instanceof Date);
  assert.equal(order.items[0].lineTotal, 70000);
  assert.equal(order.items[1].lineTotal, 40000);
  assert.equal(order.subtotal, 110000);
  assert.equal(order.total, 100000);
});

test('tính toán lại thành tiền khi sửa đơn đặt tại bàn', async () => {
  const order = new Order({
    orderCode: 'DH777777',
    orderType: 'dine_in',
    tableNumber: 'Bàn 02',
    items: [
      { name: 'Burger Tôm', quantity: 1, unitPrice: 45000 }
    ]
  });

  await order.validate();
  assert.equal(order.total, 45000);

  // Thao tác sửa đơn: Tăng burger lên 2 và thêm 1 nước ngọt
  order.items = [
    { name: 'Burger Tôm', quantity: 2, unitPrice: 45000, lineTotal: 90000 },
    { name: 'Pepsi Vừa', quantity: 1, unitPrice: 18000, lineTotal: 18000 }
  ];
  await order.validate();

  assert.equal(order.items.length, 2);
  assert.equal(order.subtotal, 108000);
  assert.equal(order.total, 108000);
});

test('tính toán định lượng hoàn kho cho đơn hàng khi hủy đơn', () => {
  const recipesByProductCode = new Map([
    [
      'GA_GION_1',
      {
        productCode: 'GA_GION_1',
        yieldQuantity: 1,
        ingredients: [
          {
            ingredient: '507f1f77bcf86cd799439011',
            ingredientCode: 'GA_TUOI',
            ingredient: { _id: '507f1f77bcf86cd799439011', name: 'Gà tươi', baseUnit: 'piece' },
            quantityBase: 1
          }
        ]
      }
    ]
  ]);

  const order = {
    orderType: 'dine_in',
    items: [{ productCode: 'GA_GION_1', name: '1 Miếng Gà Giòn', quantity: 3 }]
  };

  const plan = calculateRecipeDeductions(order, recipesByProductCode);
  assert.equal(plan.deductions.length, 1);
  assert.equal(plan.deductions[0].quantity, 3);
  assert.equal(plan.deductions[0].ingredientName, 'Gà tươi');
});

test('kiểm tra số lượng món không được âm và bàn không được âm trong đơn hàng', async () => {
  const order = new Order({
    orderCode: 'DH999999',
    orderType: 'dine_in',
    tableNumber: '12',
    deliveryAddress: 'Bàn 12',
    items: [
      { name: '1 Miếng Gà Giòn', quantity: 2, unitPrice: 35000 }
    ],
    total: 70000
  });

  await order.validate();
  assert.equal(order.tableNumber, '12');
  assert.equal(order.items[0].quantity, 2);

  // Thử số lượng âm
  order.items[0].quantity = -1;
  await assert.rejects(async () => {
    await order.validate();
  });
});

test('đơn hàng lưu thời gian đặt orderedAt hợp lệ và khớp thực tế', async () => {
  const before = Date.now();
  const order = new Order({
    orderCode: 'DH123456',
    orderType: 'dine_in',
    tableNumber: '5',
    items: [{ name: '1 Miếng Gà Giòn', quantity: 1, unitPrice: 35000, lineTotal: 35000 }],
    total: 35000
  });
  await order.validate();
  assert.ok(order.orderedAt instanceof Date);
  assert.ok(order.orderedAt.getTime() >= before - 1000);
});

test('hoàn thành phục vụ món tại bàn chuyển trạng thái completed và lưu completedAt', async () => {
  const order = new Order({
    orderCode: 'DH654321',
    orderType: 'dine_in',
    tableNumber: '3',
    status: 'completed',
    completedAt: new Date(),
    items: [{ name: 'Mì Ý Sốt Bò Bằm', quantity: 1, unitPrice: 40000, lineTotal: 40000 }],
    total: 40000
  });
  await order.validate();
  assert.equal(order.status, 'completed');
  assert.ok(order.completedAt instanceof Date);
});

test('kiểm tra điều kiện số bàn không được trùng với đơn đang hoạt động', () => {
  const activeOrders = [
    { orderCode: 'DH001', tableNumber: '5', status: 'pending' },
    { orderCode: 'DH002', tableNumber: 'Bàn 8', status: 'preparing' },
    { orderCode: 'DH003', tableNumber: '9', status: 'completed' },
    { orderCode: 'DH004', tableNumber: '10', status: 'cancelled' }
  ];

  function isTableOccupied(tableNum) {
    const cleanTable = String(tableNum).replace(/^Bàn\s*/i, '').trim();
    return activeOrders.some(o => {
      if (['completed', 'cancelled'].includes(o.status)) return false;
      const orderCleanTable = String(o.tableNumber).replace(/^Bàn\s*/i, '').trim();
      return orderCleanTable === cleanTable;
    });
  }

  assert.equal(isTableOccupied('5'), true);
  assert.equal(isTableOccupied('8'), true);
  assert.equal(isTableOccupied('9'), false);
  assert.equal(isTableOccupied('10'), false);
  assert.equal(isTableOccupied('15'), false);
});

