const { randomBytes } = require('node:crypto');
const mongoose = require('mongoose');
const { startLocalMongo } = require('./localMongo.cjs');

async function startReportFixture() {
  const local = await startLocalMongo();
  let server;
  async function stop() {
    if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    await mongoose.disconnect();
    await local.stop();
  }
  try {
    process.env.JWT_SECRET = randomBytes(32).toString('hex');
    process.env.MONGODB_URI = local.uri;
    await mongoose.connect(local.uri, { dbName: 'report_verification' });
    const User = require('../src/models/User');
    const Customer = require('../src/models/Customer');
    const Order = require('../src/models/Order');
    require('../src/models/Employee');
    const passwordHash = await User.hashPassword('ReportDemo123');
    await User.create([
      { username: 'reportadmin', displayName: 'Quản trị báo cáo', passwordHash, role: 'admin' },
      { username: 'reportcashier', displayName: 'Thu ngân', passwordHash, role: 'cashier' }
    ]);
    const customerIds = Array.from({ length: 22 }, () => new mongoose.Types.ObjectId());
    await Customer.collection.insertMany(customerIds.map((_id, index) => ({ _id, customerCode: `KH${String(index + 1).padStart(4, '0')}`,
      fullName: index < 2 ? 'Nguyễn Văn An' : `Khách hàng ${index + 1}`, phone: `090000${String(index).padStart(4, '0')}`, isActive: true })));
    let serial = 0;
    function order(options = {}) {
      const _id = new mongoose.Types.ObjectId(); const orderCode = `DH${String(++serial).padStart(6, '0')}`;
      return { _id, orderCode, customer: null, customerName: 'Khách lẻ', customerPhone: '',
        orderedAt: new Date('2026-08-15T00:00:00Z'), completedAt: new Date('2026-09-02T05:00:00Z'),
        items: [{ name: 'Gà giòn', quantity: 2, unitPrice: 50000, lineTotal: 100000 }],
        subtotal: 100000, shippingFee: 10000, discount: 5000, total: 105000,
        orderType: 'delivery', status: 'completed', payment: { method: 'cash', status: 'paid' }, ...options };
    }
    const rows = customerIds.map(customer => order({ customer }));
    rows.push(order({ customer: customerIds[0], completedAt: new Date('2026-08-31T17:00:00Z') }));
    rows.push(order({ completedAt: new Date('2026-09-03T16:59:59.999Z') }));
    rows.push(order({ completedAt: new Date('2026-09-03T05:00:00Z'),
      items: [{ name: 'Khoai tây', quantity: 3, unitPrice: 10000, lineTotal: 30000 }, { name: 'Gà giòn', quantity: 1, unitPrice: 50000, lineTotal: 50000 }],
      subtotal: 80000, shippingFee: 0, discount: 0, total: 80000 }));
    rows.push(order({ customer: customerIds[0], payment: { method: 'cod', status: 'unpaid' } }));
    rows.push(order({ customer: customerIds[0], payment: { method: 'card', status: 'refunded' } }));
    rows.push(order({ status: 'cancelled' }), order({ status: 'pending', completedAt: null }), order({ completedAt: null }));
    rows.push(order({ completedAt: new Date('2026-09-03T17:00:00Z') }));
    rows.push(order({ completedAt: new Date('2026-08-31T16:59:59.999Z') }));
    await Order.collection.insertMany(rows);
    await Order.init();
    const app = require('../src/app');
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
    const url = `http://127.0.0.1:${server.address().port}`;
    async function login(username = 'reportadmin') {
      const response = await fetch(`${url}/api/v1/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password: 'ReportDemo123' }) });
      if (!response.ok) throw new Error(`Fixture login failed: ${response.status}`);
      return response.headers.get('set-cookie').split(';')[0];
    }
    return { stop, url, login, customerIds, rows };
  } catch (error) { await stop(); throw error; }
}

module.exports = { startReportFixture };
