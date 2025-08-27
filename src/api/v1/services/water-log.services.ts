import { v4 as uuidv4 } from "uuid";
import foodLogRepository from "../repositories/food-log.repositories";
import { AppError } from "../middlewares/error.handlers";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";
import waterLogRepository from "../repositories/water-log.repositories";

const addWater = async (
  food_log_id: string,
  water_log_id: string,
  amount: number,
  unit: string
): Promise<any> => {
  const waterLog = await waterLogRepository.AddWater(
    food_log_id,
    water_log_id,
    amount,
    unit
  );
  return waterLog;
};

export default {
  addWater,
};
