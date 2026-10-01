const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
// Resolve path to backend modules
const candidate1 = path.resolve(__dirname, '../../backend');
const candidate2 = path.resolve(__dirname, '../..');
const backendRoot = fs.existsSync(path.join(candidate1, 'src')) ? candidate1 : candidate2;

// Add backend node_modules to paths so modules like jsonwebtoken and mongoose can be required
module.paths.push(path.join(backendRoot, 'node_modules'));

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { config } = require(path.join(backendRoot, 'src/config/env'));
if (!config.jwtSecret) {
  config.jwtSecret = 'test-secret-key-at-least-32-characters-long!';
}
if (!config.jwtExpiresIn) {
  config.jwtExpiresIn = '1h';
}

const auditService = require(path.join(backendRoot, 'src/services/auditService'));
const auditLogRepository = require(path.join(backendRoot, 'src/repositories/auditLog.repository'));
const userRepository = require(path.join(backendRoot, 'src/repositories/user.repository'));
const customerRepository = require(path.join(backendRoot, 'src/repositories/customer.repository'));
const ApiError = require(path.join(backendRoot, 'src/utils/ApiError'));
const { ROLES } = require(path.join(backendRoot, 'src/constants/roles'));

// Mock audit log & database transaction by default
auditService.recordAudit = async () => ({});
auditLogRepository.create = async () => ({});
mongoose.connection.transaction = async (work) => work({});

// Import target unit: authService
const authService = require(path.join(backendRoot, 'src/services/authService'));

// Helper to create mock User document
function createMockUser(overrides = {}) {
  const doc = {
    _id: '507f1f77bcf86cd799439011',
    username: 'admin01',
    role: ROLES.ADMIN,
    displayName: 'Quản trị viên A',
    tokenVersion: 1,
    isActive: true,
    lastLoginAt: null,
    employee: {
      fullName: 'Nguyễn Quản Trị'
    },
    async comparePassword(candidatePassword) {
      return candidatePassword === 'AdminPass@123';
    },
    ...overrides
  };
  return doc;
}

// -------------------------------------------------------------
// 1. login(body, context)
// -------------------------------------------------------------

test('UT_AUTH_01: login - Đăng nhập thành công với tài khoản và mật khẩu chính xác', async () => {
  const mockUser = createMockUser();
  userRepository.findForLogin = async (username) => {
    assert.equal(username, 'admin01');
    return mockUser;
  };
  userRepository.save = async (user) => user;

  const result = await authService.login(
    { username: 'admin01', password: 'AdminPass@123' },
    { ipAddress: '127.0.0.1' }
  );

  assert.ok(result.token);
  assert.equal(result.data.user.username, 'admin01');
  assert.equal(result.data.user.role, ROLES.ADMIN);
  assert.ok(mockUser.lastLoginAt instanceof Date);
});

test('UT_AUTH_02: login - Đăng nhập thất bại khi để trống tên đăng nhập hoặc mật khẩu', async () => {
  await assert.rejects(
    async () => {
      await authService.login({ username: '', password: '' }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Vui lòng nhập tên đăng nhập và mật khẩu/);
      return true;
    }
  );
});

test('UT_AUTH_03: login - Đăng nhập thất bại khi tên đăng nhập không tồn tại', async () => {
  userRepository.findForLogin = async () => null;

  await assert.rejects(
    async () => {
      await authService.login({ username: 'unknown_user', password: 'Pass@123' }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 401);
      assert.match(err.message, /Tên đăng nhập hoặc mật khẩu không chính xác/);
      return true;
    }
  );
});

test('UT_AUTH_04: login - Đăng nhập thất bại khi mật khẩu không đúng', async () => {
  const mockUser = createMockUser();
  userRepository.findForLogin = async () => mockUser;

  await assert.rejects(
    async () => {
      await authService.login({ username: 'admin01', password: 'WrongPassword' }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 401);
      assert.match(err.message, /Tên đăng nhập hoặc mật khẩu không chính xác/);
      return true;
    }
  );
});

test('UT_AUTH_05: login - Đăng nhập thất bại khi tài khoản đang bị khóa', async () => {
  const lockedUser = createMockUser({ isActive: false });
  userRepository.findForLogin = async () => lockedUser;

  await assert.rejects(
    async () => {
      await authService.login({ username: 'admin01', password: 'AdminPass@123' }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 403);
      assert.match(err.message, /Tài khoản đã bị khóa/);
      return true;
    }
  );
});

