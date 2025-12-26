import pool from "../../../config/db.config";
import { FoodLogResponse } from "../interfaces/food-log.interfaces";

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET QUERIES
////////////////////////////////////////////////////////////////////////////////////////////////
const FindFoodLogById = async (
  userId: string,
  foodLogId: string,
  connection?: any
): Promise<any> => {
  const query = "SELECT * FROM food_logs WHERE food_log_id = ? AND user_id = ?";
  if (connection) {
    const [result] = await connection.execute(query, [foodLogId, userId]);
    return result;
  } else {
    const [result] = await pool.execute(query, [foodLogId, userId]);
    return result;
  }
};

const GetFoodLogByDate = async (
  userId: string,
  date: string,
  connection?: any
): Promise<FoodLogResponse> => {
  const query1 = `SELECT food_log_id, log_date, status FROM food_logs WHERE user_id = ? AND log_date = ? LIMIT 1`;
  const query2 = `
      SELECT
        lf.food_id AS foodId,
        lf.food_log_id AS foodLogId,
        lf.food_item_id AS foodItemId,
        lf.meal_type AS mealType,
        lf.serving_size AS loggedServingSize,
        lf.serving_size_unit AS loggedServingSizeUnit,
        fi.food_name AS foodName,
        fi.brand_name AS brandName,
        fi.ingredients,
        fi.source,
        fi.calories,
        fi.protein_g AS protein,
        fi.carbs_g AS carbs,
        fi.fat_g AS fat,
        fi.fiber_g AS fiber,
        fi.sugar_g AS sugar,
        fi.sodium_mg AS sodium,
        fi.cholesterol_mg AS cholesterol,
        fi.serving_size AS baseServingSize,
        fi.serving_size_unit AS baseServingSizeUnit
      FROM logged_foods lf
      JOIN food_items fi ON lf.food_item_id = fi.food_item_id
      WHERE lf.food_log_id = ?`;

  const dbConnection = connection || pool;

  const [foodLogResult] = await dbConnection.execute(query1, [userId, date]);
  const foodLogData = (foodLogResult as any[])[0];

  if (!foodLogData) {
    return {
      food_log_id: null,
      log_date: date,
      status: null,
      foods: [],
    };
  }

  const [foodsResult] = await dbConnection.execute(query2, [
    foodLogData.food_log_id,
  ]);

  return {
    food_log_id: foodLogData.food_log_id,
    log_date: foodLogData.log_date,
    status: foodLogData.status,
    foods: foodsResult as any[],
  };
};

const GetLoggedDates = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  const query =
    "SELECT DISTINCT log_date, status FROM food_logs WHERE user_id = ? AND log_date BETWEEN ? AND ?";
  const [result] = await pool.execute(query, [userId, startDate, endDate]);
  return result;
};

const GetRecentUniqueFoodItems = async (userId: string): Promise<any> => {
  const query = `
    SELECT DISTINCT
      fi.food_item_id,
      fi.food_name,
      fi.brand_name,
      fi.ingredients,
      fi.source,
      fi.calories,
      fi.protein_g,
      fi.carbs_g,
      fi.fat_g,
      fi.fiber_g,
      fi.sugar_g,
      fi.sodium_mg,
      fi.cholesterol_mg,
      fi.serving_size,
      fi.serving_size_unit,
      MAX(fl.log_date) as last_logged_date
    FROM logged_foods lf
    JOIN food_logs fl ON lf.food_log_id = fl.food_log_id
    JOIN food_items fi ON lf.food_item_id = fi.food_item_id
    WHERE fl.user_id = ?
    GROUP BY fi.food_item_id
    ORDER BY last_logged_date DESC
    LIMIT 10
  `;
  const [result] = await pool.execute(query, [userId]);
  return result;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH QUERIES
////////////////////////////////////////////////////////////////////////////////////////////////
const UpdateFood = async (
  foodId: string,
  setClause: string,
  values: any[]
): Promise<any> => {
  const query = `UPDATE logged_foods SET ${setClause} WHERE food_id = ?`;
  const [result] = await pool.execute(query, [...values, foodId]);
  return result;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE QUERIES
////////////////////////////////////////////////////////////////////////////////////////////////
const DeleteFood = async (foodId: string): Promise<any> => {
  const query = "DELETE FROM logged_foods WHERE food_id = ?";
  const [result] = await pool.execute(query, [foodId]);
  return result;
};

const DeleteFoodLog = async (
  userId: string,
  foodLogId: string
): Promise<any> => {
  const query = "DELETE FROM food_logs WHERE food_log_id = ? AND user_id = ?";
  const [result] = await pool.execute(query, [foodLogId, userId]);
  return result;
};

export default {
  FindFoodLogById,
  GetFoodLogByDate,
  GetLoggedDates,
  GetRecentUniqueFoodItems,
  UpdateFood,
  DeleteFood,
  DeleteFoodLog,
};
