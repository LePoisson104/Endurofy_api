import { Request, Response, NextFunction, RequestHandler } from "express";
import {
  AppError,
  controllerErrorResponse,
} from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import { sendSuccess } from "../utils/response.utils";
import Logger from "../utils/logger";
import {
  USDAFoodNutrient,
  NutrientGroups,
} from "../interfaces/food.interfaces";
import foodServices from "../services/food.services";

// Helper function to organize nutrients by groups
const organizeNutrientsByGroups = (
  foodNutrients: any[],
  servingSize: number
) => {
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
        value: Number((nutrient.value * (servingSize / 100)).toFixed(2)), // scale to the actual serving size originally per 100g/ml
        rank: nutrient.rank,
        indentLevel: nutrient.indentLevel,
        foodNutrientId: nutrient.foodNutrientId,
      }));
  };

  return {
    ...transformNutrients(NutrientGroups.BASIC_NUTRITION),
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET CONTROLLERS - SEARCH FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

const searchFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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
        const nutrients = organizeNutrientsByGroups(
          food.foodNutrients || [],
          food.servingSize
        );

        return {
          fdcId: food.fdcId,
          description: food.description,
          brandOwner: food.brandOwner || undefined,
          brandName: food.brandName || undefined,
          foodCategory: food.foodCategory,
          ingredients: food.ingredients || undefined,
          servingSize: food.servingSize,
          servingSizeUnit: food.servingSizeUnit,
          nutritions: {
            ...nutrients,
          },
        };
      }),
      totalHits: responseData.totalHits || 0,
      currentPage: responseData.currentPage || 1,
      totalPages: responseData.totalPages || 1,
    };

    sendSuccess(res, {
      message: "Food search completed successfully",
      ...transformedData,
    });
  } catch (err: any) {
    Logger.logEvents(`Error fetching food data: ${err}`, "errLog.log");
    await controllerErrorResponse(res, err as CustomError);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET CONTROLLERS - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

const getFavoriteFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;

    const favoriteFood = await foodServices.getFavoriteFood(userId);

    sendSuccess(res, {
      message: "Favorite food retrieved successfully",
      data: favoriteFood,
    });
  } catch (err: any) {
    await Logger.logEvents(
      `Error in getFavoriteFood controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

const getIsFavoriteFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const { foodId } = req.params;

    const isFavorite = await foodServices.getIsFavoriteFood(userId, foodId);

    sendSuccess(res, {
      message: "Favorite food status retrieved successfully",
      data: isFavorite,
    });
  } catch (err: any) {
    await Logger.logEvents(
      `Error in getIsFavoriteFood controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @GET CONTROLLERS - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

const getCustomFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;

    const customFood = await foodServices.getCustomFood(userId);

    sendSuccess(res, {
      message: "Custom food retrieved successfully",
      data: customFood,
    });
  } catch (err: any) {
    await Logger.logEvents(
      `Error in getCustomFood controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

const getCustomFoodById: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { foodId } = req.params;

    const customFood = await foodServices.getCustomFoodById(foodId);

    sendSuccess(res, {
      message: "Custom food retrieved successfully",
      data: customFood,
    });
  } catch (err: any) {
    await Logger.logEvents(
      `Error in getCustomFoodById controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST CONTROLLERS - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

const addFavoriteFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const foodPayload = req.body;

    const addedFavoriteFood = await foodServices.addFavoriteFood(
      userId,
      foodPayload
    );

    sendSuccess(res, {
      message: "Favorite food added successfully",
      data: addedFavoriteFood,
    });
  } catch (err: any) {
    await Logger.logEvents(
      `Error in addFavoriteFood controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @POST CONTROLLERS - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

const addCustomFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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
  } catch (err: any) {
    await Logger.logEvents(
      `Error in addCustomFood controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @PATCH CONTROLLERS - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

const updateCustomFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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
  } catch (err: any) {
    await Logger.logEvents(
      `Error in updateCustomFood controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE CONTROLLERS - FAVORITE FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

const deleteFavoriteFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { favFoodId } = req.params;

    const deletedFavoriteFood = await foodServices.deleteFavoriteFood(
      favFoodId
    );

    sendSuccess(res, {
      message: "Favorite food deleted successfully",
      data: deletedFavoriteFood,
    });
  } catch (err: any) {
    await Logger.logEvents(
      `Error in deleteFavoriteFood controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// @DELETE CONTROLLERS - CUSTOM FOOD
////////////////////////////////////////////////////////////////////////////////////////////////

const deleteCustomFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customFoodId } = req.params;

    const deletedCustomFood = await foodServices.deleteCustomFood(customFoodId);

    sendSuccess(res, {
      message: "Custom food deleted successfully",
      data: deletedCustomFood,
    });
  } catch (err: any) {
    await Logger.logEvents(
      `Error in deleteCustomFood controller: ${err.message}`,
      "errLog.log"
    );
    await controllerErrorResponse(res, err as CustomError);
  }
};

export default {
  // Search Food
  searchFood,
  // Favorite Food
  getFavoriteFood,
  getIsFavoriteFood,
  addFavoriteFood,
  deleteFavoriteFood,
  // Custom Food
  getCustomFood,
  getCustomFoodById,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
};
