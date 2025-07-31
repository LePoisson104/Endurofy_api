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

  // Sugars and Fiber
  TOTAL_SUGARS = 2000,
  FIBER = 1079, // "Fiber, total dietary"

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
  CHOLESTEROL = 1006,
}

// Helper object for common nutrient groupings
export const NutrientGroups = {
  BASIC_NUTRITION: [
    USDAFoodNutrientID.CALORIES,
    USDAFoodNutrientID.PROTEIN,
    USDAFoodNutrientID.FAT,
    USDAFoodNutrientID.CARBOHYDRATE,
    USDAFoodNutrientID.FIBER,
    USDAFoodNutrientID.TOTAL_SUGARS,
    USDAFoodNutrientID.SODIUM,
    USDAFoodNutrientID.CHOLESTEROL,
  ],
} as const;

// Common types
export type FoodSource = "USDA" | "custom";
export type ServingUnit = "g" | "ml" | "oz";

// Favorite Food Interfaces
export interface AddFavoriteFoodPayload {
  foodId: string;
  foodName: string;
  foodBrand: string;
  foodSource: FoodSource;
}

// Custom Food Interfaces
export interface AddCustomFoodPayload {
  foodName: string;
  foodBrand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  servingSize: number;
  servingUnit: ServingUnit;
}

export interface UpdateCustomFoodPayload {
  food_name: string;
  food_brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: number;
  serving_unit: ServingUnit;
}

export interface GetCustomFoodPayload {
  customFoodId: string;
  description: string;
  brandOwner: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  servingSize: number;
  servingSizeUnit: ServingUnit;
}

export interface CustomFoodRepository {
  custom_food_id: string;
  food_name: string;
  brand_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  cholesterol_mg: number;
  serving_size: number;
  serving_size_unit: ServingUnit;
}
