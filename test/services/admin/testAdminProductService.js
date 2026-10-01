const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Resolve path to backend modules
const candidate1 = path.resolve(__dirname, '../../../backend');
const candidate2 = path.resolve(__dirname, '../../..');
const backendRoot = fs.existsSync(path.join(candidate1, 'src')) ? candidate1 : candidate2;

const productRepository = require(path.join(backendRoot, 'src/repositories/product.repository'));
const categoryRepository = require(path.join(backendRoot, 'src/repositories/category.repository'));
const ingredientRepository = require(path.join(backendRoot, 'src/repositories/ingredient.repository'));
const recipeRepository = require(path.join(backendRoot, 'src/repositories/recipe.repository'));
const databaseRepository = require(path.join(backendRoot, 'src/repositories/database.repository'));
const auditLogRepository = require(path.join(backendRoot, 'src/repositories/auditLog.repository'));
const ApiError = require(path.join(backendRoot, 'src/utils/ApiError'));

// Mock defaults
auditLogRepository.create = async () => ({});
databaseRepository.isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
databaseRepository.transaction = async (work) => work({});

// Import target unit: adminProductService
const adminProductService = require(path.join(backendRoot, 'src/services/adminProductService'));

function createMockProduct(overrides = {}) {
  const doc = {
    _id: '507f1f77bcf86cd799439001',
    productCode: 'MON0001',
    name: 'Gà Giòn Cay',
    price: 45000,
    category: {
      _id: '507f1f77bcf86cd799439002',
      code: 'GA_GION',
      name: 'Gà Giòn Vui Vẻ',
      isActive: true
    },
    categoryCode: 'GA_GION',
    isActive: true,
    toObject() {
      return {
        _id: this._id,
        productCode: this.productCode,
        name: this.name,
        price: this.price,
        category: this.category,
        categoryCode: this.categoryCode,
        isActive: this.isActive
      };
    },
    set(fields) {
      Object.assign(this, fields);
    },
    ...overrides
  };
  return doc;
}

