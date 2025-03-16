import { AppError } from "../middlewares/error.handlers";
import { v4 as uuidv4 } from "uuid";
import WeightLogs from "../repositories/weight-log.repositories";
import { WeightLogResponse } from "../interfaces/weight-log.interface";

const getWeightLogByDate = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{ data: { weightLogs: WeightLogResponse[] } }> => {
  const weightLogs = await WeightLogs.queryGetWeightLogByDate(
    userId,
    startDate,
    endDate
  );

  if (weightLogs.length === 0) {
    return { data: { weightLogs: [] } };
  }

  const sortedLogs = weightLogs.sort(
    (a: any, b: any) =>
      new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
  );
  const weightLogsWithRateChange = [];
  for (let i = weightLogs.length - 1; i >= 0; i--) {
    if (i === 0) {
      weightLogsWithRateChange.push({
        ...sortedLogs[i],
        rateChange: 0,
      });
    } else {
      const prevLog = sortedLogs[i - 1];
      const currLog = sortedLogs[i];
      const weightChange = Number(currLog.weight) - Number(prevLog.weight);
      const daysDiff =
        (new Date(currLog.log_date).getTime() -
          new Date(prevLog.log_date).getTime()) /
        (1000 * 60 * 60 * 24); // Convert ms to days
      const rateChange = Math.round((weightChange / daysDiff) * 100) / 100; // Rate of weight change per day
      weightLogsWithRateChange.push({
        ...currLog,
        rateChange,
      });
    }
  }

  return { data: { weightLogs: weightLogsWithRateChange } };
};

const createWeightLog = async (
  userId: string,
  weight: number,
  weightUnit: string,
  date: Date,
  caloriesIntake: number
): Promise<{ data: { message: string } }> => {
  const isWeightLogExists = await WeightLogs.queryIsWeightLogExists(
    userId,
    date
  );

  if (isWeightLogExists) {
    throw new AppError("You have already logged your weight for today", 400);
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
  getWeightLogByDate,
};
