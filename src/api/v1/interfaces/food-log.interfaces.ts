import { FoodSource, ServingUnit } from "./food.interfaces";

// Types for service parameters
export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snacks"
  | "uncategorized";

export interface AddFoodPayload {
  foodSourceId: string;
  foodName: string;
  foodBrand: string;
  foodSource: FoodSource;
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
  mealType: MealType;
  loggedAt: string;
}

export interface UpdateFoodPayload {
  serving_size: number;
  serving_size_unit: ServingUnit;
}
