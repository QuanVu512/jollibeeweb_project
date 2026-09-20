const productRepository = require('../repositories/product.repository');
const categoryRepository = require('../repositories/category.repository');
const ingredientRepository = require('../repositories/ingredient.repository');
const recipeRepository = require('../repositories/recipe.repository');
const databaseRepository = require('../repositories/database.repository');
const { validateProductPayload } = require('../validators/productValidators');
const { pagination, paginationResult } = require('../utils/adminQuery');
const { recordAudit } = require('./auditService');
const ApiError = require('../utils/ApiError');

function roundQuantity(value) {
  return Math.round((value + Number.EPSILON) * 1e12) / 1e12;
}

function serializeRecipe(recipe) {
  if (!recipe) return null;
  const data = typeof recipe.toObject === 'function' ? recipe.toObject() : recipe;
  return {
    ...data,
    ingredients: (data.ingredients || []).map((item) => ({
      ingredientId: item.ingredient?._id || item.ingredient,
      ingredientCode: item.ingredientCode,
      ingredientName: item.ingredient?.name || item.ingredientCode,
      quantity: item.quantity ?? item.quantityBase,
      unit: item.unit || item.ingredient?.baseUnit || '',
      quantityBase: item.quantityBase
    }))
  };
}

async function listProducts(query) {
  const { page, limit, skip } = pagination(query, { defaultLimit: 10, maxLimit: 10 });
  const filter = {};

  if (query.status === 'active') filter.isActive = true;
  else if (query.status === 'inactive') filter.isActive = false;
  else if (query.status && query.status !== 'all') {
    throw new ApiError(400, 'Bộ lọc trạng thái sản phẩm không hợp lệ.');
  }

  if (query.category && query.category !== 'all') {
    if (!databaseRepository.isValidObjectId(query.category)) {
      throw new ApiError(400, 'Bộ lọc danh mục không hợp lệ.');
    }
    filter.category = query.category;
  }

  const [items, total] = await Promise.all([
    productRepository.findMany(filter, { skip, limit }),
    productRepository.count(filter)
  ]);

  return { items, pagination: paginationResult(page, limit, total) };
}

async function getOptions() {
  const [categories, ingredients] = await Promise.all([
    categoryRepository.findActive(),
    ingredientRepository.findActiveForProductManagement()
  ]);
  return { categories, ingredients };
}

async function getProduct(id) {
  if (!databaseRepository.isValidObjectId(id)) {
    throw new ApiError(400, 'Mã sản phẩm không hợp lệ.');
  }
  const product = await productRepository.findByIdWithCategory(id);
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm.');
  const recipe = await recipeRepository.findByProductCodeWithIngredients(product.productCode);
  return { ...product.toObject(), recipe: serializeRecipe(recipe) };
}

async function loadCategory(categoryId, session) {
  const category = await categoryRepository.findActiveById(categoryId, session);
  if (!category) {
    const message = 'Danh mục đã chọn không tồn tại hoặc đã ngừng hoạt động.';
    throw new ApiError(400, message, { categoryId: message });
  }
  return category;
}

async function normalizeRecipeIngredients(lines, session) {
  const ids = [...new Set(lines.map((item) => item.ingredientId.toString()))];
  const ingredients = await ingredientRepository.findActiveByIds(ids, session);
  const ingredientById = new Map(ingredients.map((item) => [item._id.toString(), item]));

  if (ingredientById.size !== ids.length) {
    const message = 'Một hoặc nhiều nguyên liệu không tồn tại hoặc đã ngừng hoạt động.';
    throw new ApiError(400, message, { ingredients: message });
  }

  const combined = new Map();
  for (const line of lines) {
    const ingredient = ingredientById.get(line.ingredientId.toString());
    const unitFactors = new Map();
    for (const packaging of ingredient.packaging || []) {
      unitFactors.set(packaging.unit, Number(packaging.baseQuantity));
    }
    unitFactors.set(ingredient.baseUnit, 1);
    const factor = unitFactors.get(line.unit);
    if (!Number.isFinite(factor) || factor <= 0) {
      const message = `Đơn vị ${line.unit} không hợp lệ với nguyên liệu ${ingredient.name}.`;
      throw new ApiError(400, message, { ingredients: message });
    }

    const quantityBase = roundQuantity(line.quantity * factor);
    const key = ingredient._id.toString();
    const current = combined.get(key) || {
      ingredient: ingredient._id,
      ingredientCode: ingredient.code,
      quantity: 0,
      unit: line.unit,
      quantityBase: 0,
      displayFactor: factor
    };
    current.quantityBase = roundQuantity(current.quantityBase + quantityBase);
    current.quantity = roundQuantity(current.quantityBase / current.displayFactor);
    combined.set(key, current);
  }

  return [...combined.values()].map(({ displayFactor, ...item }) => item);
}

