const INGREDIENT_DEFINITIONS = Object.freeze([
  {
    code: 'BOT_CHIEN_GA',
    name: 'Bột chiên gà',
    baseUnit: 'định lượng cho 1 miếng gà',
    packaging: [
      { unit: 'pack', label: 'Pack', baseQuantity: 15, note: 'Một pack dùng cho 15 miếng gà.' },
      { unit: 'carton', label: 'Thùng', baseQuantity: 120, note: 'Một thùng có 8 pack.' }
    ]
  },
  {
    code: 'MI',
    name: 'Mì',
    baseUnit: 'suất 1/3 pack',
    packaging: [
      { unit: 'pack', label: 'Pack', baseQuantity: 3, note: 'Một phần món dùng 1/3 pack.' },
      { unit: 'carton', label: 'Thùng', baseQuantity: 72, note: 'Một thùng có 24 pack.' }
    ]
  },
  {
    code: 'MUOI',
    name: 'Muối',
    baseUnit: 'muỗng',
    packaging: [
      { unit: 'bag', label: 'Túi/gói', baseQuantity: 50, note: 'Một túi tương đương 50 muỗng.' }
    ]
  },
  {
    code: 'SOT_MI',
    name: 'Sốt mì',
    baseUnit: 'muỗng lớn',
    packaging: [
      { unit: 'pack', label: 'Pack', baseQuantity: 20, note: 'Một pack tương đương 20 muỗng lớn.' },
      { unit: 'case', label: 'Thùng/case', baseQuantity: 160, note: 'Một thùng có 8 pack.' }
    ]
  },
  {
    code: 'PHO_MAI_BAO',
    name: 'Phô mai bào',
    baseUnit: 'gram',
    packaging: [
      { unit: 'pack', label: 'Pack 3 kg', baseQuantity: 3000, note: 'Một phần món dùng 1/40 pack, tương đương 75 gram.' }
    ]
  },
  {
    code: 'CA_CHUA',
    name: 'Cà chua',
    baseUnit: 'lát',
    packaging: [
      { unit: 'fruit', label: 'Quả', baseQuantity: 5, note: 'Một quả cắt được 5 lát.' }
    ]
  },
  {
    code: 'XA_LACH',
    name: 'Xà lách',
    baseUnit: 'miếng',
    packaging: [
      { unit: 'kilogram', label: 'Kilogram', baseQuantity: 20, note: 'Một kilogram chia được 20 miếng.' }
    ]
  },
  {
    code: 'CHICKEN_STRIP',
    name: 'Gà không xương (chicken strip)',
    baseUnit: 'miếng',
    packaging: [
      { unit: 'pack', label: 'Pack', baseQuantity: 1, note: 'Một pack có 1 miếng gà không xương.' },
      { unit: 'carton', label: 'Thùng', baseQuantity: 15, note: 'Một thùng có 15 pack.' }
    ]
  },
  {
    code: 'BANH_NHAN_TOM',
    name: 'Bánh nhân tôm',
    baseUnit: 'miếng',
    packaging: [
      { unit: 'pack', label: 'Pack', baseQuantity: 6, note: 'Một thùng có 2 pack và tổng cộng 12 miếng.' },
      { unit: 'carton', label: 'Thùng', baseQuantity: 12, note: 'Một thùng có 12 miếng bánh nhân tôm.' }
    ]
  }
]);

const RECIPE_DEFINITIONS = Object.freeze([
  {
    recipeCode: 'GA_RAN_1_MIENG',
    productCode: 'GA_RAN_1_MIENG',
    name: 'Gà rán - 1 miếng',
    ingredients: [{ ingredientCode: 'BOT_CHIEN_GA', quantityBase: 1 }],
    note: 'Mới tính bột chiên theo định lượng đã cung cấp; chưa bao gồm thịt gà sống và dầu chiên.'
  },
  {
    recipeCode: 'MI_Y_PHOMAI',
    productCode: 'MI_Y_PHOMAI',
    name: 'Mì Ý phô mai',
    ingredients: [
      { ingredientCode: 'MI', quantityBase: 1 },
      { ingredientCode: 'MUOI', quantityBase: 1 },
      { ingredientCode: 'SOT_MI', quantityBase: 1 },
      { ingredientCode: 'PHO_MAI_BAO', quantityBase: 75 }
    ],
    note: 'Một phần dùng 1/3 pack mì, 1 muỗng muối, 1 muỗng lớn sốt và 75 gram phô mai.'
  },
  {
    recipeCode: 'BURGER_GA',
    productCode: 'BURGER_GA',
    name: 'Burger gà',
    ingredients: [
      { ingredientCode: 'CA_CHUA', quantityBase: 1 },
      { ingredientCode: 'XA_LACH', quantityBase: 1 },
      { ingredientCode: 'CHICKEN_STRIP', quantityBase: 2 }
    ],
    note: 'Chưa bao gồm vỏ bánh burger và các loại sốt vì chưa có định lượng.'
  },
  {
    recipeCode: 'BURGER_TOM',
    productCode: 'BURGER_TOM',
    name: 'Burger tôm',
    ingredients: [
      { ingredientCode: 'XA_LACH', quantityBase: 1 },
      { ingredientCode: 'BANH_NHAN_TOM', quantityBase: 1 }
    ],
    note: 'Chưa bao gồm vỏ bánh burger và các loại sốt vì chưa có định lượng.'
  }
]);

module.exports = { INGREDIENT_DEFINITIONS, RECIPE_DEFINITIONS };
