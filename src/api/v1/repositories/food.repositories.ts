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
        ff.favorite_food_id,
        ff.food_item_id,
        fi.food_name,
        fi.brand_name,
        fi.source as food_source,
        fi.calories,
        fi.protein_g,
        fi.carbs_g,
        fi.fat_g,
        fi.fiber_g,
        fi.sugar_g,
        fi.sodium_mg,
        fi.cholesterol_mg,
        fi.serving_size,
        fi.serving_size_unit
      FROM favorite_foods ff
      JOIN food_items fi ON ff.food_item_id = fi.food_item_id
      WHERE ff.user_id = ?
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
    "SELECT * FROM favorite_foods WHERE user_id = ? AND food_item_id = ?";
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
      SELECT favorite_food_id, food_item_id, 1 as is_favorite 
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
  const query = `
    SELECT 
      fi.*,
      CASE 
        WHEN ff.favorite_food_id IS NOT NULL THEN true 
        ELSE false 
      END as is_favorite,
      ff.favorite_food_id
    FROM food_items fi
    LEFT JOIN favorite_foods ff ON fi.food_item_id = ff.food_item_id AND ff.user_id = ?
    WHERE fi.user_id = ? AND fi.source = 'custom'
  `;
  const [result] = await pool.execute(query, [userId, userId]);
  return result;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST QUERIES - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const AddFavoriteFood = async (
  favoriteFoodId: string,
  userId: string,
  foodItemId: string
): Promise<any> => {
  const query = `
      INSERT INTO favorite_foods (
        favorite_food_id, 
        user_id, 
        food_item_id
      ) VALUES (?,?,?)
    `;
  const [result] = await pool.execute(query, [
    favoriteFoodId,
    userId,
    foodItemId,
  ]);
  return result;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST QUERIES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const AddCustomFood = async (
  foodItemId: string,
  source: "usda" | "custom",
  ingredients: string | null,
  externalId: string | null,
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
    "INSERT INTO food_items (food_item_id, source, external_id, user_id, food_name, brand_name, ingredients, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, cholesterol_mg, serving_size, serving_size_unit) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  const [result] = await pool.execute(query, [
    foodItemId,
    source,
    externalId,
    userId,
    foodName,
    brandName,
    ingredients,
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
  foodItemId: string,
  setClause: string,
  values: any[]
): Promise<any> => {
  const query = `UPDATE food_items SET ${setClause} WHERE food_item_id = ?`;
  const [result] = await pool.execute(query, [...values, foodItemId]);
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
const DeleteCustomFood = async (foodItemId: string): Promise<any> => {
  const query = "DELETE FROM food_items WHERE food_item_id = ?";
  const [result] = await pool.execute(query, [foodItemId]);
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
  AddCustomFood,
  UpdateCustomFood,
  DeleteCustomFood,
};
