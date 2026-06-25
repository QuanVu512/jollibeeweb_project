const INGREDIENT_DEFINITIONS = Object.freeze([
  {
    code: 'BOT_CHIEN_GA',
    name: 'Bột chiên gà',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Pack', baseQuantity: 1, note: 'Đơn vị tồn kho cơ sở là pack.' },
      { unit: 'carton', label: 'Thùng', baseQuantity: 8, note: 'Một thùng có 8 pack.' }
    ]
  },
  {
    code: 'MI',
    name: 'Mì',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Pack', baseQuantity: 1, note: 'Đơn vị tồn kho cơ sở là pack.' },
      { unit: 'carton', label: 'Thùng', baseQuantity: 24, note: 'Một thùng có 24 pack.' }
    ]
  },
  {
    code: 'MUOI',
    name: 'Muối',
    baseUnit: 'bag',
    packaging: [
      { unit: 'bag', label: 'Túi/gói', baseQuantity: 1, note: 'Đơn vị tồn kho cơ sở là bag; một bag tương đương 50 muỗng.' }
    ]
  },
  {
    code: 'SOT_MI',
    name: 'Sốt mì',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Pack', baseQuantity: 1, note: 'Đơn vị tồn kho cơ sở là pack; một pack tương đương 20 muỗng lớn.' },
      { unit: 'case', label: 'Thùng/case', baseQuantity: 8, note: 'Một thùng/case có 8 pack.' }
    ]
  },
  {
    code: 'PHO_MAI_BAO',
    name: 'Phô mai bào',
    baseUnit: 'gram',
    packaging: [
      { unit: 'pack', label: 'Pack 3 kg', baseQuantity: 3000, note: 'Một pack có 3000 gram.' }
    ]
  },
  {
    code: 'CA_CHUA',
    name: 'Cà chua',
    baseUnit: 'quả',
    packaging: [
      { unit: 'fruit', label: 'Quả', baseQuantity: 1, note: 'Một quả cắt được khoảng 5 lát.' }
    ]
  },
  {
    code: 'XA_LACH',
    name: 'Xà lách',
    baseUnit: 'gram',
    packaging: [
      { unit: 'kilogram', label: 'Kilogram', baseQuantity: 1000, note: 'Một kilogram khoảng 20 miếng, mỗi miếng khoảng 50 gram.' }
    ]
  },
  {
    code: 'CHICKEN_STRIP',
    name: 'Gà không xương',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Pack', baseQuantity: 1, note: 'Một pack có 12 miếng gà không xương.' },
      { unit: 'carton', label: 'Thùng', baseQuantity: 15, note: 'Một thùng có 15 pack.' }
    ]
  },
  {
    code: 'BANH_NHAN_TOM',
    name: 'Bánh nhân tôm',
    baseUnit: 'miếng',
    packaging: [
      { unit: 'pack', label: 'Pack', baseQuantity: 6, note: 'Một pack có 6 miếng bánh nhân tôm.' },
      { unit: 'carton', label: 'Thùng', baseQuantity: 12, note: 'Một thùng có 2 pack và tổng cộng 12 miếng.' }
    ]
  }
]);

const RECIPE_DEFINITIONS = Object.freeze([
  {
    recipeCode: 'GA_RAN_1_MIENG',
    productCode: 'GA_RAN_1_MIENG',
    name: 'Gà rán - 1 miếng',
    ingredients: [{ ingredientCode: 'BOT_CHIEN_GA', quantityBase: 1 / 15 }],
    note: 'Một miếng gà dùng 1/15 pack bột chiên. Chưa bao gồm thịt gà sống và dầu chiên.'
  },
  {
    recipeCode: 'MI_Y_PHOMAI',
    productCode: 'MI_Y_PHOMAI',
    name: 'Mì Ý phô mai',
    ingredients: [
      { ingredientCode: 'MI', quantityBase: 1 / 3 },
      { ingredientCode: 'MUOI', quantityBase: 1 / 50 },
      { ingredientCode: 'SOT_MI', quantityBase: 1 / 20 },
      { ingredientCode: 'PHO_MAI_BAO', quantityBase: 75 }
    ],
    note: 'Một phần dùng 1/3 pack mì, 1/50 bag muối, 1/20 pack sốt và 75 gram phô mai.'
  },
  {
    recipeCode: 'BURGER_GA',
    productCode: 'BURGER_GA',
    name: 'Burger gà',
    ingredients: [
      { ingredientCode: 'CA_CHUA', quantityBase: 1 / 5 },
      { ingredientCode: 'XA_LACH', quantityBase: 50 },
      { ingredientCode: 'CHICKEN_STRIP', quantityBase: 1 / 6 }
    ],
    note: 'Một burger dùng 1/5 quả cà chua, 50 gram xà lách và 2 miếng gà không xương, tương đương 1/6 pack. Chưa bao gồm vỏ bánh và sốt.'
  },
  {
    recipeCode: 'BURGER_TOM',
    productCode: 'BURGER_TOM',
    name: 'Burger tôm',
    ingredients: [
      { ingredientCode: 'XA_LACH', quantityBase: 50 },
      { ingredientCode: 'BANH_NHAN_TOM', quantityBase: 1 }
    ],
    note: 'Một burger dùng 50 gram xà lách và 1 miếng bánh nhân tôm. Chưa bao gồm vỏ bánh và sốt.'
  }
]);

module.exports = { INGREDIENT_DEFINITIONS, RECIPE_DEFINITIONS };
