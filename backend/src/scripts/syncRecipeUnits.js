const { validateEnvironment } = require('../config/env');
const { connectDatabase, disconnectDatabase } = require('../config/database');
const Ingredient = require('../models/Ingredient');
const Recipe = require('../models/Recipe');
const { INGREDIENT_DEFINITIONS, RECIPE_DEFINITIONS } = require('../data/inventoryRecipes');

const TARGET_INGREDIENT_CODES = Object.freeze([
  'GA_MIENG',
  'MUOI',
  'SOT_MI',
  'GAO',
  'XA_LACH',
  'BANH_XOAI_DAO',
  'PEPSI'
]);

async function syncRecipeUnits() {
  validateEnvironment();
  await connectDatabase();

  const targetDefinitions = INGREDIENT_DEFINITIONS.filter((definition) => (
    TARGET_INGREDIENT_CODES.includes(definition.code)
  ));

  for (const definition of targetDefinitions) {
    const ingredient = await Ingredient.findOneAndUpdate(
      { code: definition.code },
      { $set: { packaging: definition.packaging } },
      { returnDocument: 'after', runValidators: true }
    );
    if (!ingredient) throw new Error(`Không tìm thấy nguyên liệu ${definition.code}.`);
  }

  const affectedRecipes = RECIPE_DEFINITIONS.filter((definition) => (
    definition.ingredients.some((item) => TARGET_INGREDIENT_CODES.includes(item.ingredientCode))
  ));
  const requiredIngredientCodes = [
    ...new Set(affectedRecipes.flatMap((definition) => (
      definition.ingredients.map((item) => item.ingredientCode)
    )))
  ];
  const ingredients = await Ingredient.find({ code: { $in: requiredIngredientCodes } });
  const ingredientByCode = new Map(ingredients.map((ingredient) => [ingredient.code, ingredient]));

  for (const definition of affectedRecipes) {
    const recipeIngredients = definition.ingredients.map((item) => {
      const ingredient = ingredientByCode.get(item.ingredientCode);
      if (!ingredient) throw new Error(`Không tìm thấy nguyên liệu ${item.ingredientCode}.`);
      return {
        ingredient: ingredient._id,
        ingredientCode: item.ingredientCode,
        quantity: item.quantity ?? item.quantityBase,
        unit: item.unit || ingredient.baseUnit,
        quantityBase: item.quantityBase,
        note: item.note || ''
      };
    });

    const recipe = await Recipe.findOneAndUpdate(
      { recipeCode: definition.recipeCode },
      { $set: { ingredients: recipeIngredients } },
      { returnDocument: 'after', runValidators: true }
    );
    if (!recipe) throw new Error(`Không tìm thấy công thức ${definition.recipeCode}.`);
  }

  console.log(`Đã đồng bộ ${targetDefinitions.length} nguyên liệu có đơn vị nghiệp vụ.`);
  console.log(`Đã đồng bộ ${affectedRecipes.length} công thức liên quan.`);
  console.log('Tồn kho và các dữ liệu ngoài phạm vi quy đổi được giữ nguyên.');
}

syncRecipeUnits()
  .catch((error) => {
    console.error('Không thể đồng bộ đơn vị/công thức:', error.message);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
