const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Resolve path to backend modules flexibly (whether running from root/test or backend/test)
const fs = require('node:fs');
const candidate1 = path.resolve(__dirname, '../../backend');
const candidate2 = path.resolve(__dirname, '../..');
const backendRoot = fs.existsSync(path.join(candidate1, 'src')) ? candidate1 : candidate2;
const auditService = require(path.join(backendRoot, 'src/services/auditService'));
const auditLogRepository = require(path.join(backendRoot, 'src/repositories/auditLog.repository'));
const databaseRepository = require(path.join(backendRoot, 'src/repositories/database.repository'));
const userRepository = require(path.join(backendRoot, 'src/repositories/user.repository'));
const employeeRepository = require(path.join(backendRoot, 'src/repositories/employee.repository'));
const ApiError = require(path.join(backendRoot, 'src/utils/ApiError'));
const { ROLES } = require(path.join(backendRoot, 'src/constants/roles'));

// Mock audit log & database transaction by default
auditService.recordAudit = async () => ({});
auditLogRepository.create = async () => ({});
databaseRepository.isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
databaseRepository.transaction = async (work) => work({});

// Import target unit: accountService
const accountService = require(path.join(backendRoot, 'src/services/accountService'));

// Helper to create mock User document
function createMockUser(overrides = {}) {
  const doc = {
    _id: '507f1f77bcf86cd799439011',
    username: 'staffuser01',
    role: ROLES.CASHIER,
    displayName: 'Nguyễn Văn A',
    tokenVersion: 1,
    isActive: true,
    revokedAt: null,
    employee: '507f1f77bcf86cd799439022',
    toObject() {
      return {
        _id: this._id,
        username: this.username,
        role: this.role,
        displayName: this.displayName,
        tokenVersion: this.tokenVersion,
        isActive: this.isActive,
        revokedAt: this.revokedAt,
        employee: this.employee
      };
    },
    set(fields) {
      Object.assign(this, fields);
    },
    ...overrides
  };
  return doc;
}

// Helper to create mock Employee document
function createMockEmployee(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439022',
    fullName: 'Nguyễn Văn A',
    phone: '0912345678',
    email: 'staff01@example.com',
    isActive: true,
    account: null,
    ...overrides
  };
}

// -------------------------------------------------------------
// 1. listAccounts(query)
// -------------------------------------------------------------

test('UT_ACC_01: listAccounts(query) - Lấy danh sách tài khoản thành công với bộ lọc mặc định và phân trang', async () => {
  const mockUser = createMockUser();
  userRepository.findStaffAccounts = async (filter, { skip, limit }) => {
    assert.equal(filter.role.$ne, ROLES.CUSTOMER);
    assert.equal(filter.revokedAt, null);
    assert.equal(skip, 0);
    assert.equal(limit, 10);
    return [mockUser];
  };
  userRepository.count = async (filter) => 1;

  const result = await accountService.listAccounts({ page: '1', limit: '10' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].username, 'staffuser01');
  assert.equal(result.pagination.page, 1);
  assert.equal(result.pagination.total, 1);
});

test('UT_ACC_02: listAccounts(query) - Lọc danh sách theo vai trò nhân viên hợp lệ (role = "cashier")', async () => {
  userRepository.findStaffAccounts = async (filter) => {
    assert.equal(filter.role, ROLES.CASHIER);
    return [createMockUser({ role: ROLES.CASHIER })];
  };
  userRepository.count = async () => 1;

  const result = await accountService.listAccounts({ role: ROLES.CASHIER });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].role, ROLES.CASHIER);
});

test('UT_ACC_03: listAccounts(query) - Ném lỗi khi vai trò lọc không hợp lệ', async () => {
  await assert.rejects(
    async () => {
      await accountService.listAccounts({ role: 'invalid_role' });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Vai trò lọc không hợp lệ/);
      return true;
    }
  );
});

