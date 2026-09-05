const ingredientRepository = require('../repositories/ingredient.repository');
const ApiError = require('../utils/ApiError');

function listIngredients() {
  return ingredientRepository.findAll();
}

async function createIngredient(body) {
  const { code, name, supplierName = '', baseUnit, stockQuantity = 0, isActive = true } = body || {};

  if (!code || !name || !baseUnit) {
    throw new ApiError(400, 'Vui lòng nhập mã, tên và đơn vị nguyên liệu.');
  }

  return ingredientRepository.create({
    code: String(code).trim().toUpperCase(),
    name: String(name).trim(),
    supplierName: String(supplierName || '').trim(),
    baseUnit: String(baseUnit).trim(),
    stockQuantity: Number.isFinite(Number(stockQuantity)) ? Number(stockQuantity) : 0,
    isActive: typeof isActive === 'boolean' ? isActive : true
  });
}

async function updateIngredient(id, body) {
  const { code, name, supplierName = '', baseUnit, stockQuantity = 0, isActive = true } = body || {};

  if (!code || !name || !baseUnit) {
    throw new ApiError(400, 'Vui lòng nhập mã, tên và đơn vị nguyên liệu.');
  }

  const ingredient = await ingredientRepository.findById(id);
  if (!ingredient) {
    throw new ApiError(404, 'Không tìm thấy nguyên liệu.');
  }

  ingredient.code = String(code).trim().toUpperCase();
  ingredient.name = String(name).trim();
  ingredient.supplierName = String(supplierName || '').trim();
  ingredient.baseUnit = String(baseUnit).trim();
  ingredient.stockQuantity = Number.isFinite(Number(stockQuantity)) ? Number(stockQuantity) : 0;
  ingredient.isActive = typeof isActive === 'boolean' ? isActive : true;
  await ingredientRepository.save(ingredient);

  return ingredient;
}

async function deleteIngredient(id) {
  const ingredient = await ingredientRepository.findById(id);
  if (!ingredient) {
    throw new ApiError(404, 'Không tìm thấy nguyên liệu.');
  }

  await ingredientRepository.remove(ingredient);
  return id;
}

async function adjustInventory(body) {
  const { ingredientId, change, note = '' } = body || {};
  const delta = Number(change);

  if (!ingredientId || !Number.isFinite(delta)) {
    throw new ApiError(400, 'Vui lòng chọn nguyên liệu và nhập số lượng thay đổi.');
  }

  const ingredient = await ingredientRepository.findById(ingredientId);
  if (!ingredient) {
    throw new ApiError(404, 'Không tìm thấy nguyên liệu.');
  }

  const nextStock = ingredient.stockQuantity + delta;
  if (nextStock < 0) {
    throw new ApiError(400, 'Số lượng tồn kho không thể âm.');
  }

  ingredient.stockQuantity = nextStock;
  await ingredientRepository.save(ingredient);

  return { ingredient, delta, note };
}

module.exports = {
  listIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  adjustInventory
};
