function calculateStockDelta(quantityOrdered, purchaseMaterial) {
  const quantity = Number(quantityOrdered);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 0;
  }

  if (!purchaseMaterial) {
    return quantity;
  }

  const conversion = Number(purchaseMaterial.stockQuantityPerOrderUnit);
  if (!Number.isFinite(conversion) || conversion <= 0) {
    return quantity;
  }

  return quantity * conversion;
}

module.exports = {
  calculateStockDelta
};
