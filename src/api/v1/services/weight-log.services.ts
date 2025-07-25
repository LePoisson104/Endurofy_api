import { AppError } from "../middlewares/error.handlers";
import { v4 as uuidv4 } from "uuid";
import WeightLogs from "../repositories/weight-log.repositories";
import {
  WeightLogResponse,
  WeightLogPayload,
} from "../interfaces/weight-log.interface";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";
import pool from "../../../config/db.config";
import Logger from "../utils/logger";

const getWeightLogDatesByRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{ data: { weightLogDates: Date[] } }> => {
  const weightLogDates = await WeightLogs.queryGetWeightLogDatesByRange(
    userId,
    startDate,
    endDate
  );

  return { data: { weightLogDates: weightLogDates } };
};

const getWeeklyWeightDifference = async (
  userId: string
): Promise<{ data: { weeklyDifference: string } }> => {
  const now = new Date();
  const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 })
    .toISOString()
    .split("T")[0];
  const endOfCurrentWeek = endOfWeek(startOfCurrentWeek, {
    weekStartsOn: 0,
  })
    .toISOString()
    .split("T")[0];
  const startOfLastWeek = subWeeks(startOfCurrentWeek, 1)
    .toISOString()
    .split("T")[0];
  const endOfLastWeek = subWeeks(endOfCurrentWeek, 1)
    .toISOString()
    .split("T")[0];

  const currentWeekWeightLogs = await WeightLogs.queryGetWeightByDate(
    userId,
    startOfCurrentWeek,
    endOfCurrentWeek
  );
  const lastWeekWeightLogs = await WeightLogs.queryGetWeightByDate(
    userId,
    startOfLastWeek,
    endOfLastWeek
  );

  if (currentWeekWeightLogs.length === 0 || lastWeekWeightLogs.length === 0) {
    return { data: { weeklyDifference: "0.00" } };
  }

  const currentWeekAvgWeight =
    currentWeekWeightLogs.reduce(
      (acc: number, curr: any) => acc + Number(curr.weight),
      0
    ) / currentWeekWeightLogs.length;
  const lastWeekAvgWeight =
    lastWeekWeightLogs.reduce(
      (acc: number, curr: any) => acc + Number(curr.weight),
      0
    ) / lastWeekWeightLogs.length;

  const weeklyDifference = currentWeekAvgWeight - lastWeekAvgWeight;

  return { data: { weeklyDifference: weeklyDifference.toFixed(2) } };
};

