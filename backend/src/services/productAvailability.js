const { loadRecipesForOrder, calculateRecipeDeductions } = require('./inventoryRecipeService');

function availableQuantityForProduct(product, recipe) {
  if (!product.isActive) return 0;
  if (!recipe) return 0;
  if (!recipe.ingredients?.length || recipe.ingredients.some(row => !row.ingredient || !row.ingredient.isActive)) return 0;
  const recipes = new Map([[product.productCode, recipe]]);
  const plan = calculateRecipeDeductions({ items: [{ productCode: product.productCode, quantity: 1 }] }, recipes);
  if (!plan.deductions.length) return 0;
  const fits = quantity => calculateRecipeDeductions({ items: [{ productCode: product.productCode, quantity }] }, recipes)
    .deductions.every(deduction => {
      const row = recipe.ingredients.find(item => String(item.ingredient._id) === String(deduction.ingredient));
      return Number(row?.ingredient.stockQuantity) >= deduction.quantity;
    });
  let low = 0;
  let high = 1;
  while (high < Number.MAX_SAFE_INTEGER && fits(high)) {
    low = high;
    high = Math.min(Number.MAX_SAFE_INTEGER, high * 2);
  }
  while (low < high) {
    const mid = low + Math.ceil((high - low) / 2);
    if (fits(mid)) low = mid;
    else high = mid - 1;
  }
  return low;
}

function canOrderProduct(product, recipe) {
  return availableQuantityForProduct(product, recipe) >= 1;
}

async function withAvailability(products, orderType = 'delivery') {
  const recipes = await loadRecipesForOrder({ items: products, orderType });
  return products.map(product => ({
    ...(product.toObject ? product.toObject() : product),
    availableQuantity: availableQuantityForProduct(product, recipes.get(product.productCode)),
    canOrder: canOrderProduct(product, recipes.get(product.productCode))
  }));
}
module.exports = { availableQuantityForProduct, canOrderProduct, withAvailability };
