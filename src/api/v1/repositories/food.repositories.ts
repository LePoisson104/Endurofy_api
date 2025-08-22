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
        fi.ingredients,
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
      JOIN food_items fi ON ff.food_item_id = fi.food_item_id AND fi.is_deleted = FALSE
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
      WHERE user_id = ? AND food_item_id IN (${placeholders})
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
    ff.favorite_food_id,
    (ff.favorite_food_id IS NOT NULL) AS is_favorite
  FROM food_items fi
  LEFT JOIN favorite_foods ff
    ON ff.food_item_id = fi.food_item_id 
    AND ff.user_id = ?
  WHERE fi.user_id = ?
    AND fi.source = 'custom'
    AND fi.is_deleted = FALSE
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
  userId: string,
  foodName: string,
  brandName: string | null,
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
    "INSERT INTO food_items (food_item_id, source, user_id, food_name, brand_name, ingredients, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, cholesterol_mg, serving_size, serving_size_unit) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  const [result] = await pool.execute(query, [
    foodItemId,
    source,
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

const DeleteCustomFoodSafe = async (
  userId: string,
  foodItemId: string
): Promise<{ deleted: boolean; soft_deleted: boolean }> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // First check if there are any logged foods with this food_item_id
    const checkLoggedFoodsQuery = `
      SELECT COUNT(*) as count 
      FROM logged_foods lf
      JOIN food_logs fl ON lf.food_log_id = fl.food_log_id
      WHERE lf.food_item_id = ? AND fl.user_id = ?
    `;

    const [loggedFoodsResult] = await connection.execute(
      checkLoggedFoodsQuery,
      [foodItemId, userId]
    );
    const loggedFoodsCount = (loggedFoodsResult as any[])[0].count;

    // Remove from favorite_foods table if it exists (for both soft and hard delete)
    const deleteFavoriteQuery =
      "DELETE FROM favorite_foods WHERE food_item_id = ? AND user_id = ?";
    await connection.execute(deleteFavoriteQuery, [foodItemId, userId]);

    let result;
    if (loggedFoodsCount > 0) {
      // If there are logged foods, soft delete (mark as deleted)
      const softDeleteQuery =
        "UPDATE food_items SET is_deleted = TRUE WHERE food_item_id = ? AND user_id = ?";
      await connection.execute(softDeleteQuery, [foodItemId, userId]);
      result = { deleted: true, soft_deleted: true };
    } else {
      // If no logged foods, hard delete the food item
      const hardDeleteQuery =
        "DELETE FROM food_items WHERE food_item_id = ? AND user_id = ?";
      await connection.execute(hardDeleteQuery, [foodItemId, userId]);
      result = { deleted: true, soft_deleted: false };
    }

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
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
  DeleteCustomFoodSafe,
};
