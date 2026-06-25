const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Counter = require('../models/Counter');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI;

const SAMPLE_PRODUCTS = [
  { name: 'Gà Giòn Vui Vẻ (1 Miếng)', price: 30000, categoryCode: 'GaGion', stock: 100 },
  { name: 'Gà Giòn Vui Vẻ (2 Miếng)', price: 58000, categoryCode: 'GaGion', stock: 100 },
  { name: 'Gà Giòn Vui Vẻ (3 Miếng)', price: 85000, categoryCode: 'GaGion', stock: 100 },
  { name: 'Gà Sốt Cay (1 Miếng)', price: 32000, categoryCode: 'GaSotCay', stock: 100 },
  { name: 'Gà Sốt Cay (2 Miếng)', price: 62000, categoryCode: 'GaSotCay', stock: 100 },
  { name: 'Mỳ Ý Jolly', price: 35000, categoryCode: 'MiY', stock: 100 },
  { name: 'Mỳ Ý Jolly với Gà Giòn', price: 60000, categoryCode: 'MiY', stock: 100 },
  { name: 'Cơm Gà Giòn Vui Vẻ', price: 45000, categoryCode: 'BurgerCom', stock: 100 },
  { name: 'Burger Bò Royal', price: 35000, categoryCode: 'BurgerCom', stock: 100 },
  { name: 'Khoai Tây Chiên (Vừa)', price: 20000, categoryCode: 'PhanAnPhu', stock: 100 },
  { name: 'Khoai Tây Chiên (Lớn)', price: 28000, categoryCode: 'PhanAnPhu', stock: 100 },
  { name: 'Bánh Pie Đào Xoài', price: 17000, categoryCode: 'TrangMieng', stock: 100 },
  { name: 'Kem Cốc Vani', price: 10000, categoryCode: 'TrangMieng', stock: 100 },
  { name: 'Pepsi Lon', price: 15000, categoryCode: 'ThucUong', stock: 100 },
  { name: 'Trà Đào Tách', price: 22000, categoryCode: 'ThucUong', stock: 100 }
];

async function seed() {
  if (!uri) {
    console.error('MONGODB_URI is not defined in env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    // Ensure categories are loaded
    const dbCategories = await Category.find().lean();
    if (dbCategories.length === 0) {
      console.log('No categories found. Please run "node src/scripts/initDatabase.js" first.');
      return;
    }

    const categoryMap = new Map(dbCategories.map(c => [c.code, c._id]));

    // Check if products already exist
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} products. Skipping seed.`);
      return;
    }

    console.log('Seeding sample products...');
    let sequence = 0;
    
    for (const item of SAMPLE_PRODUCTS) {
      sequence++;
      const pCode = `MON${String(sequence).padStart(4, '0')}`;
      
      const product = new Product({
        productCode: pCode,
        name: item.name,
        price: item.price,
        costPrice: Math.round(item.price * 0.4), // Estimate cost price at 40% of selling price
        stock: item.stock,
        unit: 'phần',
        image: '',
        isActive: true,
        category: categoryMap.get(item.categoryCode) || null,
        categoryCode: item.categoryCode
      });
      
      await product.save();
      console.log(` - Created product: ${item.name} (${pCode})`);
    }

    // Update Counter for product
    await Counter.findByIdAndUpdate(
      'product',
      { $max: { sequence } },
      { upsert: true }
    );

    console.log('Products seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