const getWeightLogByRange = async (
  userId: string,
  startDate?: Date,
  endDate?: Date,
  options?: "all" | "date",
  withRates?: string
): Promise<{ data: { weightLogs: WeightLogResponse[] } }> => {
  let weightLogs;
  let additionalWeekLogs = [];

  if (options === "all") {
    // For "all" option, we don't need to fetch additional week
    weightLogs = await WeightLogs.queryGetAllWeightLog(userId);
    if (withRates !== "true") {
      return { data: { weightLogs: weightLogs } };
    }
  } else if (options === "date" && startDate && endDate) {
    if (withRates !== "true") {
      weightLogs = await WeightLogs.queryGetWeightLogByDate(
        userId,
        startDate,
        endDate
      );

      return { data: { weightLogs: weightLogs } };
    }
    // First, find the start of the week for the earliest day in the requested range
    const requestStartDate = new Date(startDate);

    // Find the start of the earliest week in our request range
    const earliestWeekStart = startOfWeek(requestStartDate, {
      weekStartsOn: 0,
    });

    // Now get the start of the week before that, so we can calculate the weekly rate
    // for the earliest week in our requested range
    const extendedStartDate = new Date(earliestWeekStart);
    extendedStartDate.setDate(extendedStartDate.getDate() - 7);

    // If our request already includes days from a previous week, we need to get
    // one more week before that to calculate rates for the partial week

    // Query with extended date range
    const extendedWeightLogs = await WeightLogs.queryGetWeightLogByDate(
      userId,
      extendedStartDate,
      endDate
    );

    // Separate the logs into the requested range and the additional week
    weightLogs = extendedWeightLogs.filter((log: any) => {
      const logDate = new Date(log.log_date).toISOString().split("T")[0];
      const startDateObj = new Date(startDate).toISOString().split("T")[0];
      const endDateObj = new Date(endDate).toISOString().split("T")[0];

      return logDate >= startDateObj && logDate <= endDateObj;
    });

    additionalWeekLogs = extendedWeightLogs.filter((log: any) => {
      const logDate = new Date(log.log_date).toISOString().split("T")[0];
      const startDateObj = new Date(extendedStartDate)
        .toISOString()
        .split("T")[0];
      const dayBeforeEndDate = new Date(startDate); // Clone the endDate
      dayBeforeEndDate.setDate(dayBeforeEndDate.getDate() - 1);
      const endDateObj = dayBeforeEndDate.toISOString().split("T")[0];

      return logDate >= startDateObj && logDate <= endDateObj;
    });

    // If no logs in the requested range, return empty array
    if (weightLogs.length === 0) {
      return { data: { weightLogs: [] } };
    }

    // Group all logs by week for weekly rate calculation
    const logsByWeek: { [weekKey: string]: any[] } = {};

    extendedWeightLogs.forEach((log: any) => {
      const logDate = new Date(log.log_date);
      // Use Sunday as the start of the week to ensure 7 days per week
      const weekStart = startOfWeek(logDate, { weekStartsOn: 1 })
        .toISOString()
        .split("T")[0];

      if (!logsByWeek[weekStart]) {
        logsByWeek[weekStart] = [];
      }

      logsByWeek[weekStart].push(log);
    });

    // Calculate average weight for each week
    const weeklyAverages: { [weekKey: string]: number } = {};

    Object.keys(logsByWeek).forEach((weekKey) => {
      const logsInWeek = logsByWeek[weekKey];
      const totalWeight = logsInWeek.reduce(
        (sum: number, log: any) => sum + Number(log.weight),
        0
      );
      weeklyAverages[weekKey] = totalWeight / logsInWeek.length;
    });

    // Sort week keys chronologically
    const sortedWeekKeys = Object.keys(weeklyAverages).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
    // Process only the logs within the requested date range
    let filteredLogs = weightLogs.sort(
      (a: any, b: any) =>
        new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
    );

    // add and additional day from the extendedWeightLogs to the filteredlogs to calculate the daily rate of the starting day
    let additonalFlag = false;

    if (additionalWeekLogs.length > 0) {
      filteredLogs = [additionalWeekLogs[0], ...filteredLogs];
      additonalFlag = true;
    }

    let iteration = additonalFlag ? 1 : 0;

    const weightLogsWithRateChange = [];
    for (let i = filteredLogs.length - 1; i >= iteration; i--) {
      const currLog = filteredLogs[i];
      const prevLog = filteredLogs[i - 1];
      let weightChange = 0;

      if (prevLog) {
        const previousLogDate = new Date(
          prevLog.log_date.getFullYear(),
          prevLog.log_date.getMonth(),
          prevLog.log_date.getDate()
        );
        const currentLogDate = new Date(
          currLog.log_date.getFullYear(),
          currLog.log_date.getMonth(),
          currLog.log_date.getDate()
        );
        if (
          currentLogDate.getTime() - previousLogDate.getTime() ===
          24 * 60 * 60 * 1000
        ) {
          weightChange =
            Math.round(
              (Number(currLog.weight) - Number(prevLog.weight)) * 100
            ) / 100;
        } else {
          weightChange = 0;
        }
      }

      // Calculate weekly rate
      const currDate = new Date(currLog.log_date);

      const currWeekStart = startOfWeek(currDate, { weekStartsOn: 1 })
        .toISOString()
        .split("T")[0];

      // Find the previous week's start date
      const currWeekIndex = sortedWeekKeys.indexOf(currWeekStart);
      let weeklyRate = 0;

      const prevWeekStart = sortedWeekKeys[currWeekIndex - 1];
      const currWeekAvg = weeklyAverages[currWeekStart];
      const prevWeekAvg = weeklyAverages[prevWeekStart];

      weeklyRate = Math.round((currWeekAvg - prevWeekAvg) * 100) / 100;

      weightLogsWithRateChange.push({
        ...currLog,
        weightChange,
        weeklyRate,
      });
    }

    return { data: { weightLogs: weightLogsWithRateChange } };
  } else {
    throw new AppError("Invalid range type", 400);
  }

  // Handle the "all" option case with existing logic
  if (weightLogs.length === 0) {
    return { data: { weightLogs: [] } };
  }

  const sortedLogs = weightLogs.sort(
    (a: any, b: any) =>
      new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
  );

  // Group logs by week for weekly rate calculation
  const logsByWeek: { [weekKey: string]: any[] } = {};

  sortedLogs.forEach((log: any) => {
    const logDate = new Date(log.log_date);
    // Use Sunday as the start of the week to ensure 7 days per week
    const weekStart = startOfWeek(logDate, { weekStartsOn: 1 })
      .toISOString()
      .split("T")[0];

    if (!logsByWeek[weekStart]) {
      logsByWeek[weekStart] = [];
    }

    logsByWeek[weekStart].push(log);
  });

  // Calculate average weight for each week
  const weeklyAverages: { [weekKey: string]: number } = {};

  Object.keys(logsByWeek).forEach((weekKey) => {
    const logsInWeek = logsByWeek[weekKey];
    const totalWeight = logsInWeek.reduce(
      (sum: number, log: any) => sum + Number(log.weight),
      0
    );
    weeklyAverages[weekKey] = totalWeight / logsInWeek.length;
  });

  // Sort week keys chronologically
  const sortedWeekKeys = Object.keys(weeklyAverages).sort();

  const weightLogsWithRateChange = [];
  for (let i = weightLogs.length - 1; i >= 0; i--) {
    if (i === 0) {
      weightLogsWithRateChange.push({
        ...sortedLogs[i],
        weightChange: 0,
        weeklyRate: 0,
      });
    } else {
      const prevLog = sortedLogs[i - 1];
      const currLog = sortedLogs[i];
      let weightChange = 0;

      if (prevLog) {
        const previousLogDate = new Date(
          prevLog.log_date.getFullYear(),
          prevLog.log_date.getMonth(),
          prevLog.log_date.getDate()
        );
        const currentLogDate = new Date(
          currLog.log_date.getFullYear(),
          currLog.log_date.getMonth(),
          currLog.log_date.getDate()
        );
        if (
          currentLogDate.getTime() - previousLogDate.getTime() ===
          24 * 60 * 60 * 1000
        ) {
          weightChange =
            Math.round(
              (Number(currLog.weight) - Number(prevLog.weight)) * 100
            ) / 100;
        } else {
          weightChange = 0;
        }
      }

      // Calculate weekly rate
      const currDate = new Date(currLog.log_date);
      const currWeekStart = startOfWeek(currDate, { weekStartsOn: 1 })
        .toISOString()
        .split("T")[0];
      const currWeekIndex = sortedWeekKeys.indexOf(currWeekStart);
      const prevWeekStart = sortedWeekKeys[currWeekIndex - 1];

      let weeklyRate = 0;

      if (prevWeekStart) {
        const currWeekDate = new Date(currWeekStart);
        const prevWeekDate = new Date(prevWeekStart);

        if (
          currWeekDate.getTime() - prevWeekDate.getTime() ===
          7 * 24 * 60 * 60 * 1000
        ) {
          const currWeekAvg = weeklyAverages[currWeekStart];
          const prevWeekAvg = weeklyAverages[prevWeekStart];
          weeklyRate = Math.round((currWeekAvg - prevWeekAvg) * 100) / 100;
        } else {
          weeklyRate = 0;
        }
      }

      weightLogsWithRateChange.push({
        ...currLog,
        weightChange,
        weeklyRate,
      });
    }
  }

  return { data: { weightLogs: weightLogsWithRateChange } };
};

