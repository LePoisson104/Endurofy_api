import { AppError } from "../middlewares/error.handlers";
import { v4 as uuidv4 } from "uuid";
import WeightLogs from "../repositories/weight-log.repositories";

const createWeightLog = async (
  userId: string,
  weight: number,
  weightUnit: string,
  caloriesIntake: number,
  date: Date
): Promise<{ data: { message: string } }> => {
  const isWeightLogExists = await WeightLogs.queryIsWeightLogExists(
    userId,
    date
  );

  if (isWeightLogExists) {
    throw new AppError("You have already logged your weight for today", 400);
  }

  if (!caloriesIntake) {
    // TODO: Calculate calories intake from users bmr and activity level (default amount)
    caloriesIntake = 0;
  }

  const weightLogId = uuidv4();
  await WeightLogs.queryCreateWeightLog(
    weightLogId,
    userId,
    weight,
    weightUnit,
    caloriesIntake,
    date
  );
  return {
    data: {
      message: "Weight log created successfully",
    },
  };
};

export default {
  createWeightLog,
};
