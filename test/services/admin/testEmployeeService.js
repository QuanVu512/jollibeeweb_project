const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Resolve path to backend modules
const candidate1 = path.resolve(__dirname, '../../../backend');
const candidate2 = path.resolve(__dirname, '../../..');
const backendRoot = fs.existsSync(path.join(candidate1, 'src')) ? candidate1 : candidate2;

const auditService = require(path.join(backendRoot, 'src/services/auditService'));
const auditLogRepository = require(path.join(backendRoot, 'src/repositories/auditLog.repository'));
const databaseRepository = require(path.join(backendRoot, 'src/repositories/database.repository'));
const userRepository = require(path.join(backendRoot, 'src/repositories/user.repository'));
const employeeRepository = require(path.join(backendRoot, 'src/repositories/employee.repository'));
const ApiError = require(path.join(backendRoot, 'src/utils/ApiError'));

// Mock audit log repository & database transaction by default
auditLogRepository.create = async () => ({});
databaseRepository.isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
databaseRepository.transaction = async (work) => work({});

// Import target unit: employeeService
const employeeService = require(path.join(backendRoot, 'src/services/employeeService'));

function createMockEmployee(overrides = {}) {
  const doc = {
    _id: '507f1f77bcf86cd799439022',
    employeeCode: 'NV0001',
    fullName: 'Trần Văn Nam',
    phone: '0987654321',
    email: 'nam.tran@gmail.com',
    gender: 'Nam',
    hometown: 'Hà Nội',
    birthDate: new Date('1998-05-15'),
    hireDate: new Date('2023-01-01'),
    terminationDate: null,
    isActive: true,
    account: null,
    toObject() {
      return {
        _id: this._id,
        employeeCode: this.employeeCode,
        fullName: this.fullName,
        phone: this.phone,
        email: this.email,
        gender: this.gender,
        hometown: this.hometown,
        birthDate: this.birthDate,
        hireDate: this.hireDate,
        terminationDate: this.terminationDate,
        isActive: this.isActive,
        account: this.account
      };
    },
    set(fields) {
      Object.assign(this, fields);
    },
    ...overrides
  };
  return doc;
}

// -------------------------------------------------------------
// 1. listEmployees(query)
// -------------------------------------------------------------

test('UT_EMP_01: listEmployees(query) - Lấy danh sách nhân viên thành công với phân trang mặc định', async () => {
  const mockEmp = createMockEmployee();
  employeeRepository.findMany = async (filter, { skip, limit }) => {
    assert.equal(skip, 0);
    assert.equal(limit, 20);
    return [mockEmp];
  };
  employeeRepository.count = async () => 1;

  const result = await employeeService.listEmployees({ page: '1', limit: '20' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].employeeCode, 'NV0001');
  assert.equal(result.pagination.total, 1);
  assert.equal(result.pagination.totalPages, 1);
});

test('UT_EMP_02: listEmployees(query) - Lọc danh sách nhân viên theo trạng thái nghỉ việc (status = "inactive")', async () => {
  employeeRepository.findMany = async (filter) => {
    const jsonFilter = JSON.stringify(filter);
    assert.ok(jsonFilter.includes('"isActive":false'));
    return [createMockEmployee({ isActive: false })];
  };
  employeeRepository.count = async () => 1;

  const result = await employeeService.listEmployees({ status: 'inactive' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].isActive, false);
});

test('UT_EMP_03: listEmployees(query) - Lọc danh sách theo giới tính hợp lệ', async () => {
  employeeRepository.findMany = async (filter) => {
    const jsonFilter = JSON.stringify(filter);
    assert.ok(jsonFilter.includes('"gender":"Nữ"'));
    return [createMockEmployee({ gender: 'Nữ' })];
  };
  employeeRepository.count = async () => 1;

  const result = await employeeService.listEmployees({ gender: 'Nữ' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].gender, 'Nữ');
});

test('UT_EMP_04: listEmployees(query) - Ném lỗi khi bộ lọc giới tính không hợp lệ', async () => {
  await assert.rejects(
    async () => {
      await employeeService.listEmployees({ gender: 'Không-xác-định' });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Bộ lọc giới tính không hợp lệ/);
      return true;
    }
  );
});

