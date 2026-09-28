const test = require('node:test');
const assert = require('node:assert/strict');
const Customer = require('../src/models/Customer');
const { validateProfile, getProfile, updateProfile } = require('../src/controllers/customerProfile.controller');
const { validateDeliveryAddress } = require('../src/controllers/customerOrder.controller');

test('normalizes editable fields and ignores account and privileges', () => {
  assert.deepEqual(validateProfile({ fullName: '  Nguyễn An  ', address: '  12 Nguyễn Huệ ', account: 'other', loyaltyPoints: 999, role: 'admin', birthDate: '' }), {
    fullName: 'Nguyễn An', address: '12 Nguyễn Huệ', birthDate: null
  });
});
test('rejects invalid profile values', () => {
  for (const input of [null, [], { fullName: ' ' }, { phone: {} }, { phone: 'abc' }, { email: 'invalid' }, { birthDate: '2025-02-30' }, { birthDate: '2999-01-01' }, { gender: 'invalid' }, { address: 'a'.repeat(301) }]) {
    assert.throws(() => validateProfile(input));
  }
});
test('reads only the signed-in customer and returns only profile fields', async t => {
  t.mock.method(Customer, 'findOne', async filter => {
    assert.deepEqual(filter, { $or: [{ account: 'signed-in' }], isActive: true });
    return { fullName: 'An', address: '12 Nguyễn Huệ', account: 'signed-in', loyaltyPoints: 100 };
  });
  let result;
  await getProfile({ user: { _id: 'signed-in' } }, { json: value => { result = value; } });
  assert.equal(result.data.profile.address, '12 Nguyễn Huệ');
  assert.equal(result.data.profile.account, undefined);
});
test('does not expose a legacy username stored in the phone field', async t => {
  t.mock.method(Customer, 'findOne', async () => ({ fullName: 'An', phone: 'nguyenan' }));
  let result;
  await getProfile({ user: { _id: 'signed-in' } }, { json: value => { result = value; } });
  assert.equal(result.data.profile.phone, '');
});
test('updates only the signed-in customer with validation enabled', async t => {
  t.mock.method(Customer, 'findOneAndUpdate', async (filter, update, options) => {
    assert.deepEqual(filter, { $or: [{ account: 'signed-in' }], isActive: true });
    assert.deepEqual(update, { $set: { fullName: 'An', address: 'Địa chỉ mới' } });
    assert.equal(options.runValidators, true);
    assert.equal(options.new, true);
    return update.$set;
  });
  let result;
  await updateProfile({ user: { _id: 'signed-in' }, body: { account: 'someone-else', fullName: 'An', address: 'Địa chỉ mới' } }, { json: value => { result = value; } });
  assert.equal(result.data.profile.address, 'Địa chỉ mới');
});
test('missing customer does not create a new profile', async t => {
  t.mock.method(Customer, 'findOne', async () => null);
  await assert.rejects(getProfile({ user: { _id: 'missing' } }, {}), /Không tìm thấy/);
});
test('validates and normalizes a customer order delivery address', () => {
  assert.equal(validateDeliveryAddress('  12 Nguyễn Huệ, Quận 1  '), '12 Nguyễn Huệ, Quận 1');
  assert.throws(() => validateDeliveryAddress('   '), /nhập địa chỉ/);
  assert.throws(() => validateDeliveryAddress('a'.repeat(301)), /300 ký tự/);
});
