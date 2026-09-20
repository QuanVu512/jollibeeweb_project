const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Order = require('../models/Order');
const Counter = require('../models/Counter');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI;

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    const orders = await Order.find({}).select('orderCode').lean();
    console.log(`Found ${orders.length} orders in database.`);

    let maxSequence = 0;
    for (const order of orders) {
      if (order.orderCode && order.orderCode.startsWith('DH')) {
        const numStr = order.orderCode.replace('DH', '');
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxSequence) {
          maxSequence = num;
        }
      }
    }

    console.log(`Maximum sequence number found in orders: ${maxSequence}`);

    // Update Counter
    const counter = await Counter.findByIdAndUpdate(
      'order',
      { $set: { sequence: maxSequence } },
      { new: true, upsert: true }
    );
    console.log(`Updated 'order' counter sequence to: ${counter.sequence}`);

  } catch (error) {
    console.error('Error fixing order counter:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
