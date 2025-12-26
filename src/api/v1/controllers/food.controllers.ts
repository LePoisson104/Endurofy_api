import { Response, NextFunction } from "express";
import { AppError } from "../middlewares/error.handlers";
import { sendSuccess } from "../utils/response.utils";
import Logger from "../utils/logger";
import { asyncHandler } from "../utils/async-handler";
import {
  USDAFoodNutrient,
  NutrientGroups,
  USDABrandedFoodNutrientID,
  USDAFoundationFoodNutrientID,
} from "../interfaces/food.interfaces";
import foodServices from "../services/food.services";
import { AuthenticatedRequest } from "../interfaces/request.interfaces";

// Helper function to organize nutrients by groups
const organizeNutrientsByGroups = (foodNutrients: any[]) => {
  const nutrientMap = new Map<number, any>();
  foodNutrients.forEach((nutrient) => {
    nutrientMap.set(nutrient.nutrientId, nutrient);
  });

  const transformNutrients = (
    nutrientIds: readonly number[]
  ): USDAFoodNutrient[] => {
    return nutrientIds
      .map((id) => nutrientMap.get(id))
      .filter((nutrient) => nutrient !== undefined)
      .map((nutrient) => ({
        nutrientId: nutrient.nutrientId,
        nutrientName: nutrient.nutrientName,
        nutrientNumber: nutrient.nutrientNumber,
        unitName: nutrient.unitName,
        value: nutrient.value, // per 100g/ml
        rank: nutrient.rank,
        indentLevel: nutrient.indentLevel,
        foodNutrientId: nutrient.foodNutrientId,
      }));
  };

  return transformNutrients(NutrientGroups.BASIC_NUTRITION);
};