test('UT_ACC_04: listAccounts(query) - Lọc danh sách theo trạng thái hoạt động và từ khóa tìm kiếm', async () => {
  userRepository.findStaffAccounts = async (filter) => {
    assert.equal(filter.isActive, true);
    assert.ok(filter.$or);
    return [createMockUser({ username: 'nguyenvana' })];
  };
  userRepository.count = async () => 1;

  const result = await accountService.listAccounts({ status: 'active', search: 'nguyen' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].username, 'nguyenvana');
});

// -------------------------------------------------------------
// 2. getAccount(id)
// -------------------------------------------------------------

test('UT_ACC_05: getAccount(id) - Lấy chi tiết tài khoản thành công với ID hợp lệ', async () => {
  const validId = '507f1f77bcf86cd799439011';
  userRepository.findStaffAccountById = async (id) => {
    assert.equal(id, validId);
    return createMockUser({ _id: validId, username: 'admin01' });
  };

  const account = await accountService.getAccount(validId);
  assert.equal(account._id, validId);
  assert.equal(account.username, 'admin01');
});

test('UT_ACC_06: getAccount(id) - Lấy chi tiết thất bại do ID không đúng định dạng ObjectId', async () => {
  await assert.rejects(
    async () => {
      await accountService.getAccount('invalid-object-id');
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Mã tài khoản không hợp lệ/);
      return true;
    }
  );
});

