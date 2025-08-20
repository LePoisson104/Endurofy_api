import { v4 as uuidv4 } from "uuid";
import foodRepository from "../repositories/food.repositories";
import { AppError } from "../middlewares/error.handlers";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import { BaseFood } from "../interfaces/food.interfaces";

//////////////////////////////////////////////////////////////////////////////////////////////
// @GET SERVICES - FAVORITE FOOD
//////////////////////////////////////////////////////////////////////////////////////////////
const getFavoriteFood = async (userId: string): Promise<BaseFood[]> => {
  if (!userId) {
    throw new AppError("UserId is required!", 400);
  }

  try {
    const getFavorites = await foodRepository.GetFavoriteFood(userId);

    const transformedFavorites: BaseFood[] = getFavorites.map(
      (favorite: any) => ({
        foodId: favorite.food_item_id,
        foodName: favorite.food_name,
        foodBrand: favorite.brand_name || "",
        ingredients: favorite.ingredients,
        foodSource: favorite.food_source,
        calories: favorite.calories,
        protein: favorite.protein_g,
        carbs: favorite.carbs_g,
        fat: favorite.fat_g,
        fiber: favorite.fiber_g,
        sugar: favorite.sugar_g,
        sodium: favorite.sodium_mg,
        cholesterol: favorite.cholesterol_mg,
        servingSize: favorite.serving_size,
        servingSizeUnit: favorite.serving_size_unit,
        favoriteFoodId: favorite.favorite_food_id,
        isFavorite: true,
      })
    );

    return transformedFavorites;
  } catch (error: any) {
    await Logger.logEvents(
      `Error in getFavoriteFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to get favorite food!",
      500
    );
  }
};

const getIsFavoriteFood = async (
  userId: string,
  foodId: string
): Promise<{ isFavorite: boolean; data?: any }> => {
  if (!userId || !foodId) {
    throw new AppError("UserId and foodId are required!", 400);
  }

  try {
    const isFavoriteFood = await foodRepository.GetIsFavoriteFood(
      userId,
      foodId
    );

    if (isFavoriteFood.length === 0) {
      return { isFavorite: false };
    }

    return { isFavorite: true, data: isFavoriteFood };
  } catch (error: any) {
    await Logger.logEvents(
      `Error in getIsFavoriteFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while checking if food is favorite!",
      500
    );
  }
};

