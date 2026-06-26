const INGREDIENT_DEFINITIONS = Object.freeze([
  {
    code: 'BOT_CHIEN_GA',
    name: 'Bột chiên gà',
    supplierName: 'xưởng cung cấp bột chiên B',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Túi nilon chứa đồ nhỏ', baseQuantity: 1, note: 'Đơn vị tồn kho cơ sở là pack.' },
      { unit: 'case', label: 'Thùng', baseQuantity: 8, note: 'Một thùng có 8 pack.' }
    ]
  },
  {
    code: 'MI',
    name: 'Mì',
    supplierName: 'xưởng cung cấp mì M',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Túi nilon chứa đồ nhỏ', baseQuantity: 1, note: 'Đơn vị tồn kho cơ sở là pack.' },
      { unit: 'case', label: 'Thùng', baseQuantity: 24, note: 'Một thùng có 24 pack.' }
    ]
  },
  {
    code: 'MUOI',
    name: 'Muối',
    supplierName: 'nhà cung cấp gia vị M',
    baseUnit: 'bag',
    packaging: [
      { unit: 'bag', label: 'Túi lớn', baseQuantity: 1, note: 'Một túi lớn tương đương 50 muỗng.' }
    ]
  },
  {
    code: 'SOT_MI',
    name: 'Sốt mì',
    supplierName: 'xưởng cung cấp sốt mì S',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Túi nilon chứa đồ nhỏ', baseQuantity: 1, note: 'Một pack tương đương 20 muỗng lớn.' },
      { unit: 'case', label: 'Thùng', baseQuantity: 8, note: 'Một thùng có 8 pack.' }
    ]
  },
  {
    code: 'PHO_MAI_BAO',
    name: 'Phô mai bào',
    supplierName: 'xưởng cung cấp phô mai P',
    baseUnit: 'gram',
    packaging: [
      { unit: 'pack', label: 'Túi nilon chứa đồ nhỏ', baseQuantity: 3000, note: 'Một pack có 3000 gram.' }
    ]
  },
  {
    code: 'CA_CHUA',
    name: 'Cà chua',
    supplierName: 'nhà vườn rau củ R',
    baseUnit: 'pcs',
    packaging: [
      { unit: 'pcs', label: 'Cái', baseQuantity: 1, note: 'Một cái/quả cắt được khoảng 5 lát.' }
    ]
  },
  {
    code: 'XA_LACH',
    name: 'Xà lách',
    supplierName: 'nhà vườn rau củ R',
    baseUnit: 'gram',
    packaging: [
      { unit: 'bag', label: 'Túi lớn', baseQuantity: 1000, note: 'Một túi lớn 1000 gram khoảng 20 phần, mỗi phần khoảng 50 gram.' }
    ]
  },
  {
    code: 'CHICKEN_STRIP',
    name: 'Gà không xương',
    supplierName: 'xưởng cung cấp gà ướp G',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Túi nilon chứa đồ nhỏ', baseQuantity: 1, note: 'Một pack có 12 miếng gà không xương.' },
      { unit: 'case', label: 'Thùng', baseQuantity: 15, note: 'Một thùng có 15 pack.' }
    ]
  },
  {
    code: 'GA_MIENG',
    name: 'Gà miếng',
    supplierName: 'xưởng cung cấp gà miếng G',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Túi nilon chứa đồ nhỏ', baseQuantity: 1, note: 'Đơn vị tồn kho cơ sở là pack.' },
      { unit: 'case', label: 'Thùng', baseQuantity: 10, note: 'Một thùng có 10 pack gà miếng.' },
      { unit: 'pcs', label: 'Cái', baseQuantity: 1 / 8, note: 'Một pack có 8 miếng gà.' }
    ]
  },
  {
    code: 'BANH_NHAN_TOM',
    name: 'Bánh nhân tôm',
    supplierName: 'xưởng cung cấp bánh tôm T',
    baseUnit: 'pcs',
    packaging: [
      { unit: 'pack', label: 'Túi nilon chứa đồ nhỏ', baseQuantity: 6, note: 'Một pack có 6 cái bánh nhân tôm.' },
      { unit: 'case', label: 'Thùng', baseQuantity: 12, note: 'Một thùng có 2 pack và tổng cộng 12 cái.' }
    ]
  },
  {
    code: 'BANH_XOAI_DAO',
    name: 'Bánh xoài đào',
    supplierName: 'xưởng cung cấp bánh xoài đào X',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Túi nilon chứa đồ nhỏ', baseQuantity: 1, note: 'Đơn vị tồn kho cơ sở là pack.' },
      { unit: 'case', label: 'Thùng', baseQuantity: 6, note: 'Một thùng có 6 pack bánh xoài đào.' },
      { unit: 'pcs', label: 'Cái', baseQuantity: 1 / 8, note: 'Một pack có 8 cái bánh.' }
    ]
  },
  {
    code: 'GAO',
    name: 'Gạo',
    supplierName: 'nhà cung cấp gạo G',
    baseUnit: 'kg',
    packaging: [
      { unit: 'bag', label: 'Túi lớn', baseQuantity: 20, note: 'Một túi lớn gạo có 20 kg.' }
    ]
  },
  {
    code: 'KHOAI_TAY',
    name: 'Khoai tây đông lạnh',
    supplierName: 'nhãn hàng sản xuất khoai tây K',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Túi nilon chứa đồ nhỏ', baseQuantity: 1, note: 'Đơn vị tồn kho cơ sở là pack.' },
      { unit: 'case', label: 'Thùng', baseQuantity: 9, note: 'Một thùng có 9 pack khoai.' }
    ]
  },
  {
    code: 'BOT_KEM_VANI',
    name: 'Bột kem vani',
    supplierName: 'xưởng cung cấp bột kem V',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Túi nilon chứa đồ nhỏ', baseQuantity: 1, note: 'Đơn vị tồn kho cơ sở là pack.' },
      { unit: 'case', label: 'Thùng', baseQuantity: 7, note: 'Một thùng có 7 pack bột kem.' }
    ]
  },
  {
    code: 'SOT_CAY',
    name: 'Sốt cay',
    supplierName: 'xưởng cung cấp sốt cay S',
    baseUnit: 'pack',
    packaging: [
      { unit: 'pack', label: 'Túi nilon chứa đồ nhỏ', baseQuantity: 1, note: 'Đơn vị tồn kho cơ sở là pack.' },
      { unit: 'case', label: 'Thùng', baseQuantity: 6, note: 'Một thùng có 6 pack sốt cay.' }
    ]
  },
  {
    code: 'PEPSI',
    name: 'Nước ngọt Pepsi',
    supplierName: 'nhà cung cấp nước giải khát P',
    baseUnit: 'case',
    packaging: [
      { unit: 'case', label: 'Thùng', baseQuantity: 1, note: 'Đơn vị tồn kho cơ sở là case/thùng.' }
    ]
  }
]);

