const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRegistration } = require('../src/validators/registrationValidator');
const User = require('../src/models/User');
const userRepository = require('../src/repositories/user.repository');
const { register } = require('../src/controllers/auth.controller');
const valid = { username: 'TestUser', displayName: 'Nguyễn An', password: 'password123' };
test('registration normalizes username and validates all optional profile fields', () => {
  assert.equal(validateRegistration(valid).username, 'testuser');
  for (const data of [null, [], { ...valid, username: {} }, { ...valid, username: 'a' }, { ...valid, password: 'short' }, { ...valid, password: 'é'.repeat(40) }, { ...valid, displayName: '   ' }, { ...valid, phone: '1-------' }, { ...valid, email: 'invalid' }, { ...valid, birthDate: '2026-02-30' }, { ...valid, birthDate: '2999-01-01' }, { ...valid, gender: 'invalid' }, { ...valid, address: {} }]) assert.throws(() => validateRegistration(data));
});
test('duplicate normalized username is rejected before creating a customer', async t => {
  t.mock.method(userRepository, 'findByUsername', async username => { assert.equal(username, 'testuser'); return { _id: 'exists' }; });
  t.mock.method(User, 'hashPassword', () => assert.fail('Should not hash or write for a duplicate'));
  await assert.rejects(register({ body: valid }, {}), error => error.statusCode === 409);
});