const getFavoriteStatusBatch = async (
  userId: string,
  foodIds: string[]
): Promise<{
  [foodId: string]: { favoriteFoodId: string | null; isFavorite: boolean };
}> => {
  if (!userId || !foodIds || foodIds.length === 0) {
    return {};
  }

  try {
    const favoriteResults = await foodRepository.GetFavoriteStatusBatch(
      userId,
      foodIds
    );

    // Create a map of foodId -> isFavorite
    const favoriteMap: {
      [foodId: string]: {
        favoriteFoodId: string | null;
        isFavorite: boolean;
      };
    } = {};

    // Initialize all as false
    foodIds.forEach((id) => {
      favoriteMap[id] = { favoriteFoodId: null, isFavorite: false };
    });

    // Set favorites to true
    favoriteResults.forEach((fav: any) => {
      favoriteMap[fav.food_item_id] = {
        favoriteFoodId: fav.favorite_food_id,
        isFavorite: true,
      };
    });

    return favoriteMap;
  } catch (error: any) {
    await Logger.logEvents(
      `Error in getFavoriteStatusBatch service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while checking favorite status!",
      500
    );
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET SERVICES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const getCustomFood = async (userId: string): Promise<BaseFood[]> => {
  if (!userId) {
    throw new AppError("UserId is required!", 400);
  }

  const customFood = await foodRepository.GetCustomFood(userId);

  const transformedCustomFood = customFood.map((food: any) => ({
    foodId: food.food_item_id,
    foodName: food.food_name,
    foodBrand: food.brand_name,
    ingredients: food.ingredients,
    foodSource: food.source,
    calories: food.calories,
    protein: food.protein_g,
    carbs: food.carbs_g,
    fat: food.fat_g,
    fiber: food.fiber_g,
    sugar: food.sugar_g,
    sodium: food.sodium_mg,
    cholesterol: food.cholesterol_mg,
    servingSize: food.serving_size,
    servingSizeUnit: food.serving_size_unit,
    isFavorite: food.is_favorite === 0 ? false : true,
    favoriteFoodId: food.favorite_food_id,
  }));

  return transformedCustomFood;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST SERVICES - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const addFavoriteFood = async (
  userId: string,
  foodPayload: BaseFood
): Promise<{ message: string }> => {
  if (!userId || !foodPayload || Object.keys(foodPayload).length === 0) {
    throw new AppError("UserId and foodPayload are required!", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      foodId,
      foodName,
      foodBrand,
      foodSource,
      ingredients,
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
    } = foodPayload;

    // Check if food exists in food_items table
    const [foodItemResult] = await connection.execute(
      "SELECT food_item_id FROM food_items WHERE food_item_id = ?",
      [foodId]
    );

    let foodItemId;

    // If food doesn't exist, insert it into food_items table
    if (!foodItemResult || (foodItemResult as any[]).length === 0) {
      const insertFoodQuery = `
        INSERT INTO food_items (
          food_item_id, source, user_id, food_name, brand_name, ingredients,
          calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, 
          cholesterol_mg, serving_size, serving_size_unit
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `;

      await connection.execute(insertFoodQuery, [
        foodId,
        foodSource,
        userId,
        foodName,
        foodBrand,
        ingredients,
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
      ]);
    } else {
      // Use existing food_item_id
      foodItemId = (foodItemResult as any[])[0].food_item_id;
    }

    const favFoodId = uuidv4();
    await connection.execute(
      `
      INSERT INTO favorite_foods (
        favorite_food_id, 
        user_id, 
        food_item_id
      ) VALUES (?,?,?)
    `,
      [favFoodId, userId, foodItemId]
    );

    await connection.commit();
    return {
      message: "Favorite food added successfully",
    };
  } catch (error: any) {
    await connection.rollback();
    await Logger.logEvents(
      `Error in addFavoriteFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to add favorite food!",
      500
    );
  } finally {
    connection.release();
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST SERVICES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const addCustomFood = async (
  userId: string,
  foodPayload: BaseFood
): Promise<{ message: string }> => {
  if (!userId || !foodPayload || Object.keys(foodPayload).length === 0) {
    throw new AppError("UserId and foodPayload are required!", 400);
  }

  const {
    foodName,
    foodBrand,
    calories,
    ingredients,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
    cholesterol,
    servingSize,
    servingSizeUnit,
  } = foodPayload;

  const foodItemId = uuidv4();

  await foodRepository.AddCustomFood(
    foodItemId,
    "custom",
    ingredients || null,
    userId,
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
    servingSizeUnit
  );

  return {
    message: "Custom food added successfully",
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH SERVICES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const updateCustomFood = async (
  foodItemId: string,
  updatePayload: Partial<BaseFood>
): Promise<{ message: string }> => {
  if (
    !foodItemId ||
    !updatePayload ||
    Object.keys(updatePayload).length === 0
  ) {
    throw new AppError("foodItemId and updatePayload are required!", 400);
  }

  const validFields = [
    "food_name",
    "brand_name",
    "ingredients",
    "calories",
    "protein_g",
    "carbs_g",
    "fat_g",
    "fiber_g",
    "sugar_g",
    "sodium_mg",
    "cholesterol_mg",
    "serving_size",
    "serving_size_unit",
  ];

  // Map frontend field names to database field names
  const fieldMapping: { [key: string]: string } = {
    foodName: "food_name",
    foodBrand: "brand_name",
    ingredients: "ingredients",
    calories: "calories",
    protein: "protein_g",
    carbs: "carbs_g",
    fat: "fat_g",
    fiber: "fiber_g",
    sugar: "sugar_g",
    sodium: "sodium_mg",
    cholesterol: "cholesterol_mg",
    servingSize: "serving_size",
    servingSizeUnit: "serving_size_unit",
  };

  const fields = Object.keys(updatePayload)
    .map((key) => fieldMapping[key])
    .filter((field) => field && validFields.includes(field));

  if (fields.length === 0) {
    throw new AppError("No valid fields to update!", 400);
  }

  const setClause = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => {
    const frontendKey = Object.keys(fieldMapping).find(
      (key) => fieldMapping[key] === f
    );
    return updatePayload[frontendKey as keyof BaseFood];
  });

  await foodRepository.UpdateCustomFood(foodItemId, setClause, values);

  return { message: "Custom food updated successfully" };
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE SERVICES - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const deleteFavoriteFood = async (
  favFoodId: string
): Promise<{ message: string }> => {
  if (!favFoodId) {
    throw new AppError("FavFoodId is required!", 400);
  }

  const deletedFavoriteFood = await foodRepository.DeleteFavoriteFood(
    favFoodId
  );

  if (deletedFavoriteFood.affectedRows === 0) {
    throw new AppError("Favorite food not found!", 404);
  }

  return { message: "Favorite food deleted successfully" };
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE SERVICES - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////
const deleteCustomFood = async (
  foodItemId: string
): Promise<{ message: string }> => {
  if (!foodItemId) {
    throw new AppError("foodItemId is required!", 400);
  }

  const deletedCustomFood = await foodRepository.DeleteCustomFood(foodItemId);

  if (deletedCustomFood.affectedRows === 0) {
    throw new AppError("Custom food not found!", 404);
  }

  return { message: "Custom food deleted successfully" };
};

export default {
  // Favorite Food
  getFavoriteFood,
  getIsFavoriteFood,
  getFavoriteStatusBatch,
  addFavoriteFood,
  deleteFavoriteFood,
  // Custom Food
  getCustomFood,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
};