test('UT_ACC_07: getAccount(id) - Lấy chi tiết thất bại khi tài khoản không tồn tại', async () => {
  const notFoundId = '507f1f77bcf86cd799439099';
  userRepository.findStaffAccountById = async () => null;

  await assert.rejects(
    async () => {
      await accountService.getAccount(notFoundId);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /Không tìm thấy tài khoản nhân viên/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 3. createAccount(body, context)
// -------------------------------------------------------------

test('UT_ACC_08: createAccount(body, context) - Tạo tài khoản nhân viên mới thành công', async () => {
  const employeeId = '507f1f77bcf86cd799439022';
  const body = {
    username: 'newstaff01',
    password: 'Password@123',
    role: ROLES.CASHIER,
    employeeId
  };
  const context = { actor: { id: '507f1f77bcf86cd799439000' } };
  const mockEmp = createMockEmployee({ _id: employeeId });
  const mockCreatedUser = createMockUser({
    _id: '507f1f77bcf86cd799439033',
    username: 'newstaff01',
    role: ROLES.CASHIER
  });

  employeeRepository.findById = async (id) => mockEmp;
  employeeRepository.save = async (emp) => emp;
  userRepository.existsByUsername = async () => false;
  userRepository.hashPassword = async (p) => `hashed_${p}`;
  userRepository.create = async (payload) => {
    assert.equal(payload.username, 'newstaff01');
    assert.equal(payload.role, ROLES.CASHIER);
    return mockCreatedUser;
  };
  userRepository.populateEmployee = async (user) => user;

  const result = await accountService.createAccount(body, context);
  assert.equal(result.username, 'newstaff01');
  assert.equal(mockEmp.account, mockCreatedUser._id);
});

test('UT_ACC_09: createAccount(body, context) - Tạo tài khoản thất bại khi không tìm thấy nhân viên', async () => {
  const body = {
    username: 'newstaff01',
    password: 'Password@123',
    role: ROLES.CASHIER,
    employeeId: '507f1f77bcf86cd799439022'
  };
  employeeRepository.findById = async () => null;

  await assert.rejects(
    async () => {
      await accountService.createAccount(body, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /Không tìm thấy nhân viên/);
      return true;
    }
  );
});

test('UT_ACC_10: createAccount(body, context) - Tạo tài khoản thất bại khi nhân viên đã nghỉ việc (isActive = false)', async () => {
  const body = {
    username: 'newstaff01',
    password: 'Password@123',
    role: ROLES.CASHIER,
    employeeId: '507f1f77bcf86cd799439022'
  };
  employeeRepository.findById = async () => createMockEmployee({ isActive: false });

  await assert.rejects(
    async () => {
      await accountService.createAccount(body, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /Không thể cấp tài khoản cho nhân viên đã nghỉ việc/);
      return true;
    }
  );
});

test('UT_ACC_11: createAccount(body, context) - Tạo tài khoản thất bại khi nhân viên đã có tài khoản liên kết', async () => {
  const body = {
    username: 'newstaff01',
    password: 'Password@123',
    role: ROLES.CASHIER,
    employeeId: '507f1f77bcf86cd799439022'
  };
  employeeRepository.findById = async () => createMockEmployee({ account: '507f1f77bcf86cd799439088' });

  await assert.rejects(
    async () => {
      await accountService.createAccount(body, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /Nhân viên này đã có tài khoản/);
      return true;
    }
  );
});

test('UT_ACC_12: createAccount(body, context) - Tạo tài khoản thất bại do tên đăng nhập đã tồn tại', async () => {
  const body = {
    username: 'existinguser01',
    password: 'Password@123',
    role: ROLES.CASHIER,
    employeeId: '507f1f77bcf86cd799439022'
  };
  employeeRepository.findById = async () => createMockEmployee();
  userRepository.existsByUsername = async () => true;

  await assert.rejects(
    async () => {
      await accountService.createAccount(body, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /Tên đăng nhập đã tồn tại/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 4. updateAccount(id, currentUserId, body, context)
// -------------------------------------------------------------

test('UT_ACC_13: updateAccount(id, currentUserId, body, context) - Cập nhật vai trò tài khoản thành công (tăng tokenVersion)', async () => {
  const targetId = '507f1f77bcf86cd799439011';
  const currentUserId = '507f1f77bcf86cd799439099';
  const existingUser = createMockUser({ _id: targetId, role: ROLES.CASHIER, tokenVersion: 1 });

  userRepository.findByIdForMutation = async () => existingUser;
  userRepository.save = async (user) => user;
  userRepository.populateEmployee = async (user) => user;

  const updated = await accountService.updateAccount(targetId, currentUserId, { role: ROLES.KITCHEN }, {});
  assert.equal(updated.role, ROLES.KITCHEN);
  assert.equal(updated.tokenVersion, 2);
});

test('UT_ACC_14: updateAccount(id, currentUserId, body, context) - Quản trị viên tự gỡ quyền admin của chính mình bị chặn', async () => {
  const adminId = '507f1f77bcf86cd799439011';

  await assert.rejects(
    async () => {
      await accountService.updateAccount(adminId, adminId, { role: ROLES.CASHIER }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Bạn không thể tự bỏ quyền quản trị của chính mình/);
      return true;
    }
  );
});

test('UT_ACC_15: updateAccount(id, currentUserId, body, context) - Cập nhật thất bại khi tài khoản đã bị thu hồi', async () => {
  const targetId = '507f1f77bcf86cd799439011';
  const currentUserId = '507f1f77bcf86cd799439099';
  const revokedUser = createMockUser({ _id: targetId, revokedAt: new Date() });

  userRepository.findByIdForMutation = async () => revokedUser;

  await assert.rejects(
    async () => {
      await accountService.updateAccount(targetId, currentUserId, { role: ROLES.CASHIER }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /Tài khoản này đã bị thu hồi/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 5. resetAccountPassword(id, body, context)
// -------------------------------------------------------------

test('UT_ACC_16: resetAccountPassword(id, body, context) - Đặt lại mật khẩu thành công và tăng tokenVersion', async () => {
  const targetId = '507f1f77bcf86cd799439011';
  const existingUser = createMockUser({ _id: targetId, tokenVersion: 1 });

  userRepository.findByIdForMutation = async () => existingUser;
  userRepository.hashPassword = async (pwd) => `hashed_${pwd}`;
  userRepository.save = async (user) => user;

  await accountService.resetAccountPassword(targetId, { password: 'NewPassword@123' }, {});
  assert.equal(existingUser.passwordHash, 'hashed_NewPassword@123');
  assert.equal(existingUser.tokenVersion, 2);
});

test('UT_ACC_17: resetAccountPassword(id, body, context) - Đặt lại mật khẩu thất bại khi tài khoản đã bị thu hồi', async () => {
  const targetId = '507f1f77bcf86cd799439011';
  const revokedUser = createMockUser({ _id: targetId, revokedAt: new Date() });

  userRepository.findByIdForMutation = async () => revokedUser;

  await assert.rejects(
    async () => {
      await accountService.resetAccountPassword(targetId, { password: 'NewPassword@123' }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /Tài khoản này đã bị thu hồi/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 6. setAccountStatus(id, currentUserId, body, context)
// -------------------------------------------------------------

test('UT_ACC_18: setAccountStatus(id, currentUserId, body, context) - Khóa tài khoản thành công và tăng tokenVersion', async () => {
  const targetId = '507f1f77bcf86cd799439011';
  const currentUserId = '507f1f77bcf86cd799439099';
  const existingUser = createMockUser({ _id: targetId, isActive: true, tokenVersion: 1 });

  userRepository.findByIdForMutation = async () => existingUser;
  userRepository.save = async (user) => user;

  const result = await accountService.setAccountStatus(targetId, currentUserId, { isActive: false }, {});
  assert.equal(result.isActive, false);
  assert.equal(result.tokenVersion, 2);
});

test('UT_ACC_19: setAccountStatus(id, currentUserId, body, context) - Tự khóa tài khoản của chính mình bị chặn', async () => {
  const myId = '507f1f77bcf86cd799439011';

  await assert.rejects(
    async () => {
      await accountService.setAccountStatus(myId, myId, { isActive: false }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Bạn không thể tự khóa tài khoản của chính mình/);
      return true;
    }
  );
});

test('UT_ACC_20: setAccountStatus(id, currentUserId, body, context) - Cập nhật thất bại do kiểu trạng thái không hợp lệ', async () => {
  const targetId = '507f1f77bcf86cd799439011';
  const currentUserId = '507f1f77bcf86cd799439099';

  await assert.rejects(
    async () => {
      await accountService.setAccountStatus(targetId, currentUserId, { isActive: 'active_string' }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Trạng thái tài khoản không hợp lệ/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 7. deleteAccount(id, currentUserId, context)
// -------------------------------------------------------------

test('UT_ACC_21: deleteAccount(id, currentUserId, context) - Thu hồi tài khoản thành công (gỡ liên kết nhân viên, đánh dấu revokedAt)', async () => {
  const targetId = '507f1f77bcf86cd799439011';
  const currentUserId = '507f1f77bcf86cd799439099';
  const existingUser = createMockUser({
    _id: targetId,
    isActive: true,
    tokenVersion: 1,
    employee: '507f1f77bcf86cd799439022'
  });

  let detachedAccountId = null;
  employeeRepository.detachAccount = async (accId) => {
    detachedAccountId = accId;
  };
  userRepository.findByIdForMutation = async () => existingUser;
  userRepository.save = async (user) => user;

  await accountService.deleteAccount(targetId, currentUserId, {});
  assert.equal(detachedAccountId, targetId);
  assert.equal(existingUser.isActive, false);
  assert.equal(existingUser.tokenVersion, 2);
  assert.ok(existingUser.revokedAt instanceof Date);
  assert.equal(existingUser.employee, undefined);
});

test('UT_ACC_22: deleteAccount(id, currentUserId, context) - Tự thu hồi tài khoản của chính mình bị chặn', async () => {
  const myId = '507f1f77bcf86cd799439011';

  await assert.rejects(
    async () => {
      await accountService.deleteAccount(myId, myId, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Bạn không thể tự thu hồi tài khoản của chính mình/);
      return true;
    }
  );
});

test('UT_ACC_23: deleteAccount(id, currentUserId, context) - Thu hồi thất bại khi tài khoản đã bị thu hồi trước đó', async () => {
  const targetId = '507f1f77bcf86cd799439011';
  const currentUserId = '507f1f77bcf86cd799439099';
  const revokedUser = createMockUser({ _id: targetId, revokedAt: new Date() });

  userRepository.findByIdForMutation = async () => revokedUser;

  await assert.rejects(
    async () => {
      await accountService.deleteAccount(targetId, currentUserId, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /Tài khoản này đã bị thu hồi trước đó/);
      return true;
    }
  );
});
