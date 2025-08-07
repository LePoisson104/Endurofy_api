import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET QUERIES - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const queryGetFavoriteFood = async (
  userId: string,
  connection?: any
): Promise<any> => {
  try {
    const query = `
      SELECT 
        favorite_food_id, 
        food_id, 
        brand_name, 
        food_name, 
        food_source,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        fiber_g,
        sugar_g,
        sodium_mg,
        cholesterol_mg,
        serving_size,
        serving_size_unit
      FROM favorite_foods 
      WHERE user_id = ?
    `;
    if (connection) {
      const [result] = await connection.execute(query, [userId]);
      return result as any[];
    } else {
      const [result] = await pool.execute(query, [userId]);
      return result as any[];
    }
  } catch (err: any) {
    await Logger.logEvents(`Error getting favorite food: ${err}`, "errLog.log");
    throw new AppError("Database error while getting favorite food", 500);
  }
};

const queryGetIsFavoriteFood = async (
  userId: string,
  foodId: string
): Promise<any> => {
  try {
    const query =
      "SELECT * FROM favorite_foods WHERE user_id = ? AND food_id = ?";
    const [result] = await pool.execute(query, [userId, foodId]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(
      `Error checking if food is favorite: ${err}`,
      "errLog.log"
    );
    throw new AppError(
      "Database error while checking if food is favorite",
      500
    );
  }
};

const queryGetFavoriteStatusBatch = async (
  userId: string,
  foodIds: string[]
): Promise<any> => {
  try {
    if (foodIds.length === 0) return [];

    const placeholders = foodIds.map(() => "?").join(",");
    const query = `
      SELECT favorite_food_id, food_id, 1 as is_favorite 
      FROM favorite_foods 
      WHERE user_id = ? AND food_id IN (${placeholders})
    `;
    const [result] = await pool.execute(query, [userId, ...foodIds]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(
      `Error checking batch favorites: ${err}`,
      "errLog.log"
    );
    throw new AppError("Database error while checking batch favorites", 500);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET QUERIES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const queryGetCustomFood = async (userId: string): Promise<any> => {
  try {
    const query =
      "SELECT custom_food_id, food_name, brand_name, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, cholesterol_mg, serving_size, serving_size_unit FROM custom_foods WHERE user_id = ?";
    const [result] = await pool.execute(query, [userId]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error getting custom food: ${err}`, "errLog.log");
    throw new AppError("Database error while getting custom food", 500);
  }
};

const queryGetCustomFoodById = async (foodId: string): Promise<any> => {
  try {
    const query = "SELECT * FROM custom_foods WHERE custom_food_id = ?";
    const [result] = await pool.execute(query, [foodId]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(
      `Error getting custom food by id: ${err}`,
      "errLog.log"
    );
    throw new AppError("Database error while getting custom food by id", 500);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST QUERIES - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const queryAddFavoriteFood = async (
  favoriteFoodId: string,
  foodId: string,
  userId: string,
  foodName: string,
  brandName: string | null,
  foodSource: "USDA" | "custom",
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  sugar: number,
  sodium: number,
  cholesterol: number,
  servingSize: number,
  servingUnit: string
): Promise<any> => {
  try {
    const query = `
      INSERT INTO favorite_foods (
        favorite_food_id, 
        user_id, 
        food_id, 
        food_source, 
        food_name, 
        brand_name, 
        calories, 
        protein_g, 
        carbs_g, 
        fat_g, 
        fiber_g, 
        sugar_g, 
        sodium_mg, 
        cholesterol_mg, 
        serving_size, 
        serving_size_unit
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
    const [result] = await pool.execute(query, [
      favoriteFoodId,
      userId,
      foodId,
      foodSource,
      foodName,
      brandName,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      cholesterol,
      servingSize,
      servingUnit,
    ]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error adding favorite food: ${err}`, "errLog.log");
    throw new AppError("Database error while adding favorite food", 500);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST QUERIES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const queryAddCustomFood = async (
  customFoodId: string,
  userId: string,
  foodName: string,
  brandName: string,
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  fiberG: number,
  sugarG: number,
  sodiumMg: number,
  cholesterolMg: number,
  servingSize: number,
  servingSizeUnit: "g" | "ml" | "oz"
): Promise<any> => {
  try {
    const query =
      "INSERT INTO custom_foods (custom_food_id, user_id, food_name, brand_name, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, cholesterol_mg, serving_size, serving_size_unit) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const [result] = await pool.execute(query, [
      customFoodId,
      userId,
      foodName,
      brandName,
      calories,
      proteinG,
      carbsG,
      fatG,
      fiberG,
      sugarG,
      sodiumMg,
      cholesterolMg,
      servingSize,
      servingSizeUnit,
    ]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error adding custom food: ${err}`, "errLog.log");
    throw new AppError("Database error while adding custom food", 500);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH QUERIES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const queryUpdateCustomFood = async (
  customFoodId: string,
  foodName: string,
  foodBrand: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  sugar: number,
  sodium: number,
  cholesterol: number,
  servingSize: number,
  servingSizeUnit: "g" | "ml" | "oz"
): Promise<any> => {
  try {
    const query =
      "UPDATE custom_foods SET food_name = ?, brand_name = ?, calories = ?, protein_g = ?, carbs_g = ?, fat_g = ?, fiber_g = ?, sugar_g = ?, sodium_mg = ?, cholesterol_mg = ?, serving_size = ?, serving_size_unit = ? WHERE custom_food_id = ?";
    const [result] = await pool.execute(query, [
      foodName,
      foodBrand,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      cholesterol,
      servingSize,
      servingSizeUnit,
      customFoodId,
    ]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error updating custom food: ${err}`, "errLog.log");
    throw new AppError("Database error while updating custom food", 500);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE QUERIES - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const queryDeleteFavoriteFood = async (
  favoriteFoodId: string
): Promise<any> => {
  try {
    const query = "DELETE FROM favorite_foods WHERE favorite_food_id = ?";
    const [result] = await pool.execute(query, [favoriteFoodId]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(
      `Error deleting favorite food: ${err}`,
      "errLog.log"
    );
    throw new AppError("Database error while deleting favorite food", 500);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE QUERIES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const queryDeleteCustomFood = async (customFoodId: string): Promise<any> => {
  try {
    const query = "DELETE FROM custom_foods WHERE custom_food_id = ?";
    const [result] = await pool.execute(query, [customFoodId]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error deleting custom food: ${err}`, "errLog.log");
    throw new AppError("Database error while deleting custom food", 500);
  }
};

export default {
  // Favorite Food
  queryGetFavoriteFood,
  queryGetIsFavoriteFood,
  queryGetFavoriteStatusBatch,
  queryAddFavoriteFood,
  queryDeleteFavoriteFood,
  // Custom Food
  queryGetCustomFood,
  queryGetCustomFoodById,
  queryAddCustomFood,
  queryUpdateCustomFood,
  queryDeleteCustomFood,
};
