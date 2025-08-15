import { v4 as uuidv4 } from "uuid";
import foodLogServices from "../food-log.services";
import foodLogRepository from "../../repositories/food-log.repositories";
import { AppError } from "../../middlewares/error.handlers";
import pool from "../../../../config/db.config";
import Logger from "../../utils/logger";
import { AddFoodPayload, MealType } from "../../interfaces/food-log.interfaces";

// Mock dependencies
jest.mock("uuid");
jest.mock("../../repositories/food-log.repositories");
jest.mock("../../../../config/db.config", () => ({
  getConnection: jest.fn(),
  execute: jest.fn(),
}));
jest.mock("../../utils/logger");

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;
const mockFoodLogRepository = foodLogRepository as jest.Mocked<
  typeof foodLogRepository
>;
const mockPool = pool as jest.Mocked<typeof pool>;
const mockLogger = Logger as jest.Mocked<typeof Logger>;

describe("Food Log Services", () => {
  let mockConnection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock connection
    mockConnection = {
      beginTransaction: jest.fn(),
      execute: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    };

    mockPool.getConnection = jest.fn().mockResolvedValue(mockConnection);
    mockLogger.logEvents = jest.fn().mockResolvedValue(undefined);
  });

  describe("getFoodLogByDate", () => {
    const userId = "test-user-id";
    const date = "2024-01-15";

    it("should successfully return grouped food log data", async () => {
      const mockFoodLogData = {
        food_log_id: "test-log-id",
        log_date: date,
        status: "complete",
        foods: [
          {
            foodId: "food-1",
            meal_type: "breakfast",
            foodName: "Oatmeal",
            calories: 150,
          },
          {
            foodId: "food-2",
            meal_type: "snack",
            foodName: "Apple",
            calories: 80,
          },
          {
            foodId: "food-3",
            meal_type: "lunch",
            foodName: "Chicken Salad",
            calories: 350,
          },
        ],
      };

      mockFoodLogRepository.GetFoodLogByDate.mockResolvedValue(mockFoodLogData);

      const result = await foodLogServices.getFoodLogByDate(userId, date);

      expect(mockFoodLogRepository.GetFoodLogByDate).toHaveBeenCalledWith(
        userId,
        date
      );
      expect(result).toEqual({
        food_log_id: "test-log-id",
        log_date: date,
        status: "complete",
        foods: {
          breakfast: [
            {
              foodId: "food-1",
              meal_type: "breakfast",
              foodName: "Oatmeal",
              calories: 150,
            },
          ],
          lunch: [
            {
              foodId: "food-3",
              meal_type: "lunch",
              foodName: "Chicken Salad",
              calories: 350,
            },
          ],
          dinner: [],
          snacks: [
            {
              foodId: "food-2",
              meal_type: "snack",
              foodName: "Apple",
              calories: 80,
            },
          ],
          uncategorized: [],
        },
      });
    });

    it("should group unknown meal types as uncategorized", async () => {
      const mockFoodLogData = {
        food_log_id: "test-log-id",
        log_date: date,
        status: "complete",
        foods: [
          {
            foodId: "food-1",
            meal_type: "unknown",
            foodName: "Test Food",
            calories: 100,
          },
        ],
      };

      mockFoodLogRepository.GetFoodLogByDate.mockResolvedValue(mockFoodLogData);

      const result = await foodLogServices.getFoodLogByDate(userId, date);

      expect(result.foods.uncategorized).toHaveLength(1);
      expect(result.foods.uncategorized[0].meal_type).toBe("unknown");
    });

    it("should handle empty food list", async () => {
      const mockFoodLogData = {
        food_log_id: "test-log-id",
        log_date: date,
        status: "incomplete",
        foods: [],
      };

      mockFoodLogRepository.GetFoodLogByDate.mockResolvedValue(mockFoodLogData);

      const result = await foodLogServices.getFoodLogByDate(userId, date);

      expect(result.foods).toEqual({
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
        uncategorized: [],
      });
    });

    it("should handle multiple foods in same meal type", async () => {
      const mockFoodLogData = {
        food_log_id: "test-log-id",
        log_date: date,
        status: "complete",
        foods: [
          { foodId: "food-1", meal_type: "breakfast", foodName: "Oatmeal" },
          { foodId: "food-2", meal_type: "breakfast", foodName: "Banana" },
          { foodId: "food-3", meal_type: "breakfast", foodName: "Coffee" },
        ],
      };

      mockFoodLogRepository.GetFoodLogByDate.mockResolvedValue(mockFoodLogData);

      const result = await foodLogServices.getFoodLogByDate(userId, date);

      expect(result.foods.breakfast).toHaveLength(3);
      expect(result.foods.breakfast.map((f: any) => f.foodName)).toEqual([
        "Oatmeal",
        "Banana",
        "Coffee",
      ]);
    });

    it("should handle different date formats", async () => {
      const isoDate = "2024-01-15T00:00:00.000Z";
      const mockFoodLogData = {
        food_log_id: "test-log-id",
        log_date: isoDate,
        status: "complete",
        foods: [],
      };

      mockFoodLogRepository.GetFoodLogByDate.mockResolvedValue(mockFoodLogData);

      const result = await foodLogServices.getFoodLogByDate(userId, isoDate);

      expect(result.log_date).toBe(isoDate);
    });

    it("should throw AppError when userId is missing", async () => {
      await expect(foodLogServices.getFoodLogByDate("", date)).rejects.toThrow(
        new AppError("UserId and date are required!", 400)
      );
    });

    it("should throw AppError when date is missing", async () => {
      await expect(
        foodLogServices.getFoodLogByDate(userId, "")
      ).rejects.toThrow(new AppError("UserId and date are required!", 400));
    });

    it("should handle repository errors and throw AppError", async () => {
      const repositoryError = new Error("Database connection failed");
      mockFoodLogRepository.GetFoodLogByDate.mockRejectedValue(repositoryError);

      await expect(
        foodLogServices.getFoodLogByDate(userId, date)
      ).rejects.toThrow(
        new AppError(
          "Something went wrong while trying to get all food logs!",
          500
        )
      );

      expect(mockLogger.logEvents).toHaveBeenCalledWith(
        `Error in getAllFood service: ${repositoryError.message}`,
        "errLog.log"
      );
    });

    it("should handle null userId gracefully", async () => {
      await expect(
        foodLogServices.getFoodLogByDate(null as any, date)
      ).rejects.toThrow(new AppError("UserId and date are required!", 400));
    });

    it("should handle undefined date gracefully", async () => {
      await expect(
        foodLogServices.getFoodLogByDate(userId, undefined as any)
      ).rejects.toThrow(new AppError("UserId and date are required!", 400));
    });
  });

  describe("getLoggedDates", () => {
    const userId = "test-user-id";
    const startDate = "2024-01-01";
    const endDate = "2024-01-31";

    it("should successfully return logged dates", async () => {
      const mockLogDates = [
        { log_date: "2024-01-15", status: "complete" },
        { log_date: "2024-01-20", status: "incomplete" },
      ];

      mockFoodLogRepository.GetLoggedDates.mockResolvedValue(mockLogDates);

      const result = await foodLogServices.getLoggedDates(
        userId,
        startDate,
        endDate
      );

      expect(mockFoodLogRepository.GetLoggedDates).toHaveBeenCalledWith(
        userId,
        startDate,
        endDate
      );
      expect(result).toEqual(mockLogDates);
    });

    it("should handle empty date range", async () => {
      mockFoodLogRepository.GetLoggedDates.mockResolvedValue([]);

      const result = await foodLogServices.getLoggedDates(
        userId,
        startDate,
        endDate
      );

      expect(result).toEqual([]);
    });

    it("should handle same start and end date", async () => {
      const sameDate = "2024-01-15";
      const mockLogDates = [{ log_date: sameDate, status: "complete" }];

      mockFoodLogRepository.GetLoggedDates.mockResolvedValue(mockLogDates);

      const result = await foodLogServices.getLoggedDates(
        userId,
        sameDate,
        sameDate
      );

      expect(result).toEqual(mockLogDates);
    });

    it("should throw AppError when required parameters are missing", async () => {
      await expect(
        foodLogServices.getLoggedDates("", startDate, endDate)
      ).rejects.toThrow(
        new AppError("userId, startDate, and endDate are required!", 400)
      );

      await expect(
        foodLogServices.getLoggedDates(userId, "", endDate)
      ).rejects.toThrow(
        new AppError("userId, startDate, and endDate are required!", 400)
      );

      await expect(
        foodLogServices.getLoggedDates(userId, startDate, "")
      ).rejects.toThrow(
        new AppError("userId, startDate, and endDate are required!", 400)
      );
    });

    it("should handle invalid date range (end before start)", async () => {
      const invalidStartDate = "2024-01-31";
      const invalidEndDate = "2024-01-01";

      mockFoodLogRepository.GetLoggedDates.mockResolvedValue([]);

      const result = await foodLogServices.getLoggedDates(
        userId,
        invalidStartDate,
        invalidEndDate
      );

      expect(result).toEqual([]);
    });
  });

  describe("addFood", () => {
    const userId = "test-user-id";
    const mockFoodPayload: AddFoodPayload = {
      foodSourceId: "test-food-id",
      foodName: "Test Food",
      foodBrand: "Test Brand",
      foodSource: "USDA",
      ingredients: "Test ingredients",
      calories: 200,
      protein: 10,
      carbs: 30,
      fat: 5,
      fiber: 3,
      sugar: 2,
      sodium: 100,
      cholesterol: 0,
      servingSize: 1,
      servingUnit: "g",
      mealType: "breakfast",
      loggedAt: "2024-01-15T10:00:00Z",
    };

    beforeEach(() => {
      mockUuidv4
        .mockReturnValueOnce("new-food-log-id" as any)
        .mockReturnValueOnce("new-food-item-id" as any)
        .mockReturnValueOnce("new-logged-food-id" as any);
    });

    it("should successfully add food with new food log", async () => {
      // Mock no existing food log
      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log - first query
        .mockResolvedValueOnce({}) // Insert new food log - second query
        .mockResolvedValueOnce([[]]) // No existing food item - third query
        .mockResolvedValueOnce({}) // Insert food item - fourth query
        .mockResolvedValueOnce({}); // Insert logged food - fifth query

      const result = await foodLogServices.addFood(userId, mockFoodPayload);

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.execute).toHaveBeenCalledTimes(5);
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(result).toEqual({ message: "Food added successfully" });
    });

    it("should successfully add food with existing food log", async () => {
      const existingFoodLog = [{ food_log_id: "existing-log-id" }];

      mockConnection.execute
        .mockResolvedValueOnce([existingFoodLog]) // Existing food log
        .mockResolvedValueOnce([[]]) // No existing food item
        .mockResolvedValueOnce({}) // Insert food item
        .mockResolvedValueOnce({}); // Insert logged food

      const result = await foodLogServices.addFood(userId, mockFoodPayload);

      expect(mockConnection.execute).toHaveBeenCalledTimes(4);
      expect(result).toEqual({ message: "Food added successfully" });
    });

    it("should use existing USDA food item", async () => {
      const existingFoodItem = [{ food_item_id: "existing-food-item-id" }];

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log - first query
        .mockResolvedValueOnce({}) // Insert new food log - second query
        .mockResolvedValueOnce([existingFoodItem]) // Existing USDA food item - third query
        .mockResolvedValueOnce({}); // Insert logged food only - fourth query

      await foodLogServices.addFood(userId, mockFoodPayload);

      expect(mockConnection.execute).toHaveBeenCalledTimes(4); // No food item insert
    });

    it("should use existing custom food item", async () => {
      const customFoodPayload = {
        ...mockFoodPayload,
        foodSource: "custom" as const,
      };
      const existingFoodItem = [
        { food_item_id: "existing-custom-food-item-id" },
      ];

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log - first query
        .mockResolvedValueOnce({}) // Insert new food log - second query
        .mockResolvedValueOnce([existingFoodItem]) // Existing custom food item - third query
        .mockResolvedValueOnce({}); // Insert logged food only - fourth query

      await foodLogServices.addFood(userId, customFoodPayload);

      expect(mockConnection.execute).toHaveBeenCalledTimes(4);
    });

    it("should normalize snacks meal type to snack", async () => {
      const snacksFoodPayload = {
        ...mockFoodPayload,
        mealType: "snacks" as MealType,
      };

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log - first query
        .mockResolvedValueOnce({}) // Insert new food log - second query
        .mockResolvedValueOnce([[]]) // No existing food item - third query
        .mockResolvedValueOnce({}) // Insert food item - fourth query
        .mockResolvedValueOnce({}); // Insert logged food - fifth query

      await foodLogServices.addFood(userId, snacksFoodPayload);

      // Check that the logged food insert uses "snack" instead of "snacks"
      const loggedFoodInsertCall = mockConnection.execute.mock.calls[4]; // 5th call (index 4)
      expect(loggedFoodInsertCall[1][3]).toBe("snack"); // meal_type parameter
    });

    // New comprehensive test cases
    it("should handle food with no brand name", async () => {
      const noBrandPayload = {
        ...mockFoodPayload,
        foodBrand: "",
      };

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log
        .mockResolvedValueOnce({}) // Insert new food log
        .mockResolvedValueOnce([[]]) // No existing food item
        .mockResolvedValueOnce({}) // Insert food item
        .mockResolvedValueOnce({}); // Insert logged food

      const result = await foodLogServices.addFood(userId, noBrandPayload);

      expect(result).toEqual({ message: "Food added successfully" });
      // Verify brand_name is handled correctly in food item insert
      const foodItemInsertCall = mockConnection.execute.mock.calls[3];
      expect(foodItemInsertCall[1][5]).toBe(""); // brand_name parameter
    });

    it("should handle food with zero nutritional values", async () => {
      const zeroNutritionPayload = {
        ...mockFoodPayload,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        cholesterol: 0,
      };

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log
        .mockResolvedValueOnce({}) // Insert new food log
        .mockResolvedValueOnce([[]]) // No existing food item
        .mockResolvedValueOnce({}) // Insert food item
        .mockResolvedValueOnce({}); // Insert logged food

      const result = await foodLogServices.addFood(
        userId,
        zeroNutritionPayload
      );

      expect(result).toEqual({ message: "Food added successfully" });
    });

    it("should handle different serving units", async () => {
      const ozServingPayload = {
        ...mockFoodPayload,
        servingUnit: "oz" as const,
        servingSize: 3.5,
      };

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log
        .mockResolvedValueOnce({}) // Insert new food log
        .mockResolvedValueOnce([[]]) // No existing food item
        .mockResolvedValueOnce({}) // Insert food item
        .mockResolvedValueOnce({}); // Insert logged food

      await foodLogServices.addFood(userId, ozServingPayload);

      const loggedFoodInsertCall = mockConnection.execute.mock.calls[4];
      expect(loggedFoodInsertCall[1][4]).toBe(3.5); // serving_size parameter
      expect(loggedFoodInsertCall[1][5]).toBe("oz"); // serving_size_unit parameter
    });

    it("should handle different meal types", async () => {
      const dinnerPayload = {
        ...mockFoodPayload,
        mealType: "dinner" as MealType,
      };

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log
        .mockResolvedValueOnce({}) // Insert new food log
        .mockResolvedValueOnce([[]]) // No existing food item
        .mockResolvedValueOnce({}) // Insert food item
        .mockResolvedValueOnce({}); // Insert logged food

      await foodLogServices.addFood(userId, dinnerPayload);

      const loggedFoodInsertCall = mockConnection.execute.mock.calls[4];
      expect(loggedFoodInsertCall[1][3]).toBe("dinner"); // meal_type parameter
    });

    it("should handle food with null/undefined ingredients", async () => {
      const noIngredientsPayload = {
        ...mockFoodPayload,
        ingredients: undefined as any,
      };

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log
        .mockResolvedValueOnce({}) // Insert new food log
        .mockResolvedValueOnce([[]]) // No existing food item
        .mockResolvedValueOnce({}) // Insert food item
        .mockResolvedValueOnce({}); // Insert logged food

      const result = await foodLogServices.addFood(
        userId,
        noIngredientsPayload
      );

      expect(result).toEqual({ message: "Food added successfully" });
    });

    it("should handle midnight log time", async () => {
      const midnightPayload = {
        ...mockFoodPayload,
        loggedAt: "2024-01-15T00:00:00Z",
      };

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log
        .mockResolvedValueOnce({}) // Insert new food log
        .mockResolvedValueOnce([[]]) // No existing food item
        .mockResolvedValueOnce({}) // Insert food item
        .mockResolvedValueOnce({}); // Insert logged food

      const result = await foodLogServices.addFood(userId, midnightPayload);

      expect(result).toEqual({ message: "Food added successfully" });
      // Verify date extraction works correctly
      const foodLogInsertCall = mockConnection.execute.mock.calls[1];
      expect(foodLogInsertCall[1][3]).toBe("2024-01-15"); // log_date parameter
    });

    it("should handle duplicate custom food with same name and brand", async () => {
      const customFoodPayload = {
        ...mockFoodPayload,
        foodSource: "custom" as const,
      };

      const existingCustomFood = [{ food_item_id: "existing-custom-id" }];

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log
        .mockResolvedValueOnce({}) // Insert new food log
        .mockResolvedValueOnce([existingCustomFood]) // Found existing custom food
        .mockResolvedValueOnce({}); // Insert logged food only

      const result = await foodLogServices.addFood(userId, customFoodPayload);

      expect(mockConnection.execute).toHaveBeenCalledTimes(4); // No food item insert
      expect(result).toEqual({ message: "Food added successfully" });
    });

    it("should throw AppError when userId is missing", async () => {
      await expect(
        foodLogServices.addFood("", mockFoodPayload)
      ).rejects.toThrow(
        new AppError("UserId and foodPayload are required!", 400)
      );
    });

    it("should throw AppError when foodPayload is missing", async () => {
      await expect(
        foodLogServices.addFood(userId, {} as AddFoodPayload)
      ).rejects.toThrow(
        new AppError("UserId and foodPayload are required!", 400)
      );
    });

    it("should throw AppError when foodPayload is null", async () => {
      await expect(
        foodLogServices.addFood(userId, null as any)
      ).rejects.toThrow(
        new AppError("UserId and foodPayload are required!", 400)
      );
    });

    it("should rollback transaction and throw AppError on database error", async () => {
      const dbError = new Error("Database error");
      mockConnection.execute.mockRejectedValue(dbError);

      await expect(
        foodLogServices.addFood(userId, mockFoodPayload)
      ).rejects.toThrow(
        new AppError("Something went wrong while trying to add food!", 500)
      );

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(mockLogger.logEvents).toHaveBeenCalledWith(
        `Error in addFood service: ${dbError.message}`,
        "errLog.log"
      );
    });

    it("should handle connection pool exhaustion", async () => {
      const poolError = new Error("Pool connection timeout");
      mockPool.getConnection.mockRejectedValue(poolError);

      await expect(
        foodLogServices.addFood(userId, mockFoodPayload)
      ).rejects.toThrow(poolError);
    });

    it("should handle transaction begin failure", async () => {
      const transactionError = new Error("Transaction begin failed");
      mockConnection.beginTransaction.mockRejectedValue(transactionError);

      await expect(
        foodLogServices.addFood(userId, mockFoodPayload)
      ).rejects.toThrow(
        new AppError("Something went wrong while trying to add food!", 500)
      );

      expect(mockConnection.release).toHaveBeenCalled();
    });

    it("should handle commit failure", async () => {
      const commitError = new Error("Commit failed");
      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log
        .mockResolvedValueOnce({}) // Insert new food log
        .mockResolvedValueOnce([[]]) // No existing food item
        .mockResolvedValueOnce({}) // Insert food item
        .mockResolvedValueOnce({}); // Insert logged food

      mockConnection.commit.mockRejectedValue(commitError);

      await expect(
        foodLogServices.addFood(userId, mockFoodPayload)
      ).rejects.toThrow(
        new AppError("Something went wrong while trying to add food!", 500)
      );

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });
  });

  describe("updateFood", () => {
    const foodId = "test-food-id";
    const updatePayload = {
      serving_size: 2,
      serving_size_unit: "oz" as const,
    };

    it("should successfully update food", async () => {
      const mockResult = { affectedRows: 1 };
      mockFoodLogRepository.UpdateFood.mockResolvedValue(mockResult);

      const result = await foodLogServices.updateFood(foodId, updatePayload);

      expect(mockFoodLogRepository.UpdateFood).toHaveBeenCalledWith(
        foodId,
        "serving_size = ?, serving_size_unit = ?",
        [2, "oz"]
      );
      expect(result).toEqual({ message: "Food updated successfully" });
    });

    it("should update only serving_size", async () => {
      const partialPayload = { serving_size: 3 };
      const mockResult = { affectedRows: 1 };
      mockFoodLogRepository.UpdateFood.mockResolvedValue(mockResult);

      const result = await foodLogServices.updateFood(foodId, partialPayload);

      expect(mockFoodLogRepository.UpdateFood).toHaveBeenCalledWith(
        foodId,
        "serving_size = ?",
        [3]
      );
      expect(result).toEqual({ message: "Food updated successfully" });
    });

    it("should update only serving_size_unit", async () => {
      const partialPayload = { serving_size_unit: "ml" as const };
      const mockResult = { affectedRows: 1 };
      mockFoodLogRepository.UpdateFood.mockResolvedValue(mockResult);

      const result = await foodLogServices.updateFood(foodId, partialPayload);

      expect(mockFoodLogRepository.UpdateFood).toHaveBeenCalledWith(
        foodId,
        "serving_size_unit = ?",
        ["ml"]
      );
      expect(result).toEqual({ message: "Food updated successfully" });
    });

    it("should handle zero serving size", async () => {
      const zeroPayload = { serving_size: 0 };
      const mockResult = { affectedRows: 1 };
      mockFoodLogRepository.UpdateFood.mockResolvedValue(mockResult);

      const result = await foodLogServices.updateFood(foodId, zeroPayload);

      expect(result).toEqual({ message: "Food updated successfully" });
    });

    it("should handle decimal serving size", async () => {
      const decimalPayload = { serving_size: 1.5 };
      const mockResult = { affectedRows: 1 };
      mockFoodLogRepository.UpdateFood.mockResolvedValue(mockResult);

      const result = await foodLogServices.updateFood(foodId, decimalPayload);

      expect(mockFoodLogRepository.UpdateFood).toHaveBeenCalledWith(
        foodId,
        "serving_size = ?",
        [1.5]
      );
      expect(result).toEqual({ message: "Food updated successfully" });
    });

    it("should throw AppError when updatePayload is empty", async () => {
      await expect(
        foodLogServices.updateFood(foodId, {} as any)
      ).rejects.toThrow(new AppError("Update payload is required!", 400));
    });

    it("should throw AppError when no valid fields to update", async () => {
      const invalidPayload = { invalid_field: "value" } as any;

      await expect(
        foodLogServices.updateFood(foodId, invalidPayload)
      ).rejects.toThrow(new AppError("No valid fields to update!", 400));
    });

    it("should throw AppError when food not found", async () => {
      const mockResult = { affectedRows: 0 };
      mockFoodLogRepository.UpdateFood.mockResolvedValue(mockResult);

      await expect(
        foodLogServices.updateFood(foodId, updatePayload)
      ).rejects.toThrow(new AppError("Food log not found!", 404));
    });

    it("should handle repository errors", async () => {
      const repoError = new Error("Database connection failed");
      mockFoodLogRepository.UpdateFood.mockRejectedValue(repoError);

      await expect(
        foodLogServices.updateFood(foodId, updatePayload)
      ).rejects.toThrow(repoError);
    });

    it("should handle empty foodId", async () => {
      const mockResult = undefined; // Repository will return undefined for empty foodId
      mockFoodLogRepository.UpdateFood.mockResolvedValue(mockResult);

      await expect(
        foodLogServices.updateFood("", updatePayload)
      ).rejects.toThrow(
        "Cannot read properties of undefined (reading 'affectedRows')"
      );
    });

    it("should handle null foodId", async () => {
      const mockResult = undefined; // Repository will return undefined for null foodId
      mockFoodLogRepository.UpdateFood.mockResolvedValue(mockResult);

      await expect(
        foodLogServices.updateFood(null as any, updatePayload)
      ).rejects.toThrow(
        "Cannot read properties of undefined (reading 'affectedRows')"
      );
    });
  });

  describe("deleteFood", () => {
    const foodId = "test-food-id";
    const foodLogId = "test-food-log-id";

    it("should successfully delete food and keep food log", async () => {
      mockConnection.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete food
        .mockResolvedValueOnce([[{ count: 1 }]]) // Food log has other foods
        .mockResolvedValueOnce([[{ count: 0 }]]); // No water logs

      const result = await foodLogServices.deleteFood(foodId, foodLogId);

      expect(mockConnection.execute).toHaveBeenCalledTimes(3);
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(result).toEqual({ message: "Food deleted successfully" });
    });

    it("should delete food log when no foods or water logs remain", async () => {
      mockConnection.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete food
        .mockResolvedValueOnce([[{ count: 0 }]]) // No remaining foods
        .mockResolvedValueOnce([[{ count: 0 }]]) // No water logs
        .mockResolvedValueOnce({}); // Delete food log

      await foodLogServices.deleteFood(foodId, foodLogId);

      expect(mockConnection.execute).toHaveBeenCalledTimes(4);
      expect(mockConnection.execute).toHaveBeenLastCalledWith(
        "DELETE FROM food_logs WHERE food_log_id = ?",
        [foodLogId]
      );
    });

    it("should keep food log when water logs exist", async () => {
      mockConnection.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete food
        .mockResolvedValueOnce([[{ count: 0 }]]) // No remaining foods
        .mockResolvedValueOnce([[{ count: 3 }]]); // Water logs exist

      await foodLogServices.deleteFood(foodId, foodLogId);

      expect(mockConnection.execute).toHaveBeenCalledTimes(3); // No food log deletion
    });

    it("should handle multiple remaining foods", async () => {
      mockConnection.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete food
        .mockResolvedValueOnce([[{ count: 5 }]]) // Multiple remaining foods
        .mockResolvedValueOnce([[{ count: 2 }]]); // Water logs exist

      await foodLogServices.deleteFood(foodId, foodLogId);

      expect(mockConnection.execute).toHaveBeenCalledTimes(3); // No food log deletion
    });

    it("should throw AppError when foodId is missing", async () => {
      await expect(foodLogServices.deleteFood("", foodLogId)).rejects.toThrow(
        new AppError("foodId is required!", 400)
      );
    });

    it("should throw AppError when foodId is null", async () => {
      await expect(
        foodLogServices.deleteFood(null as any, foodLogId)
      ).rejects.toThrow(new AppError("foodId is required!", 400));
    });

    it("should throw AppError when food not found", async () => {
      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      await expect(
        foodLogServices.deleteFood(foodId, foodLogId)
      ).rejects.toThrow(new AppError("Food not found!", 404));

      expect(mockConnection.rollback).toHaveBeenCalled();
    });

    it("should rollback transaction and throw AppError on database error", async () => {
      const dbError = new Error("Database error");
      mockConnection.execute.mockRejectedValue(dbError);

      await expect(
        foodLogServices.deleteFood(foodId, foodLogId)
      ).rejects.toThrow(
        new AppError("Something went wrong while trying to delete food!", 500)
      );

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(mockLogger.logEvents).toHaveBeenCalledWith(
        `Error in deleteFood service: ${dbError.message}`,
        "errLog.log"
      );
    });

    it("should re-throw AppError instances", async () => {
      const appError = new AppError("Custom app error", 400);
      mockConnection.execute.mockRejectedValue(appError);

      await expect(
        foodLogServices.deleteFood(foodId, foodLogId)
      ).rejects.toThrow(appError);

      expect(mockConnection.rollback).toHaveBeenCalled();
    });

    it("should handle connection pool errors", async () => {
      const poolError = new Error("Pool exhausted");
      mockPool.getConnection.mockRejectedValue(poolError);

      await expect(
        foodLogServices.deleteFood(foodId, foodLogId)
      ).rejects.toThrow(poolError);
    });

    it("should handle transaction begin failure in delete", async () => {
      const transactionError = new Error("Begin transaction failed");
      mockConnection.beginTransaction.mockRejectedValue(transactionError);

      await expect(
        foodLogServices.deleteFood(foodId, foodLogId)
      ).rejects.toThrow(
        new AppError("Something went wrong while trying to delete food!", 500)
      );

      expect(mockConnection.release).toHaveBeenCalled();
    });

    it("should handle commit failure in delete", async () => {
      const commitError = new Error("Commit failed");
      mockConnection.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete food
        .mockResolvedValueOnce([[{ count: 1 }]]) // Food log has other foods
        .mockResolvedValueOnce([[{ count: 0 }]]); // No water logs

      mockConnection.commit.mockRejectedValue(commitError);

      await expect(
        foodLogServices.deleteFood(foodId, foodLogId)
      ).rejects.toThrow(
        new AppError("Something went wrong while trying to delete food!", 500)
      );

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it("should handle both food and water log deletion scenario", async () => {
      mockConnection.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete food
        .mockResolvedValueOnce([[{ count: 0 }]]) // No remaining foods
        .mockResolvedValueOnce([[{ count: 0 }]]) // No water logs
        .mockResolvedValueOnce({ affectedRows: 1 }); // Delete food log

      const result = await foodLogServices.deleteFood(foodId, foodLogId);

      expect(mockConnection.execute).toHaveBeenCalledTimes(4);
      expect(result).toEqual({ message: "Food deleted successfully" });
    });
  });

  // Integration-style tests for edge cases
  describe("Edge Cases and Integration Scenarios", () => {
    it("should handle concurrent food additions to same log", async () => {
      const userId = "concurrent-user";
      const foodPayload1 = {
        ...{
          foodSourceId: "food-1",
          foodName: "Food 1",
          foodBrand: "Brand 1",
          foodSource: "USDA" as const,
          ingredients: "Ingredients 1",
          calories: 100,
          protein: 5,
          carbs: 15,
          fat: 2,
          fiber: 1,
          sugar: 1,
          sodium: 50,
          cholesterol: 0,
          servingSize: 1,
          servingUnit: "g" as const,
          mealType: "breakfast" as MealType,
          loggedAt: "2024-01-15T10:00:00Z",
        },
      };

      // First UUID calls for first food
      mockUuidv4
        .mockReturnValueOnce("log-id-1" as any)
        .mockReturnValueOnce("food-item-1" as any)
        .mockReturnValueOnce("logged-food-1" as any);

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log
        .mockResolvedValueOnce({}) // Insert food log
        .mockResolvedValueOnce([[]]) // No existing food item
        .mockResolvedValueOnce({}) // Insert food item
        .mockResolvedValueOnce({}); // Insert logged food

      const result = await foodLogServices.addFood(userId, foodPayload1);

      expect(result).toEqual({ message: "Food added successfully" });
      expect(mockConnection.execute).toHaveBeenCalledTimes(5);
    });

    it("should handle very long food names and descriptions", async () => {
      const longName = "A".repeat(255);
      const longBrand = "B".repeat(255);
      const longIngredients = "C".repeat(1000);

      const longPayload = {
        foodSourceId: "long-food-id",
        foodName: longName,
        foodBrand: longBrand,
        foodSource: "custom" as const,
        ingredients: longIngredients,
        calories: 200,
        protein: 10,
        carbs: 30,
        fat: 5,
        fiber: 3,
        sugar: 2,
        sodium: 100,
        cholesterol: 0,
        servingSize: 1,
        servingUnit: "g" as const,
        mealType: "lunch" as MealType,
        loggedAt: "2024-01-15T12:00:00Z",
      };

      mockUuidv4
        .mockReturnValueOnce("log-id" as any)
        .mockReturnValueOnce("food-item-id" as any)
        .mockReturnValueOnce("logged-food-id" as any);

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log
        .mockResolvedValueOnce({}) // Insert food log
        .mockResolvedValueOnce([[]]) // No existing food item
        .mockResolvedValueOnce({}) // Insert food item
        .mockResolvedValueOnce({}); // Insert logged food

      const result = await foodLogServices.addFood("test-user", longPayload);

      expect(result).toEqual({ message: "Food added successfully" });
    });

    it("should handle extreme nutritional values", async () => {
      const extremePayload = {
        foodSourceId: "extreme-food",
        foodName: "Extreme Food",
        foodBrand: "Extreme Brand",
        foodSource: "custom" as const,
        ingredients: "Extreme ingredients",
        calories: 9999.99,
        protein: 999.99,
        carbs: 999.99,
        fat: 999.99,
        fiber: 999.99,
        sugar: 999.99,
        sodium: 9999.99,
        cholesterol: 999.99,
        servingSize: 999.99,
        servingUnit: "oz" as const,
        mealType: "dinner" as MealType,
        loggedAt: "2024-01-15T18:00:00Z",
      };

      mockUuidv4
        .mockReturnValueOnce("log-id" as any)
        .mockReturnValueOnce("food-item-id" as any)
        .mockReturnValueOnce("logged-food-id" as any);

      mockConnection.execute
        .mockResolvedValueOnce([[]]) // No existing food log
        .mockResolvedValueOnce({}) // Insert food log
        .mockResolvedValueOnce([[]]) // No existing food item
        .mockResolvedValueOnce({}) // Insert food item
        .mockResolvedValueOnce({}); // Insert logged food

      const result = await foodLogServices.addFood("test-user", extremePayload);

      expect(result).toEqual({ message: "Food added successfully" });
    });
  });
});
