import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import { User, OTP } from "../interfaces/db.models";
import Logger from "../utils/logger";

const queryCreateOtp = async (
  userId: string,
  email: string,
  hashedOTP: string,
  createdAt: string,
  expiresAt: string,
  connection?: any
): Promise<any> => {
  const query =
    "INSERT INTO otp (user_id, email, hashed_otp, created_at, expires_at) VALUES (?,?,?,?,?)";
  try {
    if (connection) {
      const [result] = await connection.execute(query, [
        userId,
        email,
        hashedOTP,
        createdAt,
        expiresAt,
      ]);
      return result;
    } else {
      const [result] = await pool.execute(query, [
        userId,
        email,
        hashedOTP,
        createdAt,
        expiresAt,
      ]);
      return result;
    }
  } catch (err) {
    await Logger.logEvents(`Error executing query: ${err}`, "errLog.log");
    throw new AppError("Database error while creating OTP", 500);
  }
};

const queryGetUserCredentials = async (
  email: string,
  connection?: any
): Promise<User[]> => {
  const query =
    "SELECT user_id, email, hashed_password, first_name, last_name, verified, pending_email FROM users WHERE email = ?";
  try {
    if (connection) {
      const [result] = await connection.execute(query, [email]);
      return result as User[];
    } else {
      const [result] = await pool.execute(query, [email]);
      return result as User[];
    }
  } catch (err) {
    await Logger.logEvents(
      `Error getting user's credentials: ${err}`,
      "errLog.log"
    );
    throw new AppError("Database error while fetching user credentials", 500);
  }
};

const queryGetUserById = async (
  userId: string,
  connection?: any
): Promise<User[]> => {
  const query = "SELECT * FROM users WHERE user_id = ?";
  try {
    if (connection) {
      const [result] = await connection.execute(query, [userId]);
      return result as User[];
    } else {
      const [result] = await pool.execute(query, [userId]);
      return result as User[];
    }
  } catch (err) {
    await Logger.logEvents(`Error getting user by id: ${err}`, "errLog.log");
    throw new AppError("Database error while fetching user by id", 500);
  }
};

const queryGetOTP = async (
  userId: string,
  connection?: any
): Promise<OTP[]> => {
  const query = "SELECT * FROM otp WHERE user_id = ?";
  try {
    if (connection) {
      const [result] = await connection.execute(query, [userId]);
      return result as OTP[];
    } else {
      const [result] = await pool.execute(query, [userId]);
      return result as OTP[];
    }
  } catch (err) {
    await Logger.logEvents(`Error getting otp: ${err}`, "errLog.log");
    throw new AppError("Database error while fetching OTP", 500);
  }
};

const queryUpdateOTP = async (
  userId: string,
  hashedOTP: string,
  createdAt: string,
  expiresAt: string,
  connection?: any
): Promise<any> => {
  const query =
    "UPDATE otp SET hashed_otp = ?, created_at = ?, expires_at = ? WHERE user_id = ?";
  try {
    if (connection) {
      const [result] = await connection.execute(query, [
        hashedOTP,
        createdAt,
        expiresAt,
        userId,
      ]);
      if ((result as any).affectedRows === 0) {
        throw new AppError("OTP not found", 404);
      }
      return result;
    } else {
      const [result] = await pool.execute(query, [
        hashedOTP,
        createdAt,
        expiresAt,
        userId,
      ]);
      if ((result as any).affectedRows === 0) {
        throw new AppError("OTP not found", 404);
      }
      return result;
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    await Logger.logEvents(`Error updating otp: ${err}`, "errLog.log");
    throw new AppError("Database error while updating OTP", 500);
  }
};

const queryDeleteOTP = async (
  userId: string,
  connection?: any
): Promise<any> => {
  const query = "DELETE FROM otp WHERE user_id = ?";
  try {
    if (connection) {
      const [result] = await connection.execute(query, [userId]);
      if ((result as any).affectedRows === 0) {
        throw new AppError("OTP not found", 404);
      }
      return result;
    } else {
      const [result] = await pool.execute(query, [userId]);
      if ((result as any).affectedRows === 0) {
        throw new AppError("OTP not found", 404);
      }
      return result;
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    await Logger.logEvents(`Error deleting otp: ${err}`, "errLog.log");
    throw new AppError("Database error while deleting OTP", 500);
  }
};

export default {
  queryGetUserCredentials,
  queryGetUserById,
  queryGetOTP,
  queryUpdateOTP,
  queryDeleteOTP,
  queryCreateOtp,
};
