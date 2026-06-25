const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema(
  {
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    ingredientCode: { type: String, required: true, trim: true, uppercase: true },
    quantityBase: { type: Number, required: true, min: 0.000001 },
    note: { type: String, trim: true, maxlength: 200, default: '' }
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    recipeCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    productCode: { type: String, required: true, trim: true, uppercase: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    yieldQuantity: { type: Number, default: 1, min: 1 },
    orderTypes: {
      type: [{ type: String, enum: ['dine_in', 'pickup', 'delivery'] }],
      default: ['dine_in', 'pickup', 'delivery']
    },
    ingredients: { type: [recipeIngredientSchema], required: true, validate: value => value.length > 0 },
    isActive: { type: Boolean, default: true },
    version: { type: Number, default: 1, min: 1 },
    note: { type: String, trim: true, maxlength: 300, default: '' }
  },
  { timestamps: true }
);

recipeSchema.index({ productCode: 1, isActive: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
