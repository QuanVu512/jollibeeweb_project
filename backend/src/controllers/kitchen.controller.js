const path = require('node:path');

const kitchenService = require('../services/kitchenService');

const kitchenViewPath = path.resolve(__dirname, '../../../frontend/bep/kitchen.html');

function showKitchenView(_req, res) {
  res.sendFile(kitchenViewPath);
}

async function listIngredients(_req, res) {
  const ingredients = await kitchenService.listIngredients();
  res.json({ success: true, data: ingredients });
}

async function createIngredient(req, res) {
  const ingredient = await kitchenService.createIngredient(req.body);
  res.status(201).json({ success: true, data: ingredient });
}

async function updateIngredient(req, res) {
  const ingredient = await kitchenService.updateIngredient(req.params.id, req.body);
  res.json({ success: true, data: ingredient });
}

async function deleteIngredient(req, res) {
  const id = await kitchenService.deleteIngredient(req.params.id);
  res.json({ success: true, data: { id } });
}

async function adjustInventory(req, res) {
  const data = await kitchenService.adjustInventory(req.body);
  res.json({ success: true, data });
}

module.exports = {
  showKitchenView,
  listIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  adjustInventory
};
