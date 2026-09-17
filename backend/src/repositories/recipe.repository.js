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

module.exports = { findActiveByProductCodes };