const ORDER_MATERIAL_DEFINITIONS = Object.freeze([
  { code: 'BOT_CHIEN_GA', ingredientCode: 'BOT_CHIEN_GA', orderUnit: 'case', note: 'Đặt bột chiên gà theo thùng.' },
  { code: 'MI', ingredientCode: 'MI', orderUnit: 'case', note: 'Đặt mì theo thùng.' },
  { code: 'MUOI', ingredientCode: 'MUOI', orderUnit: 'bag', note: 'Đặt muối theo túi lớn.' },
  { code: 'SOT_MI', ingredientCode: 'SOT_MI', orderUnit: 'case', note: 'Đặt sốt mì theo thùng.' },
  { code: 'PHO_MAI_BAO', ingredientCode: 'PHO_MAI_BAO', orderUnit: 'pack', note: 'Đặt phô mai bào theo pack.' },
  { code: 'CA_CHUA', ingredientCode: 'CA_CHUA', orderUnit: 'pcs', note: 'Đặt cà chua theo cái/quả.' },
  { code: 'XA_LACH', ingredientCode: 'XA_LACH', orderUnit: 'bag', note: 'Đặt xà lách theo túi lớn.' },
  { code: 'CHICKEN_STRIP', ingredientCode: 'CHICKEN_STRIP', orderUnit: 'case', note: 'Đặt gà không xương theo thùng.' },
  { code: 'GA_MIENG', ingredientCode: 'GA_MIENG', orderUnit: 'case', note: 'Đặt gà miếng theo thùng.' },
  { code: 'BANH_NHAN_TOM', ingredientCode: 'BANH_NHAN_TOM', orderUnit: 'case', note: 'Đặt bánh nhân tôm theo thùng.' },
  { code: 'BANH_XOAI_DAO', ingredientCode: 'BANH_XOAI_DAO', orderUnit: 'case', note: 'Đặt bánh xoài đào theo thùng.' },
  { code: 'GAO', ingredientCode: 'GAO', orderUnit: 'bag', note: 'Đặt gạo theo túi lớn.' },
  { code: 'KHOAI_TAY', ingredientCode: 'KHOAI_TAY', orderUnit: 'case', note: 'Đặt khoai tây theo thùng.' },
  { code: 'BOT_KEM_VANI', ingredientCode: 'BOT_KEM_VANI', orderUnit: 'case', note: 'Đặt bột kem vani theo thùng.' },
  { code: 'SOT_CAY', ingredientCode: 'SOT_CAY', orderUnit: 'case', note: 'Đặt sốt cay theo thùng.' },
  { code: 'PEPSI', ingredientCode: 'PEPSI', orderUnit: 'case', note: 'Đặt Pepsi theo thùng.' }
]);

