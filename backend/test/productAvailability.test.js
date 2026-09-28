const test = require('node:test');
const assert = require('node:assert/strict');
const { availableQuantityForProduct, canOrderProduct } = require('../src/services/productAvailability');
const product = { productCode: 'MON0001', stock: 10, isActive: true };
const recipe = stock => ({ yieldQuantity: 2, ingredients: [{ quantityBase: 4, ingredient: { _id: 'ing', isActive: true, stockQuantity: stock } }] });
test('requires enough ingredients for one portion, including recipe yield', () => {
  assert.equal(canOrderProduct(product, recipe(2)), true);
  assert.equal(canOrderProduct(product, recipe(1.9)), false);
  assert.equal(canOrderProduct(product, recipe(0)), false);
});
test('blocks unavailable products and missing or disabled ingredients', () => {
  assert.equal(canOrderProduct({ ...product, stock: 0 }, recipe(10)), true);
  assert.equal(canOrderProduct({ ...product, isActive: false }, recipe(10)), false);
  const missing = recipe(10);
  missing.ingredients[0].ingredient = null;
  assert.equal(canOrderProduct(product, missing), false);
  const inactive = recipe(10);
  inactive.ingredients[0].ingredient.isActive = false;
  assert.equal(canOrderProduct(product, inactive), false);
});
test('requires a recipe and aggregates repeated ingredients', () => {
  assert.equal(canOrderProduct(product, undefined), false);
  assert.equal(canOrderProduct({ ...product, stock: 0 }, undefined), false);
  const repeated = recipe(3);
  repeated.ingredients.push(repeated.ingredients[0]);
  assert.equal(canOrderProduct(product, repeated), false);
});
test('returns the maximum sellable quantity limited by product and ingredient stock', () => {
  assert.equal(availableQuantityForProduct({ ...product, stock: 7 }, recipe(20)), 10);
  assert.equal(availableQuantityForProduct({ ...product, stock: 50 }, recipe(5)), 2);
  assert.equal(availableQuantityForProduct({ ...product, stock: 1 }, recipe(100)), 50);
});
