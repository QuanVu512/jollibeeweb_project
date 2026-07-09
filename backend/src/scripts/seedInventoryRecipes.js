const { validateEnvironment } = require('../config/env');
const { connectDatabase, disconnectDatabase } = require('../config/database');
const Ingredient = require('../models/Ingredient');
const PurchaseMaterial = require('../models/PurchaseMaterial');
const Recipe = require('../models/Recipe');
const { INGREDIENT_DEFINITIONS, ORDER_MATERIAL_DEFINITIONS, RECIPE_DEFINITIONS } = require('../data/inventoryRecipes');

async function seedInventoryRecipes() {
  validateEnvironment();
  await connectDatabase();

  for (const definition of INGREDIENT_DEFINITIONS) {
    await Ingredient.findOneAndUpdate(
      { code: definition.code },
      {
        $set: { ...definition, isActive: true },
        $setOnInsert: { stockQuantity: 0 }
      },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    );
  }

  await Ingredient.collection.updateMany({}, { $unset: { reorderLevel: '' } });

  const ingredients = await Ingredient.find({
    code: { $in: INGREDIENT_DEFINITIONS.map(item => item.code) }
  });
  const ingredientByCode = new Map(ingredients.map(item => [item.code, item]));

  for (const definition of ORDER_MATERIAL_DEFINITIONS) {
    const ingredient = ingredientByCode.get(definition.ingredientCode);
    if (!ingredient) throw new Error(`Không tìm thấy nguyên liệu kho ${definition.ingredientCode}.`);

    const packaging = ingredient.packaging.find(item => item.unit === definition.orderUnit);
    if (!packaging) {
      throw new Error(`Nguyên liệu ${definition.ingredientCode} chưa có quy đổi đơn vị đặt hàng ${definition.orderUnit}.`);
    }

    await PurchaseMaterial.findOneAndUpdate(
      { code: definition.code },
      {
        $set: {
          code: definition.code,
          name: definition.name || ingredient.name,
          supplierName: definition.supplierName || ingredient.supplierName || '',
          ingredient: ingredient._id,
          ingredientCode: ingredient.code,
          orderUnit: definition.orderUnit,
          orderUnitLabel: packaging.label,
          stockUnit: ingredient.baseUnit,
          stockQuantityPerOrderUnit: packaging.baseQuantity,
          isActive: true,
          note: definition.note || ''
        }
      },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    );
  }

  await PurchaseMaterial.updateMany(
    { code: { $nin: ORDER_MATERIAL_DEFINITIONS.map(item => item.code) } },
    { $set: { isActive: false } }
  );
  await PurchaseMaterial.collection.updateMany({}, { $unset: { stockQuantity: '' } });

  for (const definition of RECIPE_DEFINITIONS) {
    const recipeIngredients = definition.ingredients.map(item => {
      const ingredient = ingredientByCode.get(item.ingredientCode);
      if (!ingredient) throw new Error(`Không tìm thấy nguyên liệu ${item.ingredientCode}.`);
      return {
        ingredient: ingredient._id,
        ingredientCode: item.ingredientCode,
        quantityBase: item.quantityBase,
        note: item.note || ''
      };
    });

    await Recipe.findOneAndUpdate(
      { recipeCode: definition.recipeCode },
      {
        $set: {
          ...definition,
          ingredients: recipeIngredients,
          yieldQuantity: 1,
          orderTypes: ['dine_in', 'pickup', 'delivery'],
          isActive: true
        },
        $setOnInsert: { version: 1 }
      },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Đã cập nhật ${INGREDIENT_DEFINITIONS.length} nguyên liệu.`);
  console.log(`Đã cập nhật ${ORDER_MATERIAL_DEFINITIONS.length} nguyên vật liệu đặt hàng.`);
  console.log(`Đã cập nhật ${RECIPE_DEFINITIONS.length} công thức.`);
  console.log('Tồn kho hiện có được giữ nguyên; nguyên liệu mới có tồn ban đầu bằng 0.');
}

seedInventoryRecipes()
  .catch(error => {
    console.error('Không thể tạo dữ liệu nguyên liệu/công thức:', error.message);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
