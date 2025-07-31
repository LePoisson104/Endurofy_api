import pool from "../../../config/db.config";
import { UpdateFoodPayload } from "../interfaces/food-log.interfaces";
import { AppError } from "../middlewares/error.handlers";
import Logger from "../utils/logger";

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET QUERIES
////////////////////////////////////////////////////////////////////////////////////////////////
const queryGetFoodLogByDate = async (
  userId: string,
  date: string,
  connection?: any
): Promise<any> => {
  try {
    const query = `SELECT * FROM food_logs WHERE user_id = ? AND log_date = ?`;
    if (connection) {
      const [result] = await connection.execute(query, [userId, date]);
      return result as any[];
    } else {
      const [result] = await pool.execute(query, [userId, date]);
      return result as any[];
    }
  } catch (err: any) {
    await Logger.logEvents(`Error getting all food: ${err}`, "errLog.log");
    throw new AppError("Database error while getting all food", 500);
  }
};

const queryGetLoggedDates = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  try {
    const query =
      "SELECT DISTINCT log_date FROM (SELECT log_date FROM food_logs WHERE user_id = ? AND log_date BETWEEN ? AND ? UNION SELECT log_date FROM water_logs WHERE user_id = ? AND log_date BETWEEN ? AND ?) AS combined_logs ORDER BY log_date";
    const [result] = await pool.execute(query, [
      userId,
      startDate,
      endDate,
      userId,
      startDate,
      endDate,
    ]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error getting log dates: ${err}`, "errLog.log");
    throw new AppError("Database error while getting log dates", 500);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST QUERIES
////////////////////////////////////////////////////////////////////////////////////////////////
const queryAddFood = async (
  foodLogId: string,
  userId: string,
  foodId: string,
  foodName: string,
  brandName: string,
  foodSource: "USDA" | "custom",
  mealType: "breakfast" | "lunch" | "dinner" | "snacks" | "uncategorized",
  servingSize: number,
  servingSizeUnit: "g" | "ml" | "oz",
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  sugar: number,
  sodium: number,
  cholesterol: number,
  loggedAt: string
): Promise<any> => {
  try {
    const query =
      "INSERT INTO food_logs (food_log_id, user_id, food_id, food_name, brand_name, food_source, meal_type, serving_size, serving_size_unit, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, cholesterol_mg, log_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const [result] = await pool.execute(query, [
      foodLogId,
      userId,
      foodId,
      foodName,
      brandName,
      foodSource,
      mealType,
      servingSize,
      servingSizeUnit,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      cholesterol,
      loggedAt,
    ]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error adding food: ${err}`, "errLog.log");
    throw new AppError("Database error while adding food", 500);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH QUERIES
////////////////////////////////////////////////////////////////////////////////////////////////
const queryUpdateFood = async (
  foodLogId: string,
  servingSize: number,
  servingSizeUnit: "g" | "ml" | "oz"
): Promise<any> => {
  try {
    const query =
      "UPDATE food_logs SET serving_size = ?, serving_size_unit = ? WHERE food_log_id = ?";
    const [result] = await pool.execute(query, [
      servingSize,
      servingSizeUnit,
      foodLogId,
    ]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error updating food: ${err}`, "errLog.log");
    throw new AppError("Database error while updating food", 500);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE QUERIES
////////////////////////////////////////////////////////////////////////////////////////////////
const queryDeleteFood = async (foodLogId: string): Promise<any> => {
  try {
    const query = "DELETE FROM food_logs WHERE food_log_id = ?";
    const [result] = await pool.execute(query, [foodLogId]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error deleting food: ${err}`, "errLog.log");
    throw new AppError("Database error while deleting food", 500);
  }
};

export default {
  queryGetFoodLogByDate,
  queryGetLoggedDates,
  queryAddFood,
  queryUpdateFood,
  queryDeleteFood,
};