const createWeightLog = async (
  userId: string,
  weightLogPayload: WeightLogPayload
): Promise<{ data: { message: string } }> => {
  if (weightLogPayload.notes.length > 50) {
    throw new AppError("Notes cannot be more than 50 characters", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const isWeightLogExists = await WeightLogs.queryIsWeightLogExists(
      userId,
      weightLogPayload.logDate,
      connection
    );

    if (isWeightLogExists) {
      throw new AppError("Weight log already exists for this date", 400);
    }

    const latestWeightLog = await WeightLogs.queryGetLatestWeightLog(
      userId,
      connection
    );

    const weightLogId = uuidv4();

    await connection.execute(
      "INSERT INTO weight_log (weight_log_id, user_id, weight, weight_unit, calories_intake, notes, log_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        weightLogId,
        userId,
        weightLogPayload.weight,
        weightLogPayload.weightUnit,
        weightLogPayload.caloriesIntake,
        weightLogPayload.notes,
        weightLogPayload.logDate,
      ]
    );

    if (
      weightLogPayload.logDate.toString() ===
        new Date().toLocaleDateString("en-ca") ||
      weightLogPayload.logDate.toString() >
        new Date(latestWeightLog[0].log_date).toISOString().split("T")[0]
    ) {
      await connection.execute(
        "UPDATE users_profile SET current_weight = ?, current_weight_unit = ? WHERE user_id = ?",
        [weightLogPayload.weight, weightLogPayload.weightUnit, userId]
      );
    }

    await connection.commit();
    return {
      data: {
        message: "Weight log created successfully",
      },
    };
  } catch (err) {
    await connection.rollback();
    Logger.logEvents(`Error creating weight log: ${err}`, "errLog.log");
    if (err instanceof AppError) throw err;
    throw new AppError("Database error while creating weight log", 500);
  } finally {
    connection.release();
  }
};

