const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const PRODUCT_NAME_PATTERN = /^(?=.*\p{L})[\p{L}\p{M}\p{N} ]+$/u;

function fieldError(field, message) {
  throw new ApiError(400, message, { [field]: message });
}

function requireText(value, label, maxLength, field) {
  if (typeof value !== 'string' || !value.trim()) {
    fieldError(field, `Nhập ${label.toLowerCase()}.`);
  }
  const text = value.trim();
  if (text.length > maxLength) {
    fieldError(field, `${label} không được vượt quá ${maxLength} ký tự.`);
  }
  return text;
}

function validateProductPayload(body = {}, { allowStatus = false } = {}) {
  const name = requireText(body.name, 'Tên sản phẩm', 70, 'name');
  if (!PRODUCT_NAME_PATTERN.test(name)) {
    fieldError('name', 'Tên sản phẩm phải có ít nhất một chữ cái và chỉ được gồm chữ, số hoặc khoảng trắng.');
  }
  if (body.price === '' || body.price === null || body.price === undefined) {
    fieldError('price', 'Nhập giá bán.');
  }
  const price = Number(body.price);
  if (!Number.isSafeInteger(price) || price <= 0) {
    fieldError('price', 'Giá bán phải là số nguyên lớn hơn 0.');
  }

  if (!mongoose.isValidObjectId(body.categoryId)) {
    fieldError('categoryId', 'Chọn danh mục sản phẩm.');
  }

  if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
    fieldError('ingredients', 'Thêm ít nhất một nguyên liệu tiêu hao.');
  }

  const ingredients = body.ingredients.map((item, index) => {
    if (!mongoose.isValidObjectId(item?.ingredientId)) {
      fieldError('ingredients', `Chọn nguyên liệu tại dòng ${index + 1}.`);
    }
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      fieldError('ingredients', `Số lượng tiêu hao ở dòng ${index + 1} phải lớn hơn 0.`);
    }
    if (typeof item.unit !== 'string' || !item.unit.trim()) {
      fieldError('ingredients', `Chọn đơn vị tiêu hao tại dòng ${index + 1}.`);
    }
    const unit = item.unit.trim();
    if (unit.length > 40) {
      fieldError('ingredients', `Đơn vị tiêu hao tại dòng ${index + 1} không được vượt quá 40 ký tự.`);
    }
    return { ingredientId: item.ingredientId, quantity, unit };
  });

  const payload = { name, price, categoryId: body.categoryId, ingredients };
  if (allowStatus) {
    if (typeof body.isActive !== 'boolean') {
      throw new ApiError(400, 'Trạng thái sản phẩm không hợp lệ.');
    }
    payload.isActive = body.isActive;
  }
  return payload;
}

module.exports = { validateProductPayload };
