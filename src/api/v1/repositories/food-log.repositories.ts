import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET QUERIES
////////////////////////////////////////////////////////////////////////////////////////////////
const GetFoodLogByDate = async (
  userId: string,
  date: string,
  connection?: any
): Promise<any> => {
  try {
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
        fi.external_id AS foodSourceId,
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

    // Get the food log metadata (food_log_id, log_date, status)
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

    // Get all foods for this food_log_id
    const [foodsResult] = await dbConnection.execute(query2, [
      foodLogData.food_log_id,
    ]);

    return {
      food_log_id: foodLogData.food_log_id,
      log_date: foodLogData.log_date,
      status: foodLogData.status,
      foods: foodsResult as any[],
    };
  } catch (err: any) {
    await Logger.logEvents(
      `Error getting food log by date: ${err}`,
      "errLog.log"
    );
    throw new AppError("Database error while getting food log by date", 500);
  }
};

const GetLoggedDates = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  try {
    const query =
      "SELECT DISTINCT log_date, status FROM food_logs WHERE user_id = ? AND log_date BETWEEN ? AND ?";
    const [result] = await pool.execute(query, [userId, startDate, endDate]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error getting log dates: ${err}`, "errLog.log");
    throw new AppError("Database error while getting log dates", 500);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH QUERIES
////////////////////////////////////////////////////////////////////////////////////////////////
const UpdateFood = async (
  foodId: string,
  setClause: string,
  values: any[]
): Promise<any> => {
  try {
    const query = `UPDATE logged_foods SET ${setClause} WHERE food_id = ?`;
    const [result] = await pool.execute(query, [...values, foodId]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error updating food: ${err}`, "errLog.log");
    throw new AppError("Database error while updating food", 500);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE QUERIES
////////////////////////////////////////////////////////////////////////////////////////////////
const DeleteFood = async (foodId: string): Promise<any> => {
  try {
    const query = "DELETE FROM logged_foods WHERE food_id = ?";
    const [result] = await pool.execute(query, [foodId]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error deleting food: ${err}`, "errLog.log");
    throw new AppError("Database error while deleting food", 500);
  }
};

export default {
  GetFoodLogByDate,
  GetLoggedDates,
  UpdateFood,
  DeleteFood,
};
