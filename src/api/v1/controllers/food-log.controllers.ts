import { Request, Response, NextFunction, RequestHandler } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import { sendSuccess } from "../utils/response.utils";
import Logger from "../utils/logger";

const searchFood: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const searchItem = req.params.searchItem;

    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${searchItem}&api_key=${process.env.FDC_API_KEY}`
    );
    const data = await response.json();

    sendSuccess(res, data);
  } catch (err) {
    Logger.logEvents(`Error fetching food data: ${err}`, "errLog.log");
    controllerErrorResponse(res, err as CustomError);
  }
};

export default {
  searchFood,
};
