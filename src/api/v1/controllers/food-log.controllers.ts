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
} from "../interfaces/food-log.interfaces";

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
        value: nutrient.value,
        rank: nutrient.rank,
        indentLevel: nutrient.indentLevel,
        foodNutrientId: nutrient.foodNutrientId,
      }));
  };

  return {
    macroNutrients: transformNutrients(NutrientGroups.MACRONUTRIENTS),
    basicNutrition: transformNutrients(NutrientGroups.BASIC_NUTRITION),
    vitamins: transformNutrients(NutrientGroups.VITAMINS),
    minerals: transformNutrients(NutrientGroups.MINERALS),
    bVitamins: transformNutrients(NutrientGroups.B_VITAMINS),
  };
};

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
    const apiUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodedQuery}&dataType=Branded&api_key=${process.env.FDC_API_KEY}`;

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
          foodCategory: food.foodCategory,
          ingredients: food.ingredients || undefined,
          servingSize: food.servingSize,
          servingSizeUnit: food.servingSizeUnit,
          nutrition: {
            macroNutrients: nutrients.macroNutrients,
            basicNutrition: nutrients.basicNutrition,
            vitamins: nutrients.vitamins,
            minerals: nutrients.minerals,
            bVitamins: nutrients.bVitamins,
          },
        };
      }),
      totalHits: responseData.totalHits || 0,
      currentPage: responseData.currentPage || 1,
      totalPages: responseData.totalPages || 1,
    };

    sendSuccess(res, responseData);
  } catch (err) {
    Logger.logEvents(`Error fetching food data: ${err}`, "errLog.log");
    controllerErrorResponse(res, err as CustomError);
  }
};

export default {
  searchFood,
};