test('UT_EMP_05: listEmployees(query) - Lọc nhân viên chưa có tài khoản (withoutAccount = "true")', async () => {
  employeeRepository.findMany = async (filter) => {
    const jsonFilter = JSON.stringify(filter);
    assert.ok(jsonFilter.includes('account'));
    return [createMockEmployee({ account: null })];
  };
  employeeRepository.count = async () => 1;

  const result = await employeeService.listEmployees({ withoutAccount: 'true' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].account, null);
});

// -------------------------------------------------------------
// 2. getEmployee(id)
// -------------------------------------------------------------

test('UT_EMP_06: getEmployee(id) - Lấy chi tiết nhân viên thành công với ID hợp lệ', async () => {
  const validId = '507f1f77bcf86cd799439022';
  employeeRepository.findByIdWithAccount = async (id) => {
    assert.equal(id, validId);
    return createMockEmployee({ _id: validId });
  };

  const result = await employeeService.getEmployee(validId);
  assert.equal(result._id, validId);
  assert.equal(result.fullName, 'Trần Văn Nam');
});

test('UT_EMP_07: getEmployee(id) - Lấy chi tiết thất bại khi ID không đúng định dạng ObjectId', async () => {
  await assert.rejects(
    async () => {
      await employeeService.getEmployee('123-invalid-id');
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Mã nhân viên không hợp lệ/);
      return true;
    }
  );
});

