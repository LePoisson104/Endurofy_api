import pool from "../../../config/db.config";

const getExercisePersonalRecord = async (
  userId: string,
  programId: string,
  programExerciseId: string
): Promise<any> => {
  const query = `
  SELECT
	wl.workout_date,
    ws.set_number,
    ws.reps_left,
    ws.reps_right,
    ws.weight,
    ws.weight_unit
  FROM workout_logs wl
  JOIN workout_exercises we 
    ON we.workout_log_id = wl.workout_log_id
  JOIN workout_sets ws
    ON ws.workout_exercise_id = we.workout_exercise_id
  WHERE wl.user_id = ?
  AND wl.program_id = ?
  AND we.program_exercise_id = ?
  ORDER BY wl.workout_date`;
  const [result] = await pool.execute(query, [
    userId,
    programId,
    programExerciseId,
  ]);
  return result;
};

const getExerciseSessionHistory = async (
  userId: string,
  programId: string,
  programExerciseId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  const query = `
  SELECT
    wl.workout_log_id,
	  wl.workout_date,
    wl.title,
    we.exercise_name,
    we.laterality,
    ws.set_number,
    ws.reps_left,
    ws.reps_right,
    ws.weight,
    ws.weight_unit
  FROM workout_logs wl
  JOIN workout_exercises we 
    ON we.workout_log_id = wl.workout_log_id
  JOIN workout_sets ws
    ON ws.workout_exercise_id = we.workout_exercise_id
  WHERE wl.user_id = ?
  AND wl.program_id = ?
  AND we.program_exercise_id = ?
  AND wl.workout_date BETWEEN ? AND ?
  ORDER BY wl.workout_date, we.exercise_order, ws.set_number`;
  const [result] = await pool.execute(query, [
    userId,
    programId,
    programExerciseId,
    startDate,
    endDate,
  ]);
  return result;
};

export default {
  getExercisePersonalRecord,
  getExerciseSessionHistory,
};
