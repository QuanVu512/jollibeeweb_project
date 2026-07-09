const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Counter = require('../models/Counter');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI;

const SAMPLE_PRODUCTS = [
  { productCode: 'MON0001', name: 'Gà Giòn Vui Vẻ (1 Miếng)', price: 30000, categoryCode: 'GaGion', stock: 100 },
  { productCode: 'MON0002', name: 'Gà Giòn Vui Vẻ (2 Miếng)', price: 58000, categoryCode: 'GaGion', stock: 100 },
  { productCode: 'MON0003', name: 'Gà Giòn Vui Vẻ (3 Miếng)', price: 85000, categoryCode: 'GaGion', stock: 100 },
  { productCode: 'MON0004', name: 'Gà Sốt Cay (1 Miếng)', price: 32000, categoryCode: 'GaSotCay', stock: 100 },
  { productCode: 'MON0005', name: 'Gà Sốt Cay (2 Miếng)', price: 62000, categoryCode: 'GaSotCay', stock: 100 },
  { productCode: 'MON0006', name: 'Mỳ Ý Jolly', price: 35000, categoryCode: 'MiY', stock: 100 },
  { productCode: 'MON0007', name: 'Mỳ Ý Jolly với Gà Giòn', price: 60000, categoryCode: 'MiY', stock: 100 },
  { productCode: 'MON0008', name: 'Cơm Gà Giòn Vui Vẻ', price: 45000, categoryCode: 'BurgerCom', stock: 100 },
  { productCode: 'MON0009', name: 'Burger Tôm', price: 35000, categoryCode: 'BurgerCom', stock: 100 },
  { productCode: 'MON0010', name: 'Khoai Tây Chiên (Vừa)', price: 20000, categoryCode: 'PhanAnPhu', stock: 100 },
  { productCode: 'MON0011', name: 'Khoai Tây Chiên (Lớn)', price: 28000, categoryCode: 'PhanAnPhu', stock: 100 },
  { productCode: 'MON0012', name: 'Bánh Xoài Đào', price: 17000, categoryCode: 'TrangMieng', stock: 100 },
  { productCode: 'MON0013', name: 'Kem Ốc Quế Vani', price: 10000, categoryCode: 'TrangMieng', stock: 100 },
  { productCode: 'MON0014', name: 'Pepsi', price: 15000, categoryCode: 'ThucUong', stock: 100 }
];

const REMOVED_PRODUCT_CODES = ['MON0015'];
const PRODUCT_COUNTER_SEQUENCE = 15;

async function seed() {
  if (!uri) {
    console.error('MONGODB_URI is not defined in env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    const dbCategories = await Category.find().lean();
    if (dbCategories.length === 0) {
      console.log('No categories found. Please run "node src/scripts/initDatabase.js" first.');
      return;
    }

    const categoryMap = new Map(dbCategories.map(category => [category.code, category._id]));

    console.log('Upserting sample products...');
    for (const item of SAMPLE_PRODUCTS) {
      await Product.findOneAndUpdate(
        { productCode: item.productCode },
        {
          $set: {
            productCode: item.productCode,
            name: item.name,
            price: item.price,
            costPrice: Math.round(item.price * 0.4),
            unit: 'phần',
            image: '',
            isActive: true,
            category: categoryMap.get(item.categoryCode) || null,
            categoryCode: item.categoryCode
          },
          $setOnInsert: {
            stock: item.stock,
            reorderLevel: 10
          }
        },
        { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
      );
      console.log(` - Upserted product: ${item.name} (${item.productCode})`);
    }

    if (REMOVED_PRODUCT_CODES.length > 0) {
      const result = await Product.updateMany(
        { productCode: { $in: REMOVED_PRODUCT_CODES } },
        { $set: { isActive: false } }
      );
      console.log(`Deactivated ${result.modifiedCount || 0} removed products: ${REMOVED_PRODUCT_CODES.join(', ')}`);
    }

    await Counter.findByIdAndUpdate(
      'product',
      { $max: { sequence: PRODUCT_COUNTER_SEQUENCE } },
      { upsert: true }
    );

    console.log('Products seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding products:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
