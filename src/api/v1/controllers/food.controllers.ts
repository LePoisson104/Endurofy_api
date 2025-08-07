import { Request, Response, NextFunction } from "express";
import { AppError } from "../middlewares/error.handlers";
import { sendSuccess } from "../utils/response.utils";
import Logger from "../utils/logger";
import { asyncHandler } from "../utils/async-handler";
import {
  USDAFoodNutrient,
  NutrientGroups,
} from "../interfaces/food.interfaces";
import foodServices from "../services/food.services";

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
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
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
    const apiUrl = `${process.env.USDA_URL}/fdc/v1/foods/search?query=${encodedQuery}&dataType=Branded&api_key=${process.env.FDC_API_KEY}`;

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

    const transformedData = {
      foods: responseData.foods.map((food: any) => {
        const nutrients = organizeNutrientsByGroups(food.foodNutrients || []);

        return {
          fdcId: food.fdcId,
          description: food.description,
          brandOwner: food.brandOwner || undefined,
          brandName: food.brandName || undefined,
          foodSource: "USDA",
          foodCategory: food.foodCategory,
          ingredients: food.ingredients || undefined,
          servingSize: food.servingSize,
          servingSizeUnit: food.servingSizeUnit,
          nutritions: nutrients,
        };
      }),
      totalHits: responseData.totalHits || 0,
      currentPage: responseData.currentPage || 1,
      totalPages: responseData.totalPages || 1,
    };

    // Batch check favorites if user is authenticated and there are foods
    if (transformedData.foods.length > 0) {
      try {
        const foodIds = transformedData.foods.map((food: any) =>
          food.fdcId.toString()
        );
        const favoriteStatuses = await foodServices.getFavoriteStatusBatch(
          userId,
          foodIds
        );

        // Update the foods with favorite status
        transformedData.foods = transformedData.foods.map((food: any) => ({
          ...food,
          favoriteFoodId:
            favoriteStatuses[food.fdcId.toString()].favoriteFoodId,
          isFavorite: favoriteStatuses[food.fdcId.toString()].isFavorite,
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
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const favoriteFood = await foodServices.getFavoriteFood(userId);

    sendSuccess(res, {
      message: "Favorite food retrieved successfully",
      data: favoriteFood,
    });
  }
);

const getIsFavoriteFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const { foodId } = req.params;

    const isFavorite = await foodServices.getIsFavoriteFood(userId, foodId);

    sendSuccess(res, {
      message: "Favorite food status retrieved successfully",
      data: isFavorite,
    });
  }
);

const getFavoriteStatusBatch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
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

const getCustomFood = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const customFood = await foodServices.getCustomFood(userId);

  sendSuccess(res, {
    message: "Custom food retrieved successfully",
    data: customFood,
  });
});

const getCustomFoodById = asyncHandler(async (req, res) => {
  const { foodId } = req.params;
  const customFood = await foodServices.getCustomFoodById(foodId);

  sendSuccess(res, {
    message: "Custom food retrieved successfully",
    data: customFood,
  });
});

const addFavoriteFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const payload = req.body;

    const addedFavoriteFood = await foodServices.addFavoriteFood(
      userId,
      payload
    );

    sendSuccess(res, {
      message: "Favorite food added successfully",
      data: addedFavoriteFood,
    });
  }
);

const addCustomFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const foodPayload = req.body;

    const addedCustomFood = await foodServices.addCustomFood(
      userId,
      foodPayload
    );

    sendSuccess(res, {
      message: "Custom food added successfully",
      data: addedCustomFood,
    });
  }
);

const updateCustomFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { customFoodId } = req.params;
    const updatePayload = req.body;

    const updatedCustomFood = await foodServices.updateCustomFood(
      customFoodId,
      updatePayload
    );

    sendSuccess(res, {
      message: "Custom food updated successfully",
      data: updatedCustomFood,
    });
  }
);

const deleteFavoriteFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { favFoodId } = req.params;

    const deletedFavoriteFood = await foodServices.deleteFavoriteFood(
      favFoodId
    );

    sendSuccess(res, {
      message: "Favorite food deleted successfully",
      data: deletedFavoriteFood,
    });
  }
);

const deleteCustomFood = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { customFoodId } = req.params;

    const deletedCustomFood = await foodServices.deleteCustomFood(customFoodId);

    sendSuccess(res, {
      message: "Custom food deleted successfully",
      data: deletedCustomFood,
    });
  }
);

export default {
  searchFood,
  getFavoriteFood,
  getIsFavoriteFood,
  getFavoriteStatusBatch,
  addFavoriteFood,
  deleteFavoriteFood,
  getCustomFood,
  getCustomFoodById,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
};