async function createProduct(body, context) {
  const payload = validateProductPayload(body);
  let product;

  await databaseRepository.transaction(async (session) => {
    const category = await loadCategory(payload.categoryId, session);
    const ingredients = await normalizeRecipeIngredients(payload.ingredients, session);

    product = await productRepository.create({
      name: payload.name,
      price: payload.price,
      category: category._id,
      categoryCode: category.code,
      isActive: true
    }, session);

    const recipe = await recipeRepository.create({
      recipeCode: `CT_${product.productCode}`,
      productCode: product.productCode,
      name: product.name,
      ingredients,
      yieldQuantity: 1,
      orderTypes: ['dine_in', 'pickup', 'delivery'],
      isActive: true
    }, session);

    await recordAudit(context, {
      action: 'product.create',
      entityType: 'product',
      entityId: product._id,
      before: null,
      after: { product: product.toObject(), recipe: recipe.toObject() }
    }, session);
  });

  return getProduct(product._id);
}

async function updateProduct(id, body, context) {
  if (!databaseRepository.isValidObjectId(id)) {
    throw new ApiError(400, 'Mã sản phẩm không hợp lệ.');
  }
  const payload = validateProductPayload(body, { allowStatus: true });

  await databaseRepository.transaction(async (session) => {
    const product = await productRepository.findById(id, session);
    if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm.');

    const category = await loadCategory(payload.categoryId, session);
    const ingredients = await normalizeRecipeIngredients(payload.ingredients, session);
    const existingRecipe = await recipeRepository.findByProductCode(product.productCode, session);
    const before = {
      product: product.toObject(),
      recipe: existingRecipe?.toObject() || null
    };

    product.set({
      name: payload.name,
      price: payload.price,
      category: category._id,
      categoryCode: category.code,
      isActive: payload.isActive
    });
    await productRepository.save(product, { session });

    let recipe = existingRecipe;
    if (recipe) {
      recipe.set({
        name: product.name,
        ingredients,
        isActive: product.isActive,
        version: Number(recipe.version || 1) + 1
      });
      await recipeRepository.save(recipe, { session });
    } else {
      recipe = await recipeRepository.create({
        recipeCode: `CT_${product.productCode}`,
        productCode: product.productCode,
        name: product.name,
        ingredients,
        yieldQuantity: 1,
        orderTypes: ['dine_in', 'pickup', 'delivery'],
        isActive: product.isActive
      }, session);
    }

    await recordAudit(context, {
      action: 'product.update',
      entityType: 'product',
      entityId: product._id,
      before,
      after: { product: product.toObject(), recipe: recipe.toObject() }
    }, session);
  });

  return getProduct(id);
}

async function deactivateProduct(id, context) {
  if (!databaseRepository.isValidObjectId(id)) {
    throw new ApiError(400, 'Mã sản phẩm không hợp lệ.');
  }

  await databaseRepository.transaction(async (session) => {
    const product = await productRepository.findById(id, session);
    if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm.');
    const recipe = await recipeRepository.findByProductCode(product.productCode, session);
    const before = {
      product: product.toObject(),
      recipe: recipe?.toObject() || null
    };

    product.isActive = false;
    await productRepository.save(product, { session });
    if (recipe) {
      recipe.isActive = false;
      await recipeRepository.save(recipe, { session });
    }

    await recordAudit(context, {
      action: 'product.deactivate',
      entityType: 'product',
      entityId: product._id,
      before,
      after: { product: product.toObject(), recipe: recipe?.toObject() || null }
    }, session);
  });
}

module.exports = {
  listProducts,
  getOptions,
  getProduct,
  createProduct,
  updateProduct,
  deactivateProduct
};
