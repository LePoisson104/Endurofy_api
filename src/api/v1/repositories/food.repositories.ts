import pool from "../../../config/db.config";

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET QUERIES - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const GetFavoriteFood = async (
  userId: string,
  connection?: any
): Promise<any> => {
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
};

const GetIsFavoriteFood = async (
  userId: string,
  foodId: string
): Promise<any> => {
  const query =
    "SELECT * FROM favorite_foods WHERE user_id = ? AND food_id = ?";
  const [result] = await pool.execute(query, [userId, foodId]);
  return result;
};

const GetFavoriteStatusBatch = async (
  userId: string,
  foodIds: string[]
): Promise<any> => {
  if (foodIds.length === 0) return [];

  const placeholders = foodIds.map(() => "?").join(",");
  const query = `
      SELECT favorite_food_id, food_id, 1 as is_favorite 
      FROM favorite_foods 
      WHERE user_id = ? AND food_id IN (${placeholders})
    `;
  const [result] = await pool.execute(query, [userId, ...foodIds]);
  return result;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET QUERIES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const GetCustomFood = async (userId: string): Promise<any> => {
  const query =
    "SELECT custom_food_id, food_name, brand_name, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, cholesterol_mg, serving_size, serving_size_unit FROM custom_foods WHERE user_id = ?";
  const [result] = await pool.execute(query, [userId]);
  return result;
};

const GetCustomFoodById = async (foodId: string): Promise<any> => {
  const query = "SELECT * FROM custom_foods WHERE custom_food_id = ?";
  const [result] = await pool.execute(query, [foodId]);
  return result;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST QUERIES - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const AddFavoriteFood = async (
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
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST QUERIES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const AddCustomFood = async (
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
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH QUERIES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const UpdateCustomFood = async (
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
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE QUERIES - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const DeleteFavoriteFood = async (favoriteFoodId: string): Promise<any> => {
  const query = "DELETE FROM favorite_foods WHERE favorite_food_id = ?";
  const [result] = await pool.execute(query, [favoriteFoodId]);
  return result;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE QUERIES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const DeleteCustomFood = async (customFoodId: string): Promise<any> => {
  const query = "DELETE FROM custom_foods WHERE custom_food_id = ?";
  const [result] = await pool.execute(query, [customFoodId]);
  return result;
};

export default {
  // Favorite Food
  GetFavoriteFood,
  GetIsFavoriteFood,
  GetFavoriteStatusBatch,
  AddFavoriteFood,
  DeleteFavoriteFood,
  // Custom Food
  GetCustomFood,
  GetCustomFoodById,
  AddCustomFood,
  UpdateCustomFood,
  DeleteCustomFood,
};