function createMockRecipe(overrides = {}) {
  const doc = {
    _id: '507f1f77bcf86cd799439003',
    recipeCode: 'CT_MON0001',
    productCode: 'MON0001',
    name: 'Gà Giòn Cay',
    yieldQuantity: 1,
    isActive: true,
    version: 1,
    ingredients: [
      {
        ingredient: {
          _id: '507f1f77bcf86cd799439004',
          name: 'Đùi gà',
          baseUnit: 'g'
        },
        ingredientCode: 'NL001',
        quantity: 200,
        unit: 'g',
        quantityBase: 200
      }
    ],
    toObject() {
      return {
        _id: this._id,
        recipeCode: this.recipeCode,
        productCode: this.productCode,
        name: this.name,
        yieldQuantity: this.yieldQuantity,
        isActive: this.isActive,
        version: this.version,
        ingredients: this.ingredients
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
// 1. listProducts(query)
// -------------------------------------------------------------

test('UT_PRD_01: listProducts(query) - Lấy danh sách sản phẩm thành công với phân trang', async () => {
  productRepository.findMany = async (filter, { skip, limit }) => {
    assert.equal(skip, 0);
    assert.equal(limit, 10);
    return [createMockProduct()];
  };
  productRepository.count = async () => 1;

  const result = await adminProductService.listProducts({ page: '1' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].productCode, 'MON0001');
  assert.equal(result.pagination.total, 1);
});

test('UT_PRD_02: listProducts(query) - Lọc danh sách sản phẩm ngừng bán (status = "inactive")', async () => {
  productRepository.findMany = async (filter) => {
    assert.equal(filter.isActive, false);
    return [createMockProduct({ isActive: false })];
  };
  productRepository.count = async () => 1;

  const result = await adminProductService.listProducts({ status: 'inactive' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].isActive, false);
});

test('UT_PRD_03: listProducts(query) - Ném lỗi khi bộ lọc trạng thái sản phẩm không hợp lệ', async () => {
  await assert.rejects(
    async () => {
      await adminProductService.listProducts({ status: 'invalid_status' });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Bộ lọc trạng thái sản phẩm không hợp lệ/);
      return true;
    }
  );
});

test('UT_PRD_04: listProducts(query) - Ném lỗi khi bộ lọc danh mục không đúng định dạng ObjectId', async () => {
  await assert.rejects(
    async () => {
      await adminProductService.listProducts({ category: 'invalid-id' });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Bộ lọc danh mục không hợp lệ/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 2. getOptions()
// -------------------------------------------------------------

test('UT_PRD_05: getOptions() - Trả về danh mục và nguyên liệu hoạt động để chọn', async () => {
  categoryRepository.findActive = async () => [{ _id: '507f1f77bcf86cd799439002', name: 'Gà' }];
  ingredientRepository.findActiveForProductManagement = async () => [{ _id: '507f1f77bcf86cd799439004', name: 'Đùi gà' }];

  const result = await adminProductService.getOptions();
  assert.equal(result.categories.length, 1);
  assert.equal(result.ingredients.length, 1);
});

// -------------------------------------------------------------
// 3. getProduct(id)
// -------------------------------------------------------------

test('UT_PRD_06: getProduct(id) - Lấy chi tiết sản phẩm và công thức tương ứng', async () => {
  const productId = '507f1f77bcf86cd799439001';
  productRepository.findByIdWithCategory = async (id) => {
    assert.equal(id, productId);
    return createMockProduct({ _id: productId });
  };
  recipeRepository.findByProductCodeWithIngredients = async (code) => {
    assert.equal(code, 'MON0001');
    return createMockRecipe();
  };

  const result = await adminProductService.getProduct(productId);
  assert.equal(result._id, productId);
  assert.ok(result.recipe);
  assert.equal(result.recipe.recipeCode, 'CT_MON0001');
  assert.equal(result.recipe.ingredients[0].ingredientName, 'Đùi gà');
});

test('UT_PRD_07: getProduct(id) - Lấy chi tiết thất bại khi ID không đúng ObjectId', async () => {
  await assert.rejects(
    async () => {
      await adminProductService.getProduct('invalid-id');
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Mã sản phẩm không hợp lệ/);
      return true;
    }
  );
});

test('UT_PRD_08: getProduct(id) - Lấy chi tiết thất bại khi sản phẩm không tồn tại (404)', async () => {
  productRepository.findByIdWithCategory = async () => null;

  await assert.rejects(
    async () => {
      await adminProductService.getProduct('507f1f77bcf86cd799439099');
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /Không tìm thấy sản phẩm/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 4. createProduct(body, context)
// -------------------------------------------------------------

test('UT_PRD_09: createProduct(body, context) - Tạo món ăn và công thức nguyên liệu thành công', async () => {
  const categoryId = '507f1f77bcf86cd799439002';
  const ingredientId = '507f1f77bcf86cd799439004';
  const body = {
    name: 'Gà Sốt Phô Mai Cay',
    price: 49000,
    categoryId,
    ingredients: [
      { ingredientId, quantity: 150, unit: 'g' }
    ]
  };
  const context = { actor: { id: '507f1f77bcf86cd799439000' } };

  categoryRepository.findActiveById = async () => ({
    _id: categoryId,
    code: 'GA',
    name: 'Món Gà'
  });

  ingredientRepository.findActiveByIds = async () => [
    {
      _id: ingredientId,
      code: 'NL001',
      name: 'Thịt gà',
      baseUnit: 'g',
      packaging: []
    }
  ];

  const createdProduct = createMockProduct({
    _id: '507f1f77bcf86cd799439055',
    productCode: 'MON0055',
    name: 'Gà Sốt Phô Mai Cay',
    price: 49000
  });

  productRepository.create = async (payload) => {
    assert.equal(payload.name, 'Gà Sốt Phô Mai Cay');
    assert.equal(payload.price, 49000);
    return createdProduct;
  };

  recipeRepository.create = async (payload) => {
    assert.equal(payload.recipeCode, 'CT_MON0055');
    assert.equal(payload.ingredients[0].quantityBase, 150);
    return createMockRecipe({ recipeCode: payload.recipeCode });
  };

  let auditRecorded = false;
  auditLogRepository.create = async (entry) => {
    if (entry.action === 'product.create') auditRecorded = true;
  };

  productRepository.findByIdWithCategory = async () => createdProduct;
  recipeRepository.findByProductCodeWithIngredients = async () => createMockRecipe();

  const result = await adminProductService.createProduct(body, context);
  assert.equal(result.name, 'Gà Sốt Phô Mai Cay');
  assert.ok(auditRecorded);
});

test('UT_PRD_10: createProduct(body, context) - Tạo thất bại khi danh mục không tồn tại hoặc đã ngừng', async () => {
  const body = {
    name: 'Món Mới',
    price: 35000,
    categoryId: '507f1f77bcf86cd799439002',
    ingredients: [{ ingredientId: '507f1f77bcf86cd799439004', quantity: 100, unit: 'g' }]
  };
  categoryRepository.findActiveById = async () => null;

  await assert.rejects(
    async () => {
      await adminProductService.createProduct(body, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Danh mục đã chọn không tồn tại hoặc đã ngừng hoạt động/);
      return true;
    }
  );
});

test('UT_PRD_11: createProduct(body, context) - Tạo thất bại khi nguyên liệu không tồn tại hoặc đã ngừng', async () => {
  const body = {
    name: 'Món Mới',
    price: 35000,
    categoryId: '507f1f77bcf86cd799439002',
    ingredients: [{ ingredientId: '507f1f77bcf86cd799439004', quantity: 100, unit: 'g' }]
  };
  categoryRepository.findActiveById = async () => ({ _id: body.categoryId, code: 'GA' });
  ingredientRepository.findActiveByIds = async () => []; // Empty list -> missing

  await assert.rejects(
    async () => {
      await adminProductService.createProduct(body, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Một hoặc nhiều nguyên liệu không tồn tại hoặc đã ngừng hoạt động/);
      return true;
    }
  );
});

test('UT_PRD_12: createProduct(body, context) - Tạo thất bại khi đơn vị nguyên liệu không hợp lệ', async () => {
  const body = {
    name: 'Món Mới',
    price: 35000,
    categoryId: '507f1f77bcf86cd799439002',
    ingredients: [{ ingredientId: '507f1f77bcf86cd799439004', quantity: 100, unit: 'lit' }] // baseUnit is 'g'
  };
  categoryRepository.findActiveById = async () => ({ _id: body.categoryId, code: 'GA' });
  ingredientRepository.findActiveByIds = async () => [
    { _id: '507f1f77bcf86cd799439004', name: 'Đùi gà', baseUnit: 'g', packaging: [] }
  ];

  await assert.rejects(
    async () => {
      await adminProductService.createProduct(body, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Đơn vị lit không hợp lệ/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 5. updateProduct(id, body, context)
// -------------------------------------------------------------

test('UT_PRD_13: updateProduct(id, body, context) - Cập nhật sản phẩm và công thức thành công', async () => {
  const productId = '507f1f77bcf86cd799439001';
  const categoryId = '507f1f77bcf86cd799439002';
  const ingredientId = '507f1f77bcf86cd799439004';
  const body = {
    name: 'Gà Giòn Cay Cỡ Lớn',
    price: 55000,
    categoryId,
    isActive: true,
    ingredients: [{ ingredientId, quantity: 250, unit: 'g' }]
  };

  const existingProd = createMockProduct({ _id: productId });
  const existingRec = createMockRecipe({ version: 1 });

  productRepository.findById = async () => existingProd;
  categoryRepository.findActiveById = async () => ({ _id: categoryId, code: 'GA' });
  ingredientRepository.findActiveByIds = async () => [
    { _id: ingredientId, name: 'Đùi gà', code: 'NL001', baseUnit: 'g', packaging: [] }
  ];
  recipeRepository.findByProductCode = async () => existingRec;
  productRepository.save = async (p) => p;
  recipeRepository.save = async (r) => r;

  productRepository.findByIdWithCategory = async () => existingProd;
  recipeRepository.findByProductCodeWithIngredients = async () => existingRec;

  const result = await adminProductService.updateProduct(productId, body, {});
  assert.equal(existingProd.name, 'Gà Giòn Cay Cỡ Lớn');
  assert.equal(existingProd.price, 55000);
  assert.equal(existingRec.version, 2);
});

test('UT_PRD_14: updateProduct(id, body, context) - Cập nhật thất bại khi sản phẩm không tồn tại (404)', async () => {
  productRepository.findById = async () => null;

  await assert.rejects(
    async () => {
      await adminProductService.updateProduct('507f1f77bcf86cd799439099', {
        name: 'Món Sửa',
        price: 40000,
        categoryId: '507f1f77bcf86cd799439002',
        isActive: true,
        ingredients: [{ ingredientId: '507f1f77bcf86cd799439004', quantity: 100, unit: 'g' }]
      }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /Không tìm thấy sản phẩm/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 6. deactivateProduct(id, context)
// -------------------------------------------------------------

test('UT_PRD_15: deactivateProduct(id, context) - Ngừng hoạt động món ăn và công thức liên quan', async () => {
  const productId = '507f1f77bcf86cd799439001';
  const existingProd = createMockProduct({ _id: productId, isActive: true });
  const existingRec = createMockRecipe({ isActive: true });

  productRepository.findById = async () => existingProd;
  recipeRepository.findByProductCode = async () => existingRec;
  productRepository.save = async (p) => p;
  recipeRepository.save = async (r) => r;

  let auditAction = null;
  auditLogRepository.create = async (entry) => {
    auditAction = entry.action;
  };

  await adminProductService.deactivateProduct(productId, {});
  assert.equal(existingProd.isActive, false);
  assert.equal(existingRec.isActive, false);
  assert.equal(auditAction, 'product.deactivate');
});

test('UT_PRD_16: deactivateProduct(id, context) - Ngừng hoạt động thất bại khi không tìm thấy món', async () => {
  productRepository.findById = async () => null;

  await assert.rejects(
    async () => {
      await adminProductService.deactivateProduct('507f1f77bcf86cd799439099', {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /Không tìm thấy sản phẩm/);
      return true;
    }
  );
});
