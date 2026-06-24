const { ROLE_DEFINITIONS } = require('../constants/roleDefinitions');
const { CATEGORIES } = require('../constants/catalog');
const Role = require('../models/Role');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const InventoryTransaction = require('../models/InventoryTransaction');
const Supplier = require('../models/Supplier');
const PaymentTransaction = require('../models/PaymentTransaction');
const AuditLog = require('../models/AuditLog');
const Counter = require('../models/Counter');
const Ingredient = require('../models/Ingredient');
const Recipe = require('../models/Recipe');

const MODELS = [
  Role,
  User,
  Employee,
  Customer,
  Category,
  Product,
  Cart,
  Order,
  InventoryTransaction,
  Supplier,
  PaymentTransaction,
  AuditLog,
  Counter,
  Ingredient,
  Recipe
];

async function ensureCollection(Model) {
  try {
    await Model.createCollection();
  } catch (error) {
    if (error.code !== 48 && error.codeName !== 'NamespaceExists') throw error;
  }
  await Model.init();
}

async function initializeDatabase() {
  for (const Model of MODELS) {
    await ensureCollection(Model);
  }

  await Role.bulkWrite(ROLE_DEFINITIONS.map((role) => ({
    updateOne: {
      filter: { key: role.key },
      update: { $set: { ...role, isSystem: true } },
      upsert: true
    }
  })));

  await Category.bulkWrite(CATEGORIES.map((category) => ({
    updateOne: {
      filter: { code: category.code },
      update: { $set: { ...category, isActive: true } },
      upsert: true
    }
  })));

  const collections = await Role.db.db.listCollections({}, { nameOnly: true }).toArray();
  return {
    database: Role.db.name,
    collections: collections.map((item) => item.name).sort(),
    roles: ROLE_DEFINITIONS.map((item) => item.key),
    categoryCount: CATEGORIES.length
  };
}

module.exports = { initializeDatabase };
