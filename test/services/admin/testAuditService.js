const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Resolve path to backend modules
const candidate1 = path.resolve(__dirname, '../../../backend');
const candidate2 = path.resolve(__dirname, '../../..');
const backendRoot = fs.existsSync(path.join(candidate1, 'src')) ? candidate1 : candidate2;

const auditLogRepository = require(path.join(backendRoot, 'src/repositories/auditLog.repository'));

// Import target unit: auditService
const auditService = require(path.join(backendRoot, 'src/services/auditService'));

// -------------------------------------------------------------
// 1. snapshot(value)
// -------------------------------------------------------------

test('UT_AUD_01: snapshot(value) - Trả về null khi giá trị là null hoặc undefined', () => {
  assert.equal(auditService.snapshot(null), null);
  assert.equal(auditService.snapshot(undefined), null);
});

test('UT_AUD_02: snapshot(value) - Loại bỏ trường passwordHash để bảo mật', () => {
  const plainObj = { username: 'admin01', passwordHash: 'secret_hash_value', role: 'admin' };
  const snap = auditService.snapshot(plainObj);

  assert.equal(snap.username, 'admin01');
  assert.equal(snap.role, 'admin');
  assert.equal(snap.passwordHash, undefined);
  assert.equal('passwordHash' in snap, false);
});

test('UT_AUD_03: snapshot(value) - Gọi toObject() khi đối tượng là Mongoose document và xóa passwordHash', () => {
  const mockMongooseDoc = {
    _id: '507f1f77bcf86cd799439011',
    username: 'staff01',
    passwordHash: 'hash_xyz',
    toObject(options) {
      assert.equal(options.depopulate, true);
      assert.equal(options.versionKey, false);
      return {
        _id: this._id,
        username: this.username,
        passwordHash: this.passwordHash
      };
    }
  };

  const snap = auditService.snapshot(mockMongooseDoc);
  assert.equal(snap.username, 'staff01');
  assert.equal(snap.passwordHash, undefined);
});

// -------------------------------------------------------------
// 2. recordAudit(context, event, session)
// -------------------------------------------------------------

test('UT_AUD_04: recordAudit(context, event, session) - Ghi nhật ký kiểm toán với đầy đủ thông tin context và event', async () => {
  const context = {
    actor: { id: '507f1f77bcf86cd799439000', username: 'admin' },
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 TestBrowser'
  };

  const event = {
    action: 'product.update',
    entityType: 'product',
    entityId: '507f1f77bcf86cd799439099',
    before: { name: 'Món cũ', price: 30000, passwordHash: 'hidden' },
    after: { name: 'Món mới', price: 35000 },
    reason: 'Điều chỉnh giá bán theo đợt khuyến mãi',
    requestId: '11111111-2222-4333-8444-555555555555',
    fingerprint: 'sha256_hash_abc123'
  };

  const mockSession = { id: 'mongo-session-1' };
  let savedEntry = null;
  let savedSession = null;

  auditLogRepository.create = async (entry, session) => {
    savedEntry = entry;
    savedSession = session;
    return { _id: 'audit_log_001', ...entry };
  };

  const result = await auditService.recordAudit(context, event, mockSession);

  assert.equal(result._id, 'audit_log_001');
  assert.deepEqual(savedEntry.actor, context.actor);
  assert.equal(savedEntry.action, 'product.update');
  assert.equal(savedEntry.entityType, 'product');
  assert.equal(savedEntry.entityId, '507f1f77bcf86cd799439099');
  assert.equal(savedEntry.before.name, 'Món cũ');
  assert.equal(savedEntry.before.passwordHash, undefined); // masked!
  assert.equal(savedEntry.after.name, 'Món mới');
  assert.equal(savedEntry.reason, 'Điều chỉnh giá bán theo đợt khuyến mãi');
  assert.equal(savedEntry.ipAddress, '127.0.0.1');
  assert.equal(savedEntry.userAgent, 'Mozilla/5.0 TestBrowser');
  assert.equal(savedSession, mockSession);
});

test('UT_AUD_05: recordAudit(context, event, session) - Ưu tiên actor từ event nếu event chỉ định actor riêng', async () => {
  const context = { actor: 'actor-context' };
  const event = {
    actor: 'actor-event-priority',
    action: 'user.login',
    entityType: 'user'
  };

  let recordedActor = null;
  auditLogRepository.create = async (entry) => {
    recordedActor = entry.actor;
    return entry;
  };

  await auditService.recordAudit(context, event);
  assert.equal(recordedActor, 'actor-event-priority');
});
