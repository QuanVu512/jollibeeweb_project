const Recipe = require('../models/Recipe');

function findActiveByProductCodes(productCodes, orderType, session) {
  const filter = {
    isActive: true,
    $or: [
      { orderTypes: orderType || 'dine_in' },
      { orderTypes: { $size: 0 } }
    ]
  };

  if (Array.isArray(productCodes) && productCodes.length > 0) {
    filter.productCode = { $in: productCodes };
  }

  let query = Recipe.find(filter)
    .populate('ingredients.ingredient')
    .sort({ productCode: 1, version: -1, updatedAt: -1 });

  if (session) query = query.session(session);
  return query;
}

function findByProductCode(productCode, session = null) {
  const query = Recipe.findOne({ productCode: String(productCode || '').toUpperCase() });
  return session ? query.session(session) : query;
}

function findByProductCodeWithIngredients(productCode) {
  return Recipe.findOne({ productCode: String(productCode || '').toUpperCase() })
    .populate('ingredients.ingredient', 'code name baseUnit packaging isActive');
}

function save(recipe, options = {}) {
  return recipe.save(options);
}

async function create(payload, session) {
  const [recipe] = await Recipe.create([payload], { session });
  return recipe;
}

module.exports = {
  findActiveByProductCodes,
  findByProductCode,
  findByProductCodeWithIngredients,
  save,
  create
};
