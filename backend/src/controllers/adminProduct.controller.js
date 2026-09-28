const adminProductService = require('../services/adminProductService');
const auditContext = require('../utils/auditContext');

async function listProducts(req, res) {
  const data = await adminProductService.listProducts(req.query);
  res.json({ success: true, data });
}

async function getOptions(_req, res) {
  const data = await adminProductService.getOptions();
  res.json({ success: true, data });
}

async function getProduct(req, res) {
  const product = await adminProductService.getProduct(req.params.id);
  res.json({ success: true, data: { product } });
}

async function createProduct(req, res) {
  const product = await adminProductService.createProduct(req.body, auditContext(req));
  res.status(201).json({
    success: true,
    message: 'Đã tạo sản phẩm.',
    data: { product }
  });
}

async function updateProduct(req, res) {
  const product = await adminProductService.updateProduct(req.params.id, req.body, auditContext(req));
  res.json({
    success: true,
    message: 'Đã cập nhật sản phẩm.',
    data: { product }
  });
}

async function deactivateProduct(req, res) {
  await adminProductService.deactivateProduct(req.params.id, auditContext(req));
  res.json({
    success: true,
    message: 'Đã ngừng hoạt động sản phẩm; dữ liệu và lịch sử vẫn được giữ lại.'
  });
}

module.exports = {
  listProducts,
  getOptions,
  getProduct,
  createProduct,
  updateProduct,
  deactivateProduct
};
