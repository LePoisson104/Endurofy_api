export interface USDAFoodSearchResponse {
  foods: Array<{
    fdcId: number;
    description: string;
    brandOwner?: string;
    brandName?: string;
    ingredients?: string;
    foodCategory: string;
    servingSize: number;
    servingSizeUnit: string;
    foodNutrients: {
      macroNutrients: Array<USDAFoodNutrient>;
      microNutrients: Array<USDAFoodNutrient>;
    };
  }>;
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

export interface USDAFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
  rank: number;
  indentLevel: number;
  foodNutrientId: number;
}

export enum USDAFoodNutrientID {
  // Basic Macronutrients
  PROTEIN = 1003,
  FAT = 1004, // "Total lipid (fat)"
  CARBOHYDRATE = 1005, // "Carbohydrate, by difference"
  CALORIES = 1008, // "Energy"

  // Water and Alcohol
  WATER = 1051,
  ALCOHOL = 1018, // "Alcohol, ethyl"

  // Sugars and Fiber
  TOTAL_SUGARS = 2000,
  FIBER = 1079, // "Fiber, total dietary"

  // Stimulants
  CAFFEINE = 1057,
  THEOBROMINE = 1058,

  // Major Minerals
  CALCIUM = 1087,
  IRON = 1089,
  MAGNESIUM = 1090,
  PHOSPHORUS = 1091,
  POTASSIUM = 1092,
  SODIUM = 1093,
  ZINC = 1095,
  COPPER = 1098,
  SELENIUM = 1103,

  // Fat-Soluble Vitamins
  VITAMIN_A = 1104, // "Vitamin A, IU"
  VITAMIN_A_RAE = 1106, // "Vitamin A, RAE"
  RETINOL = 1105,
  BETA_CAROTENE = 1107, // "Carotene, beta"
  ALPHA_CAROTENE = 1108, // "Carotene, alpha"
  BETA_CRYPTOXANTHIN = 1120, // "Cryptoxanthin, beta"
  LYCOPENE = 1122,
  LUTEIN_ZEAXANTHIN = 1123, // "Lutein + zeaxanthin"

  VITAMIN_D = 1114 | 1110, // "Vitamin D (D2 + D3)"
  VITAMIN_E = 1109, // "Vitamin E (alpha-tocopherol)"
  VITAMIN_E_ADDED = 1242, // "Vitamin E, added"
  VITAMIN_K = 1185, // "Vitamin K (phylloquinone)"

  // Water-Soluble Vitamins (B-Complex)
  THIAMIN = 1165, // Vitamin B1
  RIBOFLAVIN = 1166, // Vitamin B2
  NIACIN = 1167, // Vitamin B3
  VITAMIN_B6 = 1175,
  VITAMIN_B12 = 1178,
  VITAMIN_B12_ADDED = 1246, // "Vitamin B-12, added"

  // Folate Family (B9)
  FOLATE_TOTAL = 1177, // "Folate, total"
  FOLIC_ACID = 1186,
  FOLATE_FOOD = 1187, // "Folate, food"
  FOLATE_DFE = 1190, // "Folate, DFE" (Dietary Folate Equivalents)

  // Other B-Vitamins
  CHOLINE = 1180, // "Choline, total"

  // Vitamin C
  VITAMIN_C = 1162, // "Vitamin C, total ascorbic acid"

  // Cholesterol and Fatty Acids
  CHOLESTEROL = 1253,

  // Saturated Fatty Acids
  SATURATED_FAT_TOTAL = 1258, // "Fatty acids, total saturated"
  TRANS_FAT_TOTAL = 1257, // "Fatty acids, total trans"
}

// Helper object for common nutrient groupings
export const NutrientGroups = {
  MACRONUTRIENTS: [
    USDAFoodNutrientID.PROTEIN,
    USDAFoodNutrientID.FAT,
    USDAFoodNutrientID.CARBOHYDRATE,
    USDAFoodNutrientID.CALORIES,
  ],

  BASIC_NUTRITION: [
    USDAFoodNutrientID.CALORIES,
    USDAFoodNutrientID.PROTEIN,
    USDAFoodNutrientID.FAT,
    USDAFoodNutrientID.CARBOHYDRATE,
    USDAFoodNutrientID.FIBER,
    USDAFoodNutrientID.TOTAL_SUGARS,
    USDAFoodNutrientID.SODIUM,
  ],

  VITAMINS: [
    USDAFoodNutrientID.VITAMIN_A_RAE,
    USDAFoodNutrientID.VITAMIN_C,
    USDAFoodNutrientID.VITAMIN_D,
    USDAFoodNutrientID.VITAMIN_E,
    USDAFoodNutrientID.VITAMIN_K,
    USDAFoodNutrientID.THIAMIN,
    USDAFoodNutrientID.RIBOFLAVIN,
    USDAFoodNutrientID.NIACIN,
    USDAFoodNutrientID.VITAMIN_B6,
    USDAFoodNutrientID.VITAMIN_B12,
    USDAFoodNutrientID.FOLATE_TOTAL,
  ],

  MINERALS: [
    USDAFoodNutrientID.CALCIUM,
    USDAFoodNutrientID.IRON,
    USDAFoodNutrientID.MAGNESIUM,
    USDAFoodNutrientID.PHOSPHORUS,
    USDAFoodNutrientID.POTASSIUM,
    USDAFoodNutrientID.SODIUM,
    USDAFoodNutrientID.ZINC,
    USDAFoodNutrientID.COPPER,
    USDAFoodNutrientID.SELENIUM,
  ],

  B_VITAMINS: [
    USDAFoodNutrientID.THIAMIN, // B1
    USDAFoodNutrientID.RIBOFLAVIN, // B2
    USDAFoodNutrientID.NIACIN, // B3
    USDAFoodNutrientID.VITAMIN_B6,
    USDAFoodNutrientID.VITAMIN_B12,
    USDAFoodNutrientID.FOLATE_TOTAL, // B9
    USDAFoodNutrientID.CHOLINE,
  ],
} as const;