const RECIPE_DEFINITIONS = Object.freeze([
  {
    recipeCode: 'MON0001_GA_GION_1_MIENG',
    productCode: 'MON0001',
    name: 'Gà Giòn Vui Vẻ (1 Miếng)',
    ingredients: [
      { ingredientCode: 'GA_MIENG', quantityBase: 1 / 8, note: 'Hao trừ 1/8 pack gà miếng cho 1 miếng gà.' },
      { ingredientCode: 'BOT_CHIEN_GA', quantityBase: 1 / 15, note: 'Hao trừ 1/15 pack bột chiên gà cho 1 miếng gà.' }
    ],
    note: 'Một miếng gà dùng 1/8 pack gà miếng và 1/15 pack bột chiên.'
  },
  {
    recipeCode: 'MON0002_GA_GION_2_MIENG',
    productCode: 'MON0002',
    name: 'Gà Giòn Vui Vẻ (2 Miếng)',
    ingredients: [
      { ingredientCode: 'GA_MIENG', quantityBase: 2 / 8, note: 'Hao trừ 2/8 pack gà miếng cho 2 miếng gà.' },
      { ingredientCode: 'BOT_CHIEN_GA', quantityBase: 2 / 15, note: 'Hao trừ 2/15 pack bột chiên gà cho 2 miếng gà.' }
    ],
    note: 'Công thức gà giòn nhân theo số miếng.'
  },
  {
    recipeCode: 'MON0003_GA_GION_3_MIENG',
    productCode: 'MON0003',
    name: 'Gà Giòn Vui Vẻ (3 Miếng)',
    ingredients: [
      { ingredientCode: 'GA_MIENG', quantityBase: 3 / 8, note: 'Hao trừ 3/8 pack gà miếng cho 3 miếng gà.' },
      { ingredientCode: 'BOT_CHIEN_GA', quantityBase: 3 / 15, note: 'Hao trừ 3/15 pack bột chiên gà cho 3 miếng gà.' }
    ],
    note: 'Công thức gà giòn nhân theo số miếng.'
  },
  {
    recipeCode: 'MON0004_GA_SOT_CAY_1_MIENG',
    productCode: 'MON0004',
    name: 'Gà Sốt Cay (1 Miếng)',
    ingredients: [
      { ingredientCode: 'GA_MIENG', quantityBase: 1 / 8, note: 'Hao trừ 1/8 pack gà miếng cho 1 miếng gà.' },
      { ingredientCode: 'BOT_CHIEN_GA', quantityBase: 1 / 15, note: 'Hao trừ 1/15 pack bột chiên gà cho 1 miếng gà.' },
      { ingredientCode: 'SOT_CAY', quantityBase: 1 / 30, note: 'Hao trừ 1/30 pack sốt cay cho 1 miếng gà sốt cay.' }
    ],
    note: 'Gà sốt cay dùng gà miếng, bột chiên và thêm sốt cay.'
  },
  {
    recipeCode: 'MON0005_GA_SOT_CAY_2_MIENG',
    productCode: 'MON0005',
    name: 'Gà Sốt Cay (2 Miếng)',
    ingredients: [
      { ingredientCode: 'GA_MIENG', quantityBase: 2 / 8, note: 'Hao trừ 2/8 pack gà miếng cho 2 miếng gà.' },
      { ingredientCode: 'BOT_CHIEN_GA', quantityBase: 2 / 15, note: 'Hao trừ 2/15 pack bột chiên gà cho 2 miếng gà.' },
      { ingredientCode: 'SOT_CAY', quantityBase: 2 / 30, note: 'Hao trừ 2/30 pack sốt cay cho 2 miếng gà sốt cay.' }
    ],
    note: 'Gà sốt cay dùng gà miếng, bột chiên và thêm sốt cay theo số miếng.'
  },
  {
    recipeCode: 'MON0006_MI_Y_JOLLY',
    productCode: 'MON0006',
    name: 'Mỳ Ý Jolly',
    ingredients: [
      { ingredientCode: 'MI', quantityBase: 1 / 3, note: 'Hao trừ 1/3 pack mì cho 1 phần.' },
      { ingredientCode: 'MUOI', quantityBase: 1 / 50, note: 'Hao trừ 1/50 bag muối, tương đương 1 muỗng.' },
      { ingredientCode: 'SOT_MI', quantityBase: 1 / 20, note: 'Hao trừ 1/20 pack sốt mì, tương đương 1 muỗng lớn.' },
      { ingredientCode: 'PHO_MAI_BAO', quantityBase: 75, note: 'Hao trừ 75 gram phô mai bào.' }
    ],
    note: 'Một phần mỳ dùng 1/3 pack mì, 1/50 bag muối, 1/20 pack sốt và 75 gram phô mai.'
  },
  {
    recipeCode: 'MON0007_MI_Y_JOLLY_GA_GION',
    productCode: 'MON0007',
    name: 'Mỳ Ý Jolly với Gà Giòn',
    ingredients: [
      { ingredientCode: 'MI', quantityBase: 1 / 3, note: 'Hao trừ 1/3 pack mì cho 1 phần.' },
      { ingredientCode: 'MUOI', quantityBase: 1 / 50, note: 'Hao trừ 1/50 bag muối, tương đương 1 muỗng.' },
      { ingredientCode: 'SOT_MI', quantityBase: 1 / 20, note: 'Hao trừ 1/20 pack sốt mì, tương đương 1 muỗng lớn.' },
      { ingredientCode: 'PHO_MAI_BAO', quantityBase: 75, note: 'Hao trừ 75 gram phô mai bào.' },
      { ingredientCode: 'GA_MIENG', quantityBase: 1 / 8, note: 'Hao trừ thêm 1/8 pack gà miếng cho phần gà giòn đi kèm.' },
      { ingredientCode: 'BOT_CHIEN_GA', quantityBase: 1 / 15, note: 'Hao trừ thêm 1/15 pack bột chiên gà cho phần gà giòn đi kèm.' }
    ],
    note: 'Công thức mỳ Ý Jolly kèm 1 miếng gà giòn.'
  },
  {
    recipeCode: 'MON0008_COM_GA_GION',
    productCode: 'MON0008',
    name: 'Cơm Gà Giòn Vui Vẻ',
    ingredients: [
      { ingredientCode: 'GAO', quantityBase: 0.1, note: 'Hao trừ khoảng 100 gram gạo, tương đương 0.1 kg cho 1 suất cơm.' },
      { ingredientCode: 'GA_MIENG', quantityBase: 1 / 8, note: 'Hao trừ 1/8 pack gà miếng cho phần gà giòn.' },
      { ingredientCode: 'BOT_CHIEN_GA', quantityBase: 1 / 15, note: 'Hao trừ 1/15 pack bột chiên gà cho phần gà giòn.' }
    ],
    note: 'Một suất cơm gà dùng 0.1 kg gạo, 1/8 pack gà miếng và 1/15 pack bột chiên.'
  },
  {
    recipeCode: 'MON0009_BURGER_TOM',
    productCode: 'MON0009',
    name: 'Burger Tôm',
    ingredients: [
      { ingredientCode: 'XA_LACH', quantityBase: 50, note: 'Hao trừ 50 gram xà lách, tương đương 1 miếng.' },
      { ingredientCode: 'BANH_NHAN_TOM', quantityBase: 1, note: 'Hao trừ 1 miếng bánh nhân tôm.' }
    ],
    note: 'Burger tôm dùng 50 gram xà lách và 1 miếng bánh nhân tôm.'
  },
  {
    recipeCode: 'MON0010_KHOAI_TAY_VUA',
    productCode: 'MON0010',
    name: 'Khoai Tây Chiên (Vừa)',
    ingredients: [
      { ingredientCode: 'KHOAI_TAY', quantityBase: 1 / 20, note: 'Hao trừ 1/20 pack khoai cho 1 phần khoai vừa.' }
    ],
    note: 'Khoai vừa dùng 1/20 pack khoai.'
  },
  {
    recipeCode: 'MON0011_KHOAI_TAY_LON',
    productCode: 'MON0011',
    name: 'Khoai Tây Chiên (Lớn)',
    ingredients: [
      { ingredientCode: 'KHOAI_TAY', quantityBase: 1 / 15, note: 'Hao trừ 1/15 pack khoai cho 1 phần khoai lớn.' }
    ],
    note: 'Khoai lớn dùng 1/15 pack khoai.'
  },
  {
    recipeCode: 'MON0012_BANH_XOAI_DAO',
    productCode: 'MON0012',
    name: 'Bánh Xoài Đào',
    ingredients: [
      { ingredientCode: 'BANH_XOAI_DAO', quantityBase: 1 / 8, note: 'Hao trừ 1/8 pack bánh xoài đào cho 1 cái bánh.' }
    ],
    note: 'Một cái bánh xoài đào dùng 1/8 pack bánh.'
  },
  {
    recipeCode: 'MON0013_KEM_OC_QUE_VANI',
    productCode: 'MON0013',
    name: 'Kem Ốc Quế Vani',
    ingredients: [
      { ingredientCode: 'BOT_KEM_VANI', quantityBase: 1 / 40, note: 'Hao trừ 1/40 pack bột kem cho 1 que kem ốc quế vani.' }
    ],
    note: 'Một que kem ốc quế vani dùng 1/40 pack bột kem.'
  },
  {
    recipeCode: 'MON0014_PEPSI',
    productCode: 'MON0014',
    name: 'Pepsi',
    ingredients: [
      { ingredientCode: 'PEPSI', quantityBase: 1 / 50, note: 'Hao trừ 1/50 thùng/case nước ngọt cho 1 cốc Pepsi.' }
    ],
    note: 'Một cốc Pepsi dùng 1/50 thùng/case.'
  }
]);

module.exports = { INGREDIENT_DEFINITIONS, ORDER_MATERIAL_DEFINITIONS, RECIPE_DEFINITIONS };