test('UT_EMP_08: getEmployee(id) - Lấy chi tiết thất bại khi nhân viên không tồn tại', async () => {
  const notFoundId = '507f1f77bcf86cd799439099';
  employeeRepository.findByIdWithAccount = async () => null;

  await assert.rejects(
    async () => {
      await employeeService.getEmployee(notFoundId);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /Không tìm thấy nhân viên/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 3. createEmployee(body, context)
// -------------------------------------------------------------

test('UT_EMP_09: createEmployee(body, context) - Tạo nhân viên thành công khi thông tin hợp lệ', async () => {
  const body = {
    fullName: 'Lê Thị Thu',
    phone: '0978111222',
    email: 'thu.le@gmail.com',
    gender: 'Nữ',
    hometown: 'Đà Nẵng',
    birthDate: '2000-08-20'
  };
  const context = { actor: { id: '507f1f77bcf86cd799439000' } };
  const mockCreated = createMockEmployee({
    fullName: 'Lê Thị Thu',
    phone: '0978111222',
    email: 'thu.le@gmail.com',
    gender: 'Nữ'
  });

  employeeRepository.existsByPhone = async () => false;
  employeeRepository.existsByEmail = async () => false;
  employeeRepository.create = async (payload) => {
    assert.equal(payload.fullName, 'Lê Thị Thu');
    assert.equal(payload.phone, '0978111222');
    return mockCreated;
  };

  let auditRecorded = false;
  auditLogRepository.create = async (entry) => {
    if (entry.action === 'employee.create') {
      auditRecorded = true;
    }
  };

  const result = await employeeService.createEmployee(body, context);
  assert.equal(result.fullName, 'Lê Thị Thu');
  assert.ok(auditRecorded);
});

test('UT_EMP_10: createEmployee(body, context) - Tạo nhân viên thất bại khi số điện thoại đã tồn tại', async () => {
  const body = {
    fullName: 'Lê Thị Thu',
    phone: '0978111222',
    email: 'thu.le@gmail.com',
    gender: 'Nữ',
    hometown: 'Đà Nẵng',
    birthDate: '2000-08-20'
  };
  employeeRepository.existsByPhone = async () => true;

  await assert.rejects(
    async () => {
      await employeeService.createEmployee(body, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /Số điện thoại này đã được sử dụng/);
      return true;
    }
  );
});

test('UT_EMP_11: createEmployee(body, context) - Tạo nhân viên thất bại khi email đã tồn tại', async () => {
  const body = {
    fullName: 'Lê Thị Thu',
    phone: '0978111222',
    email: 'thu.le@gmail.com',
    gender: 'Nữ',
    hometown: 'Đà Nẵng',
    birthDate: '2000-08-20'
  };
  employeeRepository.existsByPhone = async () => false;
  employeeRepository.existsByEmail = async () => true;

  await assert.rejects(
    async () => {
      await employeeService.createEmployee(body, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /Email này đã được sử dụng/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 4. updateEmployee(id, currentUserId, body, context)
// -------------------------------------------------------------

test('UT_EMP_12: updateEmployee(id, currentUserId, body, context) - Cập nhật thông tin nhân viên thành công', async () => {
  const id = '507f1f77bcf86cd799439022';
  const currentUserId = '507f1f77bcf86cd799439099';
  const existingEmp = createMockEmployee({ _id: id });

  employeeRepository.findById = async () => existingEmp;
  employeeRepository.existsByPhone = async () => false;
  employeeRepository.existsByEmail = async () => false;
  employeeRepository.save = async (emp) => emp;
  employeeRepository.populateAccount = async (emp) => emp;

  const result = await employeeService.updateEmployee(id, currentUserId, { hometown: 'Hải Phòng' }, {});
  assert.equal(result.hometown, 'Hải Phòng');
});

test('UT_EMP_13: updateEmployee(id, currentUserId, body, context) - Ném lỗi khi cập nhật với payload rỗng', async () => {
  const id = '507f1f77bcf86cd799439022';
  await assert.rejects(
    async () => {
      await employeeService.updateEmployee(id, '507f1f77bcf86cd799439099', {}, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Không có dữ liệu cần cập nhật/);
      return true;
    }
  );
});

test('UT_EMP_14: updateEmployee(id, currentUserId, body, context) - Quản trị viên tự cho nghỉ việc chính mình bị chặn', async () => {
  const id = '507f1f77bcf86cd799439022';
  const currentUserId = '507f1f77bcf86cd799439011';
  const myEmployee = createMockEmployee({ _id: id, account: currentUserId });

  employeeRepository.findById = async () => myEmployee;

  await assert.rejects(
    async () => {
      await employeeService.updateEmployee(id, currentUserId, { isActive: false }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Bạn không thể tự cho nghỉ việc hồ sơ của chính mình/);
      return true;
    }
  );
});

test('UT_EMP_15: updateEmployee(id, currentUserId, body, context) - Vô hiệu hóa tài khoản liên kết khi nhân viên nghỉ việc', async () => {
  const id = '507f1f77bcf86cd799439022';
  const currentUserId = '507f1f77bcf86cd799439099';
  const linkedAccountId = '507f1f77bcf86cd799439088';
  const emp = createMockEmployee({ _id: id, account: linkedAccountId });

  employeeRepository.findById = async () => emp;
  employeeRepository.existsByPhone = async () => false;
  employeeRepository.existsByEmail = async () => false;
  employeeRepository.save = async (e) => e;
  employeeRepository.populateAccount = async (e) => e;

  let userUpdated = false;
  userRepository.updateOne = async (filter, update) => {
    assert.equal(filter._id, linkedAccountId);
    assert.equal(update.$set.isActive, false);
    assert.equal(update.$inc.tokenVersion, 1);
    userUpdated = true;
  };

  await employeeService.updateEmployee(id, currentUserId, { isActive: false }, {});
  assert.ok(userUpdated);
});

// -------------------------------------------------------------
// 5. deleteEmployee(id, currentUserId, context)
// -------------------------------------------------------------

test('UT_EMP_16: deleteEmployee(id, currentUserId, context) - Xóa mềm nhân viên thành công và khóa tài khoản', async () => {
  const id = '507f1f77bcf86cd799439022';
  const currentUserId = '507f1f77bcf86cd799439099';
  const linkedAccountId = '507f1f77bcf86cd799439088';
  const emp = createMockEmployee({ _id: id, account: linkedAccountId, isActive: true });

  employeeRepository.findById = async () => emp;
  employeeRepository.save = async (e) => e;

  let userUpdated = false;
  userRepository.updateOne = async (filter, update) => {
    assert.equal(filter._id, linkedAccountId);
    assert.equal(update.$set.isActive, false);
    userUpdated = true;
  };

  await employeeService.deleteEmployee(id, currentUserId, {});
  assert.equal(emp.isActive, false);
  assert.ok(emp.terminationDate instanceof Date);
  assert.ok(userUpdated);
});

test('UT_EMP_17: deleteEmployee(id, currentUserId, context) - Tự xóa hồ sơ của chính mình bị chặn', async () => {
  const id = '507f1f77bcf86cd799439022';
  const currentUserId = '507f1f77bcf86cd799439011';
  const emp = createMockEmployee({ _id: id, account: currentUserId });

  employeeRepository.findById = async () => emp;

  await assert.rejects(
    async () => {
      await employeeService.deleteEmployee(id, currentUserId, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Bạn không thể tự cho nghỉ việc hồ sơ của chính mình/);
      return true;
    }
  );
});