test('UT_AUTH_06: login - Đăng nhập thất bại khi tài khoản chưa được cấp vai trò', async () => {
  const noRoleUser = createMockUser({ role: null });
  userRepository.findForLogin = async () => noRoleUser;

  await assert.rejects(
    async () => {
      await authService.login({ username: 'admin01', password: 'AdminPass@123' }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 403);
      assert.match(err.message, /Tài khoản chưa được cấp quyền đăng nhập/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 2. authenticateToken(token)
// -------------------------------------------------------------

test('UT_AUTH_07: authenticateToken - Xác thực token hợp lệ thành công', async () => {
  const mockUser = createMockUser({ tokenVersion: 1 });
  const token = jwt.sign({
    sub: mockUser._id,
    role: mockUser.role,
    version: 1
  }, config.jwtSecret, {
    issuer: 'jollibee-admin-api',
    audience: 'jollibee-admin',
    expiresIn: '1h'
  });

  userRepository.findForAuthentication = async (id) => {
    assert.equal(id, mockUser._id);
    return mockUser;
  };

  const authenticatedUser = await authService.authenticateToken(token);
  assert.equal(authenticatedUser._id, mockUser._id);
});

test('UT_AUTH_08: authenticateToken - Xác thực thất bại khi token không hợp lệ hoặc hết hạn', async () => {
  await assert.rejects(
    async () => {
      await authService.authenticateToken('invalid-jwt-token-string');
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 401);
      assert.match(err.message, /Phiên đăng nhập không hợp lệ hoặc đã hết hạn/);
      return true;
    }
  );
});

test('UT_AUTH_09: authenticateToken - Xác thực thất bại khi tài khoản không tồn tại hoặc đã bị khóa', async () => {
  const token = jwt.sign({
    sub: '507f1f77bcf86cd799439011',
    role: ROLES.ADMIN,
    version: 1
  }, config.jwtSecret, {
    issuer: 'jollibee-admin-api',
    audience: 'jollibee-admin',
    expiresIn: '1h'
  });

  userRepository.findForAuthentication = async () => null;

  await assert.rejects(
    async () => {
      await authService.authenticateToken(token);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 401);
      assert.match(err.message, /Tài khoản không tồn tại hoặc đã bị khóa/);
      return true;
    }
  );
});

test('UT_AUTH_10: authenticateToken - Xác thực thất bại khi tài khoản chưa được cấp vai trò', async () => {
  const mockUser = createMockUser({ role: null, tokenVersion: 1 });
  const token = jwt.sign({
    sub: mockUser._id,
    role: 'unknown',
    version: 1
  }, config.jwtSecret, {
    issuer: 'jollibee-admin-api',
    audience: 'jollibee-admin',
    expiresIn: '1h'
  });

  userRepository.findForAuthentication = async () => mockUser;

  await assert.rejects(
    async () => {
      await authService.authenticateToken(token);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 401);
      assert.match(err.message, /Tài khoản chưa được cấp quyền đăng nhập/);
      return true;
    }
  );
});

test('UT_AUTH_11: authenticateToken - Xác thực thất bại khi phiên đăng nhập đã bị thu hồi (tokenVersion lệch)', async () => {
  const mockUser = createMockUser({ tokenVersion: 2 });
  const oldToken = jwt.sign({
    sub: mockUser._id,
    role: mockUser.role,
    version: 1 // Old version
  }, config.jwtSecret, {
    issuer: 'jollibee-admin-api',
    audience: 'jollibee-admin',
    expiresIn: '1h'
  });

  userRepository.findForAuthentication = async () => mockUser;

  await assert.rejects(
    async () => {
      await authService.authenticateToken(oldToken);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 401);
      assert.match(err.message, /Phiên đăng nhập đã bị thu hồi/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 3. resolveLogoutUser(token)
// -------------------------------------------------------------

test('UT_AUTH_12: resolveLogoutUser - Nhận diện người dùng đăng xuất thành công ngay cả khi token đã hết hạn', async () => {
  const mockUser = createMockUser();
  const expiredToken = jwt.sign({
    sub: mockUser._id,
    role: mockUser.role,
    version: 1
  }, config.jwtSecret, {
    issuer: 'jollibee-admin-api',
    audience: 'jollibee-admin',
    expiresIn: '0s' // Expired immediately
  });

  userRepository.findForLogout = async (id) => {
    assert.equal(id, mockUser._id);
    return mockUser;
  };

  const user = await authService.resolveLogoutUser(expiredToken);
  assert.ok(user);
  assert.equal(user._id, mockUser._id);
});

test('UT_AUTH_13: resolveLogoutUser - Trả về null khi token không thể giải mã hoặc tài khoản bị khóa', async () => {
  const result = await authService.resolveLogoutUser('invalid-token');
  assert.equal(result, null);
});

// -------------------------------------------------------------
// 4. me(userId)
// -------------------------------------------------------------

test('UT_AUTH_14: me - Lấy thông tin cá nhân của người dùng hiện tại thành công', async () => {
  const mockUser = createMockUser();
  userRepository.findCurrentUser = async (id) => {
    assert.equal(id, mockUser._id);
    return mockUser;
  };

  const result = await authService.me(mockUser._id);
  assert.equal(result.user.username, 'admin01');
  assert.equal(result.user.displayName, 'Nguyễn Quản Trị');
  assert.equal(result.user.role, ROLES.ADMIN);
  assert.equal(result.redirectTo, '/admin/');
});

test('UT_AUTH_15: me - Lấy thông tin cá nhân thất bại khi người dùng không tồn tại hoặc không có vai trò', async () => {
  userRepository.findCurrentUser = async () => null;

  await assert.rejects(
    async () => {
      await authService.me('507f1f77bcf86cd799439099');
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 401);
      assert.match(err.message, /Tài khoản không tồn tại hoặc chưa được cấp quyền đăng nhập/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 5. logout(userId, context)
// -------------------------------------------------------------

test('UT_AUTH_16: logout - Đăng xuất thành công, ghi nhật ký kiểm toán và tăng tokenVersion', async () => {
  let updatedFilter = null;
  let updatedQuery = null;

  userRepository.updateOne = async (filter, query) => {
    updatedFilter = filter;
    updatedQuery = query;
    return { modifiedCount: 1 };
  };

  await authService.logout('507f1f77bcf86cd799439011', { ipAddress: '127.0.0.1' });
  assert.equal(updatedFilter._id, '507f1f77bcf86cd799439011');
  assert.equal(updatedQuery.$inc.tokenVersion, 1);
});

test('UT_AUTH_17: logout - Xử lý an toàn khi không truyền userId', async () => {
  let called = false;
  userRepository.updateOne = async () => {
    called = true;
  };

  await authService.logout(null, {});
  assert.equal(called, false);
});

// -------------------------------------------------------------
// 6. register(body)
// -------------------------------------------------------------

test('UT_AUTH_18: register - Đăng ký tài khoản khách hàng thành công', async () => {
  const registerPayload = {
    username: 'customer01',
    password: 'Password@123',
    displayName: 'Nguyễn Khách Hàng',
    phone: '0987654321',
    email: 'customer01@example.com'
  };

  userRepository.findByUsername = async () => null;
  userRepository.hashPassword = async (p) => `hashed_${p}`;
  userRepository.createDocument = (data) => data;
  customerRepository.createDocument = (data) => data;
  userRepository.save = async (u) => u;
  customerRepository.save = async (c) => c;

  const result = await authService.register(registerPayload);
  assert.equal(result.statusCode, 201);
  assert.equal(result.message, 'Đăng ký tài khoản thành công!');
  assert.equal(result.data.username, 'customer01');
  assert.equal(result.data.displayName, 'Nguyễn Khách Hàng');
});

test('UT_AUTH_19: register - Đăng ký thất bại khi tên đăng nhập đã được sử dụng', async () => {
  const registerPayload = {
    username: 'existing_customer',
    password: 'Password@123',
    displayName: 'Nguyễn Khách Hàng'
  };

  userRepository.findByUsername = async () => ({ _id: '507f1f77bcf86cd799439011' });

  await assert.rejects(
    async () => {
      await authService.register(registerPayload);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /Tên đăng nhập đã tồn tại/);
      return true;
    }
  );
});
