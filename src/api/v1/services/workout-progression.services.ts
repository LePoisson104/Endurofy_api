import { WorkoutProgressionData } from "../interfaces/workout-progression.interface";
import workoutProgressionRepositories from "../repositories/workout-progression.repositories";

type SetData = {
  workout_log_id: string;
  workout_date: string;
  title: string;
  exercise_name: string;
  set_number: number;
  reps_left: number;
  reps_right: number;
  weight: string;
  weight_unit: string;
  laterality: "bilateral" | "unilateral";
};

type PersonalRecordData = {
  weight: number;
  weightUnit: string;
  leftReps: number;
  rightReps: number;
  reps: number;
  bestOneRepMax: number;
  initialOneRepMax: number;
};

const getPersonalRecord = async (
  userId: string,
  programId: string,
  programExerciseId: string
): Promise<PersonalRecordData | null> => {
  const sets: SetData[] =
    await workoutProgressionRepositories.getExercisePersonalRecord(
      userId,
      programId,
      programExerciseId
    );

  if (sets.length === 0) {
    return null;
  }

  const initialOneRepMax =
    parseFloat(sets[0].weight) *
    (1 + (sets[0].reps_left + sets[0].reps_right) / 2 / 30);

  let best1RM = 0;
  let bestSet: SetData | null = null;

  for (const set of sets) {
    const weight = set.weight;
    const reps = Math.max(set.reps_left, set.reps_right); // take the stronger side
    const oneRM = parseFloat(weight) * (1 + reps / 30);

    if (oneRM > best1RM) {
      best1RM = parseFloat(oneRM.toFixed(2));
      bestSet = set;
    }
  }

  if (!bestSet) {
    return {
      weight: 0,
      weightUnit: "lbs",
      leftReps: 0,
      rightReps: 0,
      reps: 0,
      bestOneRepMax: 0,
      initialOneRepMax: 0,
    };
  }

  return {
    weight: parseFloat(bestSet.weight),
    weightUnit: bestSet.weight_unit,
    leftReps: bestSet.reps_left,
    rightReps: bestSet.reps_right,
    reps: Math.max(bestSet.reps_left, bestSet.reps_right),
    bestOneRepMax: best1RM,
    initialOneRepMax: initialOneRepMax,
  };
};

const getAnalyticsData = async (
  userId: string,
  programId: string,
  programExerciseId: string,
  startDate: string,
  endDate: string
): Promise<{ data: WorkoutProgressionData | null }> => {
  const exericseSessionHistory =
    await workoutProgressionRepositories.getExerciseSessionHistory(
      userId,
      programId,
      programExerciseId,
      startDate,
      endDate
    );

  if (exericseSessionHistory.length === 0) {
    return { data: null };
  }

  const totalVolume = exericseSessionHistory.reduce(
    (acc: number, curr: SetData) => {
      return acc + parseFloat(curr.weight);
    },
    0
  );

  const sessionHistory = exericseSessionHistory.reduce(
    (acc: any, set: SetData) => {
      const id = set.workout_log_id;

      if (!acc[id]) {
        acc[id] = {
          workoutLogId: id,
          workoutDate: set.workout_date,
          title: set.title,
          exerciseName: set.exercise_name,
          laterality: set.laterality,
          sets: [],
          maxWeight: 0,
          averageWeight: 0,
          totalVolume: 0,
          weightUnit: set.weight_unit,
        };
      }

      const repsAvg = (set.reps_right + set.reps_left) / 2;
      const weightNum = Number(set.weight);

      acc[id].sets.push({
        setNumber: set.set_number,
        repsLeft: set.reps_left,
        repsRight: set.reps_right,
        reps: repsAvg,
        weight: weightNum,
        weightUnit: set.weight_unit,
      });

      // --- Update metrics ---
      const session = acc[id];

      // Max weight
      session.maxWeight = Math.max(session.maxWeight, weightNum);

      // Recalculate average weight
      const totalWeights = session.sets.reduce(
        (sum: number, s: any) => sum + s.weight,
        0
      );
      session.averageWeight = totalWeights / session.sets.length;

      // Total volume = sum of (avg reps * weight)
      session.totalVolume = session.sets.reduce(
        (sum: number, s: any) => sum + s.reps * s.weight,
        0
      );

      return acc;
    },
    {}
  );

  const volumeProgression = Object.values(sessionHistory).map(
    (session: any) => {
      return {
        date: session.workout_date,
        volume: session.sets.reduce((acc: number, curr: any) => {
          return acc + parseFloat(curr.weight);
        }, 0),
      };
    }
  );

  const totalSets = exericseSessionHistory.length;
  const weightProgression = exericseSessionHistory.map((set: SetData) => {
    return {
      date: set.workout_date,
      weight: set.weight,
      weightUnit: set.weight_unit,
      setNumber: set.set_number,
    };
  });

  return {
    data: {
      stats: {
        weightIncrease:
          weightProgression[weightProgression.length - 1].weight -
          weightProgression[0].weight,
        weightUnit: exericseSessionHistory[0].weight_unit,
        totalVolume: totalVolume,
        totalSets: totalSets,
      },
      weightProgression: weightProgression,
      volumeProgression: volumeProgression,
      sessionHistory: Object.values(sessionHistory),
    },
  };
};

export default {
  getPersonalRecord,
  getAnalyticsData,
};
