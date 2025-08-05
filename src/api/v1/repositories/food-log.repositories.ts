import pool from "../../../config/db.config";
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
    const query1 = `SELECT food_log_id, log_date, status FROM food_logs WHERE user_id = ? AND log_date = ? LIMIT 1`;
    const query2 = `SELECT * FROM foods WHERE food_log_id = ?`;

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

const queryGetLoggedDates = async (
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
const queryUpdateFood = async (
  foodId: string,
  servingSize: number,
  servingSizeUnit: "g" | "ml" | "oz"
): Promise<any> => {
  try {
    const query =
      "UPDATE foods SET serving_size = ?, serving_size_unit = ? WHERE food_id = ?";
    const [result] = await pool.execute(query, [
      servingSize,
      servingSizeUnit,
      foodId,
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
const queryDeleteFood = async (foodId: string): Promise<any> => {
  try {
    const query = "DELETE FROM foods WHERE food_id = ?";
    const [result] = await pool.execute(query, [foodId]);
    return result;
  } catch (err: any) {
    await Logger.logEvents(`Error deleting food: ${err}`, "errLog.log");
    throw new AppError("Database error while deleting food", 500);
  }
};

export default {
  queryGetFoodLogByDate,
  queryGetLoggedDates,
  queryUpdateFood,
  queryDeleteFood,
};
