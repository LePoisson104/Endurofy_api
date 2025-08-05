import { v4 as uuidv4 } from "uuid";
import foodLogRepository from "../repositories/food-log.repositories";
import { AppError } from "../middlewares/error.handlers";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import {
  AddFoodPayload,
  UpdateFoodPayload,
} from "../interfaces/food-log.interfaces";

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET SERVICES
////////////////////////////////////////////////////////////////////////////////////////////////
const getFoodLogByDate = async (userId: string, date: string): Promise<any> => {
  if (!userId || !date) {
    throw new AppError("UserId and date are required!", 400);
  }

  try {
    const foodLogData = await foodLogRepository.queryGetFoodLogByDate(
      userId,
      date
    );

    const groupedFoods: Record<string, any[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
      uncategorized: [],
    };

    // Group foods by meal_type
    foodLogData.foods.forEach((food: any) => {
      const mealType = food.meal_type;
      if (groupedFoods[mealType]) {
        groupedFoods[mealType].push(food);
      } else {
        groupedFoods.uncategorized.push(food);
      }
    });

    return {
      food_log_id: foodLogData.food_log_id,
      log_date: foodLogData.log_date,
      status: foodLogData.status,
      foods: groupedFoods,
    };
  } catch (error: any) {
    await Logger.logEvents(
      `Error in getAllFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError(
      "Something went wrong while trying to get all food logs!",
      500
    );
  }
};

const getLoggedDates = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<any[]> => {
  if (!userId || !startDate || !endDate) {
    throw new AppError("userId, startDate, and endDate are required!", 400);
  }

  const logDates = await foodLogRepository.queryGetLoggedDates(
    userId,
    startDate,
    endDate
  );

  return logDates;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST SERVICES
////////////////////////////////////////////////////////////////////////////////////////////////
const addFood = async (
  userId: string,
  foodPayload: AddFoodPayload
): Promise<{
  data: {
    message: string;
  };
}> => {
  if (!userId || !foodPayload || Object.keys(foodPayload).length === 0) {
    throw new AppError("UserId and foodPayload are required!", 400);
  }

  const connection = await pool.getConnection();

  const {
    foodSourceId,
    foodName,
    foodBrand,
    foodSource,
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
    mealType,
    loggedAt,
  } = foodPayload;

  try {
    await connection.beginTransaction();

    const [foodLog]: any = await connection.execute(
      "SELECT food_log_id, status, log_date FROM food_logs WHERE user_id = ? AND log_date = ?",
      [userId, loggedAt.split("T")[0]]
    );

    let foodLogId;
    if (foodLog.length === 0) {
      foodLogId = uuidv4();
      await connection.execute(
        "INSERT INTO food_logs (food_log_id, user_id, status, log_date) VALUES (?, ?, ?, ?)",
        [foodLogId, userId, "incomplete", loggedAt.split("T")[0]]
      );
    }

    const foodId = uuidv4();

    if (foodLog.length !== 0) foodLogId = foodLog[0].food_log_id;

    await connection.execute(
      "INSERT INTO foods (food_id, food_log_id, food_source_id, food_name, brand_name, food_source, meal_type, serving_size, serving_size_unit, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, cholesterol_mg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        foodId,
        foodLogId,
        foodSourceId,
        foodName,
        foodBrand,
        foodSource,
        mealType,
        servingSize,
        servingUnit,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
        cholesterol,
      ]
    );

    await connection.commit();

    return {
      data: {
        message: "Food added successfully",
      },
    };
  } catch (error: any) {
    await connection.rollback();
    await Logger.logEvents(
      `Error in addFood service: ${error.message}`,
      "errLog.log"
    );
    throw new AppError("Something went wrong while trying to add food!", 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH SERVICES
////////////////////////////////////////////////////////////////////////////////////////////////
const updateFood = async (
  foodId: string,
  updatePayload: UpdateFoodPayload
): Promise<any> => {
  if (!foodId || !updatePayload || Object.keys(updatePayload).length === 0) {
    throw new AppError("food log id and update payload are required!", 400);
  }

  const { serving_size, serving_size_unit } = updatePayload;

  if (!serving_size || !serving_size_unit) {
    throw new AppError(
      "Make sure variable names are spelled correctly (serving_size, serving_size_unit)",
      400
    );
  }

  const updatedFood = await foodLogRepository.queryUpdateFood(
    foodId,
    serving_size,
    serving_size_unit
  );

  if (updatedFood.affectedRows === 0) {
    throw new AppError("Food log not found!", 404);
  }

  return updatedFood;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE SERVICES
////////////////////////////////////////////////////////////////////////////////////////////////
const deleteFood = async (foodId: string, foodLogId: string): Promise<any> => {
  if (!foodId) {
    throw new AppError("foodId is required!", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [deletedFood]: any = await connection.execute(
      "DELETE FROM foods WHERE food_id = ?",
      [foodId]
    );

    if (deletedFood.affectedRows === 0) {
      throw new AppError("Food not found!", 404);
    }

    const [foodLog]: any = await connection.execute(
      "SELECT COUNT(*) as count FROM foods WHERE food_log_id = ?",
      [foodLogId]
    );

    const [waterLog]: any = await connection.execute(
      "SELECT COUNT(*) as count FROM water_logs WHERE food_log_id = ?",
      [foodLogId]
    );

    if (foodLog[0].count === 0 && waterLog[0].count === 0) {
      await connection.execute("DELETE FROM food_logs WHERE food_log_id = ?", [
        foodLogId,
      ]);
    }

    await connection.commit();
  } catch (error: any) {
    await connection.rollback();
    await Logger.logEvents(
      `Error in deleteFood service: ${error.message}`,
      "errLog.log"
    );
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Something went wrong while trying to delete food!",
      500
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
  return {
    data: {
      message: "Food deleted successfully",
    },
  };
};

export default {
  getFoodLogByDate,
  getLoggedDates,
  addFood,
  updateFood,
  deleteFood,
};
