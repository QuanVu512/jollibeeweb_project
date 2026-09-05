const ingredientRepository = require('../repositories/ingredient.repository');
const kitchenSupplyOrderRepository = require('../repositories/kitchenSupplyOrder.repository');
const purchaseMaterialRepository = require('../repositories/purchaseMaterial.repository');
const databaseRepository = require('../repositories/database.repository');
const ApiError = require('../utils/ApiError');

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

function listPurchaseMaterials() {
  return purchaseMaterialRepository.findActive();
}

function listOrders() {
  return kitchenSupplyOrderRepository.findAll();
}

async function createOrder(body, userId) {
  const { items = [], note = '' } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Vui lòng chọn ít nhất 1 nguyên liệu.');
  }

  const normalizedItems = items.map((item) => {
    const ingredientId = item?.ingredientId || item?.ingredient?._id || item?.id;
    const quantityBase = Number(item?.quantityBase ?? item?.quantity ?? 0);

    if (!ingredientId || !Number.isFinite(quantityBase) || quantityBase < 1) {
      return null;
    }

    return {
      ingredient: databaseRepository.isValidObjectIdType(ingredientId) ? ingredientId : undefined,
      ingredientCode: String(item.ingredientCode || '').trim().toUpperCase(),
      ingredientName: String(item.ingredientName || '').trim(),
      quantityBase,
      unitBase: String(item.unitBase || '').trim()
    };
  });

  const validItems = normalizedItems.filter(Boolean);
  if (validItems.length === 0) {
    throw new ApiError(400, 'Dữ liệu nguyên liệu không hợp lệ.');
  }

  const ingredientIds = validItems.map((item) => item.ingredient);
  const ingredients = await ingredientRepository.findByIds(ingredientIds);
  const ingredientMap = new Map(ingredients.map((ingredient) => [String(ingredient._id), ingredient]));

  const finalItems = validItems.map((item) => {
    const ingredient = ingredientMap.get(String(item.ingredient));
    if (!ingredient) {
      throw new ApiError(404, 'Không tìm thấy nguyên liệu: ' + item.ingredient);
    }

    return {
      ingredient: item.ingredient,
      ingredientCode: item.ingredientCode || ingredient.code,
      ingredientName: item.ingredientName || ingredient.name,
      quantityBase: item.quantityBase,
      unitBase: item.unitBase
    };
  });

  return kitchenSupplyOrderRepository.create({
    createdBy: userId || null,
    items: finalItems,
    note
  });
}

async function confirmOrder(id, body, userId) {
  const { note = '' } = body || {};

  if (!databaseRepository.isValidObjectIdType(id)) {
    throw new ApiError(400, 'ID đơn đặt không hợp lệ.');
  }

  const order = await kitchenSupplyOrderRepository.findById(id);
  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn đặt.');
  }
  if (order.status === 'confirmed') {
    return order;
  }
  if (order.status === 'cancelled') {
    throw new ApiError(400, 'Đơn đặt đã bị hủy.');
  }

  const purchaseMaterials = await purchaseMaterialRepository.findByIngredientIds(
    order.items.map((item) => item.ingredient)
  );
  const purchaseMaterialMap = new Map(
    purchaseMaterials.map((item) => [String(item.ingredient), item])
  );

  for (const item of order.items) {
    const ingredient = await ingredientRepository.findById(item.ingredient);
    if (!ingredient) {
      throw new ApiError(404, 'Không tìm thấy nguyên liệu: ' + item.ingredient);
    }

    const purchaseMaterial = purchaseMaterialMap.get(String(item.ingredient));
    const stockDelta = calculateStockDelta(Number(item.quantityBase), purchaseMaterial);
    ingredient.stockQuantity += stockDelta;
    await ingredientRepository.save(ingredient);
  }

  order.status = 'confirmed';
  order.confirmedBy = userId || null;
  if (note) {
    order.note = [order.note, String(note)].filter(Boolean).join(' | ').slice(0, 300);
  }
  await kitchenSupplyOrderRepository.save(order);

  return order;
}

async function cancelOrder(id, body, userId) {
  const { note = '' } = body || {};

  if (!databaseRepository.isValidObjectIdType(id)) {
    throw new ApiError(400, 'ID đơn đặt không hợp lệ.');
  }

  const order = await kitchenSupplyOrderRepository.findById(id);
  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn đặt.');
  }
  if (order.status === 'confirmed') {
    throw new ApiError(400, 'Đơn đã được chấp nhận, không thể hủy.');
  }
  if (order.status === 'cancelled') {
    return order;
  }

  order.status = 'cancelled';
  order.cancelledBy = userId || null;
  if (note) {
    order.note = [order.note, String(note)].filter(Boolean).join(' | ').slice(0, 300);
  }
  await kitchenSupplyOrderRepository.save(order);

  return order;
}

module.exports = {
  calculateStockDelta,
  listPurchaseMaterials,
  listOrders,
  createOrder,
  confirmOrder,
  cancelOrder
};