const updateWeightLog = async (
  weightLogId: string,
  userId: string,
  weightLogPayload: WeightLogPayload
): Promise<{ data: { message: string } }> => {
  if (weightLogPayload.notes.length > 50) {
    throw new AppError("Notes cannot be more than 50 characters", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const weightLog = await WeightLogs.queryGetWeightLog(
      userId,
      weightLogId,
      connection
    );

    if (!weightLog) {
      throw new AppError("Weight log not found", 404);
    }

    // if the weight log date is not the same as the payload date, check if the date already exists
    if (
      weightLog &&
      weightLogPayload.logDate.toString() !==
        weightLog[0].log_date.toISOString().split("T")[0]
    ) {
      const isWeightLogExists = await WeightLogs.queryIsWeightLogExists(
        userId,
        weightLogPayload.logDate,
        connection
      );

      if (isWeightLogExists) {
        throw new AppError("Weight log already exists for this date", 400);
      }
    }

    await connection.execute(
      "UPDATE weight_log SET weight = ?, weight_unit = ?, calories_intake = ?, notes = ?, log_date = ? WHERE weight_log_id = ? AND user_id = ?",
      [
        weightLogPayload.weight,
        weightLogPayload.weightUnit,
        weightLogPayload.caloriesIntake,
        weightLogPayload.notes,
        weightLogPayload.logDate,
        weightLogId,
        userId,
      ]
    );

    if (
      weightLogPayload.logDate.toString() ===
      new Date().toLocaleDateString("en-ca")
    ) {
      await connection.execute(
        "UPDATE users_profile SET current_weight = ?, current_weight_unit = ? WHERE user_id = ?",
        [weightLogPayload.weight, weightLogPayload.weightUnit, userId]
      );
    }

    await connection.commit();

    return {
      data: {
        message: "Weight log updated successfully",
      },
    };
  } catch (err) {
    await connection.rollback();
    Logger.logEvents(`Error updating weight log: ${err}`, "errLog.log");
    if (err instanceof AppError) throw err;
    throw new AppError("Database error while updating weight log", 500);
  } finally {
    connection.release();
  }
};

const deleteWeightLog = async (
  weightLogId: string,
  userId: string
): Promise<{ data: { message: string } }> => {
  const result = await WeightLogs.queryDeleteWeightLog(weightLogId, userId);
  if (result.affectedRows === 0) {
    throw new AppError("Weight log not found", 404);
  }

  return {
    data: {
      message: "Weight log deleted successfully",
    },
  };
};

export default {
  createWeightLog,
  getWeightLogByRange,
  deleteWeightLog,
  updateWeightLog,
  getWeeklyWeightDifference,
  getWeightLogDatesByRange,
};
