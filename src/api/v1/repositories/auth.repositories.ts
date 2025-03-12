import pool from "../../../config/db.config";
import { AppError } from "../middlewares/error.handlers";
import { User, OTP, DB_ERROR_CODES } from "../interfaces/db.models";

const queryCreateNewUser = async (
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
  hashedPassword: string
): Promise<any> => {
  const query =
    "INSERT INTO users (user_id, email, hashed_password, first_name, last_name) values (?,?,?,?,?)";

  try {
    const [result] = await pool.execute(query, [
      userId,
      email,
      hashedPassword,
      firstName,
      lastName,
    ]);
    return result;
  } catch (err: any) {
    console.error("Error executing query: ", err);
    if (err.code === DB_ERROR_CODES.DUPLICATE_ENTRY) {
      throw new AppError("Email already registered", 409);
    }
    throw new AppError("Database error while creating user", 500);
  }
};

const queryGetUserCredentials = async (email: string): Promise<User[]> => {
  const query =
    "SELECT user_id, email, hashed_password, first_name, last_name, verified FROM users WHERE email = ?";
  try {
    const [result] = await pool.execute(query, [email]);
    return result as User[];
  } catch (err) {
    console.error("Error getting user's credentials", err);
    throw new AppError("Database error while fetching user credentials", 500);
  }
};

const queryGetOTP = async (userId: string): Promise<OTP[]> => {
  const query = "SELECT * FROM otp WHERE user_id = ?";
  try {
    const [result] = await pool.execute(query, [userId]);
    return result as OTP[];
  } catch (err) {
    console.log("Error getting otp", err);
    throw new AppError("Database error while fetching OTP", 500);
  }
};

const queryUpdateOTP = async (
  userId: string,
  hashedOTP: string,
  createdAt: string,
  expiresAt: string
): Promise<any> => {
  const query =
    "UPDATE otp SET hashed_otp = ?, created_at = ?, expires_at = ? WHERE user_id = ?";
  try {
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
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("Error updating otp", err);
    throw new AppError("Database error while updating OTP", 500);
  }
};

const queryDeleteOTP = async (userId: string): Promise<any> => {
  const query = "DELETE FROM otp WHERE user_id = ?";
  try {
    const [result] = await pool.execute(query, [userId]);
    if ((result as any).affectedRows === 0) {
      throw new AppError("OTP not found", 404);
    }
    return result;
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("Error deleting otp", err);
    throw new AppError("Database error while deleting OTP", 500);
  }
};

export default {
  queryCreateNewUser,
  queryGetUserCredentials,
  queryGetOTP,
  queryUpdateOTP,
  queryDeleteOTP,
};
