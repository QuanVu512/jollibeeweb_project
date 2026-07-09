const Ingredient = require('../models/Ingredient');
const InventoryTransaction = require('../models/InventoryTransaction');
const Recipe = require('../models/Recipe');
const ApiError = require('../utils/ApiError');

function getIngredientId(recipeIngredient) {
  const ingredient = recipeIngredient.ingredient;
  if (!ingredient) return '';
  if (ingredient._id) return ingredient._id.toString();
  return ingredient.toString();
}

function getIngredientName(recipeIngredient) {
  return recipeIngredient.ingredient?.name || recipeIngredient.ingredientCode || 'Nguyên liệu';
}

function getIngredientUnit(recipeIngredient) {
  return recipeIngredient.ingredient?.baseUnit || '';
}

function normalizedProductCode(value) {
  return String(value || '').trim().toUpperCase();
}

function roundQuantity(value) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function calculateRecipeDeductions(order, recipesByProductCode) {
  const deductionsByIngredient = new Map();
  const missingRecipes = [];

  for (const item of order.items || []) {
    const productCode = normalizedProductCode(item.productCode);
    const orderQuantity = Number(item.quantity) || 0;
    if (!productCode || orderQuantity <= 0) continue;

    const recipe = recipesByProductCode.get(productCode);
    if (!recipe) {
      missingRecipes.push({
        productCode,
        name: item.name || productCode
      });
      continue;
    }

    const yieldQuantity = Number(recipe.yieldQuantity) > 0 ? Number(recipe.yieldQuantity) : 1;
    for (const recipeIngredient of recipe.ingredients || []) {
      const ingredientId = getIngredientId(recipeIngredient);
      const quantityBase = Number(recipeIngredient.quantityBase);
      if (!ingredientId || !Number.isFinite(quantityBase) || quantityBase <= 0) continue;

      const quantity = roundQuantity((quantityBase * orderQuantity) / yieldQuantity);
      
      const existing = deductionsByIngredient.get(ingredientId) || {
        ingredient: recipeIngredient.ingredient?._id || recipeIngredient.ingredient,
        ingredientCode: recipeIngredient.ingredientCode,
        ingredientName: getIngredientName(recipeIngredient),
        baseUnit: getIngredientUnit(recipeIngredient),
        quantity: 0,
        dishNames: [] 
      };

      existing.quantity = roundQuantity(existing.quantity + quantity);
      
      if (!existing.dishNames.includes(item.name)) {
        existing.dishNames.push(item.name || productCode);
      }
      
      deductionsByIngredient.set(ingredientId, existing);
    }
  }

  return {
    deductions: Array.from(deductionsByIngredient.values()).filter(item => item.quantity > 0),
    missingRecipes
  };
}

async function loadRecipesForOrder(order, session) {
  const productCodes = [
    ...new Set((order.items || []).map(item => normalizedProductCode(item.productCode)).filter(Boolean))
  ];

  if (productCodes.length === 0) return new Map();

  let query = Recipe.find({
    productCode: { $in: productCodes },
    isActive: true,
    $or: [
      { orderTypes: order.orderType || 'dine_in' },
      { orderTypes: { $size: 0 } }
    ]
  })
    .populate('ingredients.ingredient')
    .sort({ productCode: 1, version: -1, updatedAt: -1 });

  if (session) query = query.session(session);

  const recipes = await query;
  const recipesByProductCode = new Map();
  for (const recipe of recipes) {
    const productCode = normalizedProductCode(recipe.productCode);
    if (!recipesByProductCode.has(productCode)) {
      recipesByProductCode.set(productCode, recipe);
    }
  }

  return recipesByProductCode;
}

function formatQuantity(value, unit) {
  const formatted = new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 6
  }).format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

async function deductIngredientsForOrder(order, userId, options = {}) {
  if (order.inventoryDeductedAt) {
    return { deducted: [], missingRecipes: [], alreadyDeducted: true };
  }

  const session = options.session || null;
  const recipesByProductCode = await loadRecipesForOrder(order, session);
  const plan = calculateRecipeDeductions(order, recipesByProductCode);
  const deducted = [];

  for (const deduction of plan.deductions) {
    const updatedIngredient = await Ingredient.findOneAndUpdate(
      {
        _id: deduction.ingredient,
        isActive: true,
        stockQuantity: { $gte: deduction.quantity }
      },
      { $inc: { stockQuantity: -deduction.quantity } },
      { new: true, runValidators: true, session }
    );

    if (!updatedIngredient) {
      const currentIngredient = await Ingredient.findById(deduction.ingredient).session(session);
      if (!currentIngredient || !currentIngredient.isActive) {
        throw new ApiError(400, `Nguyên liệu ${deduction.ingredientName} không còn hoạt động trong kho.`);
      }

      const dishes = deduction.dishNames ? deduction.dishNames.join(' và ') : 'món ăn này';
      const stockLeft = formatQuantity(currentIngredient.stockQuantity, currentIngredient.baseUnit);

      throw new ApiError(
        400,
        `Xin lỗi! Trong kho hiện chỉ còn ${stockLeft} ${currentIngredient.name} (đây là nguyên liệu tạo ra món ${dishes}). Bạn vui lòng chọn món khác nhé!`
      );
    }

    const stockBefore = roundQuantity(updatedIngredient.stockQuantity + deduction.quantity);
    const stockAfter = roundQuantity(updatedIngredient.stockQuantity);

    await InventoryTransaction.create([
      {
        ingredient: updatedIngredient._id,
        type: 'sale',
        quantityChange: -deduction.quantity,
        stockBefore,
        stockAfter,
        referenceCode: order.orderCode,
        order: order._id,
        createdBy: userId,
        note: `Trừ nguyên liệu theo công thức cho đơn ${order.orderCode}`
      }
    ], { session });

    deducted.push({
      ingredient: updatedIngredient._id,
      ingredientCode: deduction.ingredientCode,
      ingredientName: updatedIngredient.name,
      baseUnit: updatedIngredient.baseUnit,
      quantity: deduction.quantity,
      stockBefore,
      stockAfter
    });
  }

  return {
    deducted,
    missingRecipes: plan.missingRecipes,
    alreadyDeducted: false
  };
}

module.exports = {
  calculateRecipeDeductions,
  deductIngredientsForOrder
};