const searchFood = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const searchItem = req.params.searchItem;

    // Check if API key exists
    if (!process.env.FDC_API_KEY) {
      Logger.logEvents("FDC_API_KEY not configured", "errLog.log");
      throw new AppError(
        "API configuration error",
        500,
        "API_CONFIGURATION_ERROR"
      );
    }

    // Build the API URL with proper encoding
    const encodedQuery = encodeURIComponent(searchItem.trim().toLowerCase());
    const apiUrl = `${process.env.USDA_URL}/fdc/v1/foods/search?query=${encodedQuery}&dataType=Branded,Foundation&api_key=${process.env.FDC_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "FoodLogApp/1.0",
      },
    });
    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 403) {
        Logger.logEvents("USDA API key invalid or expired", "errLog.log");
        throw new AppError(
          "External service temporarily unavailable",
          503,
          "EXTERNAL_SERVICE_TEMPORARILY_UNAVAILABLE"
        );
      }

      if (response.status === 429) {
        Logger.logEvents("USDA API rate limit exceeded", "errLog.log");
        throw new AppError(
          "Too many requests, please try again later",
          429,
          "TOO_MANY_REQUESTS"
        );
      }

      throw new AppError(
        `USDA API error: ${response.status} - ${response.statusText}`,
        response.status,
        "USDA_API_ERROR"
      );
    }

    const responseData = await response.json();
    // Validate response structure
    if (
      !responseData ||
      !responseData.foods ||
      !Array.isArray(responseData.foods)
    ) {
      Logger.logEvents(
        "Invalid response structure from USDA API",
        "errLog.log"
      );
      throw new AppError(
        "Invalid response from external service",
        502,
        "INVALID_RESPONSE_FROM_EXTERNAL_SERVICE"
      );
    }

    // Transform foods and remove duplicates
    const transformedFoods = responseData.foods
      .filter((food: any) => food.fdcId) // Filter out foods without fdcId
      .map((food: any) => {
        const nutrients = organizeNutrientsByGroups(food.foodNutrients || []);
        const isFoundationFood = food.dataType === "Foundation";

        const getNutrientValue = (
          brandedId: number,
          foundationId?: number
        ): number => {
          // For Foundation foods, try foundation ID first if provided
          if (isFoundationFood && foundationId) {
            const foundationNutrient = nutrients.find(
              (n) => n.nutrientId === foundationId
            );
            if (foundationNutrient !== undefined) {
              return typeof foundationNutrient.value === "number"
                ? Number(foundationNutrient.value) > 0
                  ? foundationNutrient.value
                  : 0
                : 0;
            }
          }

          // Try branded nutrient ID (or fallback for Foundation foods)
          const nutrient = nutrients.find((n) => n.nutrientId === brandedId);

          if (nutrient === undefined) {
            // Last resort: try foundation ID if we haven't already
            if (!isFoundationFood && foundationId) {
              const foundationNutrient = nutrients.find(
                (n) => n.nutrientId === foundationId
              );
              return typeof foundationNutrient?.value === "number"
                ? Number(foundationNutrient.value) > 0
                  ? foundationNutrient.value
                  : 0
                : 0;
            }
            return 0;
          }

          const value =
            typeof nutrient?.value === "number"
              ? Number(nutrient.value) > 0
                ? nutrient.value
                : 0
              : 0;

          return value;
        };

        return {
          foodId: String(food.fdcId),
          foodName: food.description,
          foodBrand:
            food.dataType === "Foundation"
              ? "Foundation Food Item"
              : food.brandOwner || "",
          ingredients: food.ingredients || undefined,
          foodSource: "usda",
          calories: getNutrientValue(
            USDABrandedFoodNutrientID.CALORIES,
            USDAFoundationFoodNutrientID.CALORIES
          ),
          protein: getNutrientValue(USDABrandedFoodNutrientID.PROTEIN),
          carbs: getNutrientValue(USDABrandedFoodNutrientID.CARBOHYDRATE),
          fat: getNutrientValue(USDABrandedFoodNutrientID.FAT),
          fiber: getNutrientValue(USDABrandedFoodNutrientID.FIBER),
          sugar: getNutrientValue(USDABrandedFoodNutrientID.TOTAL_SUGARS),
          sodium: getNutrientValue(USDABrandedFoodNutrientID.SODIUM),
          cholesterol: getNutrientValue(
            USDABrandedFoodNutrientID.CHOLESTEROL,
            USDAFoundationFoodNutrientID.CHOLESTEROL
          ),
          servingSize: 100,
          servingSizeUnit: food.servingSizeUnit,
          favoriteFoodId: null,
          isFavorite: false,
        };
      });

    // Remove duplicates based on foodId first
    const uniqueByIdMap = new Map();
    transformedFoods.forEach((food: any) => {
      if (!uniqueByIdMap.has(food.foodId)) {
        uniqueByIdMap.set(food.foodId, food);
      }
    });

    // Then remove duplicates by foodName + foodBrand combination
    const uniqueByNameMap = new Map();
    Array.from(uniqueByIdMap.values()).forEach((food: any) => {
      const key = `${food.foodName.toLowerCase().trim()}|${(
        food.foodBrand || ""
      )
        .toLowerCase()
        .trim()}`;
      if (!uniqueByNameMap.has(key)) {
        uniqueByNameMap.set(key, food);
      }
    });

    const uniqueFoods = Array.from(uniqueByNameMap.values());

    const transformedData = {
      foods: uniqueFoods,
      totalHits: responseData.totalHits || 0,
      currentPage: responseData.currentPage || 1,
      totalPages: responseData.totalPages || 1,
    };

    // Batch check favorites if user is authenticated and there are foods
    if (transformedData.foods.length > 0) {
      try {
        const foodIds = transformedData.foods.map((food: any) => food.foodId);
        const favoriteStatuses = await foodServices.getFavoriteStatusBatch(
          userId,
          foodIds
        );
        // Update the foods with favorite status
        transformedData.foods = transformedData.foods.map((food: any) => ({
          ...food,
          favoriteFoodId: favoriteStatuses[food.foodId]?.favoriteFoodId,
          isFavorite: favoriteStatuses[food.foodId]?.isFavorite,
        }));
      } catch (error) {
        // Log error but don't fail the search - just return without favorite status
        Logger.logEvents(
          `Error checking favorites in search: ${error}`,
          "errLog.log"
        );
      }
    }

    sendSuccess(res, {
      message: "Food search completed successfully",
      ...transformedData,
    });
  }
);

const getFavoriteFood = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const favoriteFood = await foodServices.getFavoriteFood(userId);

    sendSuccess(res, {
      message: "Favorite food retrieved successfully",
      favoriteFood: favoriteFood,
    });
  }
);

const getIsFavoriteFood = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const { foodId } = req.params;

    const isFavorite = await foodServices.getIsFavoriteFood(userId, foodId);

    sendSuccess(res, {
      message: "Favorite food status retrieved successfully",
      data: isFavorite,
    });
  }
);

const getFavoriteStatusBatch = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const { foodIds } = req.body;

    const favoriteStatuses = await foodServices.getFavoriteStatusBatch(
      userId,
      foodIds
    );

    sendSuccess(res, {
      message: "Favorite status batch retrieved successfully",
      data: favoriteStatuses,
    });
  }
);

const getRecentFood = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const recentFood = await foodServices.getRecentFoodItems(userId);

    sendSuccess(res, {
      message: "Favorite status batch retrieved successfully",
      data: recentFood,
    });
  }
);

const getCustomFood = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const customFood = await foodServices.getCustomFood(userId);

    sendSuccess(res, {
      message: "Custom food retrieved successfully",
      customFood: customFood,
    });
  }
);

const addFavoriteFood = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const payload = req.body;

    const addedFavoriteFood = await foodServices.addFavoriteFood(
      userId,
      payload
    );

    sendSuccess(res, {
      message: addedFavoriteFood.message,
    });
  }
);

const addCustomFood = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const foodPayload = req.body;

    const addedCustomFood = await foodServices.addCustomFood(
      userId,
      foodPayload
    );

    sendSuccess(res, {
      message: addedCustomFood.message,
    });
  }
);

const updateCustomFood = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const { foodItemId } = req.params;
    const updatePayload = req.body;

    console.log(updatePayload);

    const updatedCustomFood = await foodServices.updateCustomFood(
      userId,
      foodItemId,
      updatePayload
    );

    sendSuccess(res, {
      message: updatedCustomFood.message,
    });
  }
);

const deleteFavoriteFood = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const { favFoodId } = req.params;

    const deletedFavoriteFood = await foodServices.deleteFavoriteFood(
      userId,
      favFoodId
    );

    sendSuccess(res, {
      message: deletedFavoriteFood.message,
    });
  }
);

const deleteCustomFood = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const { foodItemId } = req.params;

    const deletedCustomFood = await foodServices.deleteCustomFood(
      userId,
      foodItemId
    );

    sendSuccess(res, {
      message: deletedCustomFood.message,
    });
  }
);

export default {
  searchFood,
  getFavoriteFood,
  getIsFavoriteFood,
  getFavoriteStatusBatch,
  getRecentFood,
  addFavoriteFood,
  deleteFavoriteFood,
  getCustomFood,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
};
