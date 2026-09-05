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
const PurchaseMaterial = require('../models/PurchaseMaterial');
const Recipe = require('../models/Recipe');
const Notification = require('../models/Notification');

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
  PurchaseMaterial,
  Recipe,
  Notification
];

async function ensureCollection(Model) {
  try {
    await Model.createCollection();
  } catch (error) {
    if (error.code !== 48 && error.codeName !== 'NamespaceExists') throw error;
  }
  await Model.init();
}

async function ensureCollections() {
  for (const Model of MODELS) {
    await ensureCollection(Model);
  }
}

function upsertRoles(roleDefinitions) {
  return Role.bulkWrite(roleDefinitions.map((role) => ({
    updateOne: {
      filter: { key: role.key },
      update: { $set: { ...role, isSystem: true } },
      upsert: true
    }
  })));
}

function upsertCategories(categories) {
  return Category.bulkWrite(categories.map((category) => ({
    updateOne: {
      filter: { code: category.code },
      update: { $set: { ...category, isActive: true } },
      upsert: true
    }
  })));
}

function listCollections() {
  return Role.db.db.listCollections({}, { nameOnly: true }).toArray();
}

function databaseName() {
  return Role.db.name;
}

module.exports = {
  ensureCollections,
  upsertRoles,
  upsertCategories,
  listCollections,
  databaseName
};
