const Recipe = require('../models/Recipe');

function findActiveByProductCodes(productCodes, orderType, session) {
  let query = Recipe.find({
    productCode: { $in: productCodes },
    isActive: true,
    $or: [
      { orderTypes: orderType || 'dine_in' },
      { orderTypes: { $size: 0 } }
    ]
  })
    .populate('ingredients.ingredient')
    .sort({ productCode: 1, version: -1, updatedAt: -1 });

  if (session) query = query.session(session);
  return query;
}

module.exports = { findActiveByProductCodes };
